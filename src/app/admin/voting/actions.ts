"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canManageVoting } from "@/lib/auth/roles";
import { getCurrentRoles, getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/admin/audit";
import { broadcast } from "@/lib/realtime/broadcast";
import { checkPollAchievement } from "@/lib/achievements/award";

const POLL_STATUSES = ["DRAFT", "OPEN", "CLOSED", "REVEALED"] as const;

/**
 * Product Guide §11.3: "Admins can press Reveal Results" / §26 Phase 9:
 * "Reveal can happen live." One action for every status transition
 * (open/close/reveal), same pattern as updateMissionStatus — each change
 * is audited.
 */
export async function updatePollStatus(formData: FormData) {
  const actor = await getCurrentUser();
  if (!actor) redirect("/login");

  const roles = await getCurrentRoles();
  if (!canManageVoting(roles)) {
    redirect("/admin/voting?error=not_authorized");
  }

  const pollId = formData.get("pollId");
  const status = formData.get("status");

  if (typeof pollId !== "string" || typeof status !== "string") {
    redirect("/admin/voting?error=invalid_input");
  }
  if (!POLL_STATUSES.includes(status as (typeof POLL_STATUSES)[number])) {
    redirect("/admin/voting?error=invalid_input");
  }

  const admin = createAdminClient();
  const { data: before } = await admin.from("polls").select("status, title").eq("id", pollId).maybeSingle();

  const { error } = await admin.from("polls").update({ status }).eq("id", pollId);
  if (error) {
    redirect("/admin/voting?error=update_failed");
  }

  await logAdminActivity(admin, {
    actorId: actor.id,
    action: "poll_status_changed",
    targetType: "poll",
    targetId: pollId,
    metadata: { title: before?.title, previous_status: before?.status, new_status: status },
  });

  // Phase 11: the player-facing vote page and this admin list both
  // live-refresh — an OPEN poll appears without reload, a REVEALED one
  // shows counts immediately.
  await broadcast(`poll:${pollId}`, "poll.updated");

  if (status === "REVEALED") {
    // Product Guide §17's "crowd_favorite" achievement — only meaningful
    // for a nomination-style poll with a real candidate_player_id; a
    // no-op for an ordinary informational poll.
    await checkPollAchievement(admin, pollId);
  }

  revalidatePath("/admin/voting");
  redirect("/admin/voting?success=1");
}
