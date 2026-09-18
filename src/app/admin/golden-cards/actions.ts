"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { allocateGoldenCardSchema } from "@/lib/goldenCards/schemas";
import { canManageGoldenCards } from "@/lib/auth/roles";
import { getCurrentRoles, getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/admin/audit";

export type AllocateGoldenCardState = { error?: string; success?: string } | null;

/**
 * "Chairman's Egg" golden cards — see the golden_cards migration's header
 * comment for the full design. A short, random, server-generated code
 * (never client-supplied, so it can't be predicted or pre-chosen) is what
 * the carrier gives out in person; claimGoldenCard (src/app/(player)/play/
 * goldenCardActions.ts) is the only thing that ever changes a card's
 * status after this.
 */
function generateCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I - easier to read aloud
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export async function allocateGoldenCard(
  _prevState: AllocateGoldenCardState,
  formData: FormData,
): Promise<AllocateGoldenCardState> {
  const actor = await getCurrentUser();
  if (!actor) redirect("/login");

  const roles = await getCurrentRoles();
  if (!canManageGoldenCards(roles)) {
    return { error: "You are not authorized to allocate golden cards." };
  }

  const parsed = allocateGoldenCardSchema.safeParse({
    gameDayId: formData.get("gameDayId"),
    carrierId: formData.get("carrierId"),
    bonusPoints: formData.get("bonusPoints"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { gameDayId, carrierId, bonusPoints } = parsed.data;

  const admin = createAdminClient();

  const { data: carrier } = await admin.from("profiles").select("id, status").eq("id", carrierId).maybeSingle();
  if (!carrier || carrier.status !== "ACTIVE") {
    return { error: "That player doesn't exist or isn't active." };
  }

  const { data: day } = await admin.from("game_days").select("id, day_number").eq("id", gameDayId).maybeSingle();
  if (!day) {
    return { error: "That day doesn't exist." };
  }

  // A code collision is astronomically unlikely (33^6 ≈ 1.3 billion) but
  // the unique constraint is the real backstop - retry once on the off
  // chance rather than trusting probability alone.
  let code = generateCode();
  let insertResult = await admin
    .from("golden_cards")
    .insert({ game_day_id: gameDayId, carrier_id: carrierId, code, bonus_points: bonusPoints, created_by: actor.id })
    .select("id")
    .single();
  if (insertResult.error?.code === "23505") {
    code = generateCode();
    insertResult = await admin
      .from("golden_cards")
      .insert({ game_day_id: gameDayId, carrier_id: carrierId, code, bonus_points: bonusPoints, created_by: actor.id })
      .select("id")
      .single();
  }
  if (insertResult.error || !insertResult.data) {
    return { error: "Could not allocate the golden card. Try again." };
  }

  await logAdminActivity(admin, {
    actorId: actor.id,
    action: "golden_card_allocated",
    targetType: "golden_card",
    targetId: insertResult.data.id,
    metadata: { day_number: day.day_number, carrier_id: carrierId, bonus_points: bonusPoints },
  });

  revalidatePath("/admin/golden-cards");
  return { success: `Card allocated. Code: ${code}` };
}

/**
 * Lets an admin cancel a card before it's found (e.g. the carrier left
 * for the day, or it was allocated by mistake) - an explicit, audited
 * action rather than silently deleting the row, matching Product Guide
 * §18.3's "safe editing of live content" precedent.
 */
export async function expireGoldenCard(formData: FormData) {
  const actor = await getCurrentUser();
  if (!actor) redirect("/login");

  const roles = await getCurrentRoles();
  if (!canManageGoldenCards(roles)) {
    redirect("/admin/golden-cards?error=not_authorized");
  }

  const cardId = formData.get("cardId");
  if (typeof cardId !== "string") {
    redirect("/admin/golden-cards?error=invalid_input");
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("golden_cards")
    .update({ status: "EXPIRED" })
    .eq("id", cardId)
    .eq("status", "ACTIVE");

  if (!error) {
    await logAdminActivity(admin, {
      actorId: actor.id,
      action: "golden_card_expired",
      targetType: "golden_card",
      targetId: cardId,
    });
  }

  revalidatePath("/admin/golden-cards");
  redirect("/admin/golden-cards");
}
