"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { awardBonusPointsSchema } from "@/lib/scoring/schemas";
import { canAwardBonusPoints } from "@/lib/auth/roles";
import { getCurrentRoles, getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export type AwardBonusPointsState = { error?: string; success?: boolean } | null;

/**
 * Product Guide §10.2: admin bonus points. "Required reason... Confirmation
 * modal... Audit log entry." Game Master/Super Admin only. Every award
 * (positive or negative — a penalty is just a negative award) is a real
 * score_events row, never a mutation of a stored total, satisfying §26
 * Phase 8's "every point can be traced to a source/reason" acceptance.
 */
export async function awardBonusPoints(
  _prevState: AwardBonusPointsState,
  formData: FormData,
): Promise<AwardBonusPointsState> {
  const actor = await getCurrentUser();
  if (!actor) redirect("/login");

  const roles = await getCurrentRoles();
  if (!canAwardBonusPoints(roles)) {
    return { error: "You are not authorized to award points." };
  }

  const parsed = awardBonusPointsSchema.safeParse({
    playerId: formData.get("playerId"),
    points: formData.get("points"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { playerId, points, reason } = parsed.data;
  const admin = createAdminClient();

  const { data: player } = await admin.from("profiles").select("id").eq("id", playerId).maybeSingle();
  if (!player) {
    return { error: "That player doesn't exist." };
  }

  const { error: insertError } = await admin.from("score_events").insert({
    player_id: playerId,
    points,
    point_type: points >= 0 ? "BONUS" : "PENALTY",
    source_type: "ADMIN_MANUAL",
    reason,
    created_by: actor.id,
  });

  if (insertError) {
    return { error: "Could not award points. Try again." };
  }

  await admin.from("audit_logs").insert({
    actor_id: actor.id,
    action: "bonus_points_awarded",
    target_type: "profile",
    target_id: playerId,
    metadata: { points, reason },
  });

  revalidatePath("/admin/scoring");
  revalidatePath("/leaderboards");
  return { success: true };
}
