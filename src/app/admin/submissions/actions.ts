"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { moderateSubmissionSchema } from "@/lib/content/schemas";
import { canModerateSubmissions } from "@/lib/auth/roles";
import { getCurrentRoles, getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/admin/audit";
import { broadcast } from "@/lib/realtime/broadcast";
import { checkMissionAchievements } from "@/lib/achievements/award";

/**
 * Product Guide §12.2 (media/moderation flow) + §26 Phase 10 acceptance:
 * "Unapproved media never appears on public/event surfaces." Approval is
 * the ONLY path that ever awards points for FREE_TEXT/PHOTO_UPLOAD
 * submissions (SINGLE_CHOICE/MULTIPLE_CHOICE auto-score at submit time —
 * see src/app/(player)/play/mission/[missionId]/actions.ts — because
 * correctness there is objectively checkable; these two types need a human
 * because they aren't).
 */
export async function moderateSubmission(formData: FormData) {
  const actor = await getCurrentUser();
  if (!actor) redirect("/login");

  const roles = await getCurrentRoles();
  if (!canModerateSubmissions(roles)) {
    redirect("/admin/submissions?error=not_authorized");
  }

  const parsed = moderateSubmissionSchema.safeParse({
    submissionId: formData.get("submissionId"),
    decision: formData.get("decision"),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    redirect("/admin/submissions?error=invalid_input");
  }

  const { submissionId, decision, note } = parsed.data;
  const admin = createAdminClient();

  const { data: submission } = await admin
    .from("submissions")
    .select("id, status, player_id, challenge_id")
    .eq("id", submissionId)
    .maybeSingle();

  if (!submission) {
    redirect("/admin/submissions?error=not_found");
  }
  if (submission.status !== "PENDING") {
    // Already moderated — avoid double-awarding points on a second click.
    redirect("/admin/submissions?error=already_moderated");
  }

  // Scoring integrity (found by a dedicated security review, Product
  // Guide §33.3: "Duplicate completion does not double-pay unless
  // configured"): the `status !== "PENDING"` check above only stops a
  // second click on *this* submission — it didn't stop a player from
  // submitting the same FREE_TEXT/PHOTO_UPLOAD challenge multiple times
  // and a moderator approving more than one, each paying full points
  // again. Checked here, before this submission's own status flips to
  // APPROVED below, against every *other* submission for the same
  // challenge/player — same rule as the identical guard in
  // src/app/(player)/play/mission/[missionId]/actions.ts.
  const { count: alreadyApprovedCount } = await admin
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("challenge_id", submission.challenge_id)
    .eq("player_id", submission.player_id)
    .eq("status", "APPROVED");
  const alreadyAwarded = (alreadyApprovedCount ?? 0) > 0;

  const newStatus = decision === "APPROVE" ? "APPROVED" : "REJECTED";
  const { error: updateError } = await admin
    .from("submissions")
    .update({
      status: newStatus,
      moderated_by: actor.id,
      moderated_at: new Date().toISOString(),
      moderation_note: note || null,
    })
    .eq("id", submissionId);

  if (updateError) {
    redirect("/admin/submissions?error=update_failed");
  }

  let pointsAwarded = false;
  if (decision === "APPROVE") {
    const { data: challenge } = await admin
      .from("challenges")
      .select("mission_id")
      .eq("id", submission.challenge_id)
      .maybeSingle();

    const { data: mission } = challenge
      ? await admin
          .from("missions")
          .select("id, base_points, unity_points, is_unity_challenge")
          .eq("id", challenge.mission_id)
          .maybeSingle()
      : { data: null };

    if (mission && !alreadyAwarded) {
      if (mission.base_points > 0) {
        await admin.from("score_events").insert({
          player_id: submission.player_id,
          points: mission.base_points,
          point_type: "MISSION_COMPLETED",
          source_type: "SUBMISSION",
          source_id: submission.id,
          reason: "Submission approved by moderator",
          created_by: actor.id,
        });
        pointsAwarded = true;
      }
      if (mission.is_unity_challenge && mission.unity_points > 0) {
        await admin.from("score_events").insert({
          player_id: submission.player_id,
          points: mission.unity_points,
          point_type: "UNITY_PARTNER_VERIFIED",
          source_type: "SUBMISSION",
          source_id: submission.id,
          reason: "Cross-country unity challenge approved",
          created_by: actor.id,
        });
        pointsAwarded = true;
      }
    }
  }

  await logAdminActivity(admin, {
    actorId: actor.id,
    action: decision === "APPROVE" ? "submission_approved" : "submission_rejected",
    targetType: "submission",
    targetId: submissionId,
    metadata: { note },
  });

  // Phase 11: leaderboard/gallery pages live-refresh instead of needing a
  // reload — same "ping only, refetch for real data" rule as every other
  // broadcast (see src/lib/realtime/broadcast.ts).
  if (pointsAwarded) {
    await broadcast("leaderboard", "points.awarded");
    // Product Guide §17 — same real-score_events-derived check as the
    // auto-graded path in play/mission/[missionId]/actions.ts.
    await checkMissionAchievements(admin, submission.player_id);
  }
  if (decision === "APPROVE") {
    await broadcast("gallery", "submission.approved");
  }

  revalidatePath("/admin/submissions");
  revalidatePath("/leaderboards");
  revalidatePath("/gallery");
  redirect("/admin/submissions?success=1");
}
