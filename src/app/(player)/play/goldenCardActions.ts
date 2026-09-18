"use server";

import { revalidatePath } from "next/cache";
import { claimGoldenCardSchema } from "@/lib/goldenCards/schemas";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/admin/audit";

export type ClaimGoldenCardState = { error?: string; success?: string } | null;

/**
 * "Chairman's Egg" — a player found a real carrier in person and was
 * given their code. This is the only place a golden_cards row can ever
 * change status after allocation (see the golden_cards migration's own
 * header comment) - the whole mechanic depends on nobody being able to
 * browse ACTIVE cards, only submit a code and find out if it's real.
 *
 * Real, server-authoritative points on both sides, exactly the same
 * "never let a client claim its own reward" discipline as every other
 * scoring path in this app: a real score_events row for the finder, and
 * a smaller one for the carrier for being found, written together so
 * either both happen or neither does.
 */
export async function claimGoldenCard(
  _prevState: ClaimGoldenCardState,
  formData: FormData,
): Promise<ClaimGoldenCardState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You need to be signed in." };
  }

  const parsed = claimGoldenCardSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid code" };
  }

  const admin = createAdminClient();
  const { data: card } = await admin
    .from("golden_cards")
    .select("id, carrier_id, bonus_points, status")
    .eq("code", parsed.data.code)
    .maybeSingle();

  if (!card || card.status !== "ACTIVE") {
    return { error: "That code isn't valid right now — double check it with them." };
  }
  if (card.carrier_id === user.id) {
    return { error: "You can't claim your own card." };
  }

  const { error: updateError } = await admin
    .from("golden_cards")
    .update({ status: "CLAIMED", claimed_by: user.id, claimed_at: new Date().toISOString() })
    .eq("id", card.id)
    .eq("status", "ACTIVE"); // re-check status in the same write - two players can't both win a race on the same card

  if (updateError) {
    return { error: "Something went wrong claiming that card. Try again." };
  }

  const carrierBonus = Math.round(card.bonus_points / 2);
  await admin.from("score_events").insert([
    {
      player_id: user.id,
      points: card.bonus_points,
      point_type: "BONUS",
      source_type: "GOLDEN_CARD",
      source_id: card.id,
      reason: "Found the Chairman's Egg carrier",
      created_by: user.id,
    },
    {
      player_id: card.carrier_id,
      points: carrierBonus,
      point_type: "BONUS",
      source_type: "GOLDEN_CARD",
      source_id: card.id,
      reason: "Was found while carrying the Chairman's Egg",
      created_by: user.id,
    },
  ]);

  await logAdminActivity(admin, {
    actorId: user.id,
    action: "golden_card_claimed",
    targetType: "golden_card",
    targetId: card.id,
    metadata: { bonus_points: card.bonus_points },
  });

  // /play now derives its own "found them" confirmation from a fresh
  // server read (a real, persistent golden_cards row), not this action's
  // own transient useActionState return value - the same class of bug
  // already found and fixed once in this project (the mission page's
  // "already completed" branch, Phase 12 write-up), where a
  // revalidatePath-triggered re-render could remount a client form and
  // swap out its own transient success message before the player read
  // it. Revalidating here now just makes that server-derived banner
  // appear immediately instead of on the next natural reload.
  revalidatePath("/play");
  revalidatePath("/leaderboards");
  return { success: `Found them! +${card.bonus_points} points.` };
}
