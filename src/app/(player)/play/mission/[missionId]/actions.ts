"use server";

import { revalidatePath } from "next/cache";
import { submitAnswerSchema } from "@/lib/content/schemas";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { broadcast } from "@/lib/realtime/broadcast";
import { isGamePaused } from "@/lib/game/campaignStatus";
import { checkMissionAchievements } from "@/lib/achievements/award";

export type SubmitAnswerState = {
  error?: string;
  success?: { message: string; pointsAwarded?: number };
} | null;

/**
 * Product Guide §26 Phase 7 acceptance: "deadline and attempt rules are
 * server-authoritative." Every check here (mission status, deadline,
 * attempt count, correctness) runs against the service-role client, never
 * trusting anything the client claims about its own eligibility or
 * correctness — a player's browser can submit any selectedOptionIds it
 * wants, but the score awarded is always recomputed from
 * challenge_options.is_correct here, never from what the client believes
 * it got right.
 */
export async function submitAnswer(
  _prevState: SubmitAnswerState,
  formData: FormData,
): Promise<SubmitAnswerState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You need to be signed in." };
  }

  const selectedOptionIds = formData.getAll("selectedOptionIds").map((v) => String(v));

  const parsed = submitAnswerSchema.safeParse({
    challengeId: formData.get("challengeId"),
    answerText: formData.get("answerText") || undefined,
    selectedOptionIds: selectedOptionIds.length > 0 ? selectedOptionIds : undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission" };
  }

  const { challengeId, answerText, selectedOptionIds: chosenIds } = parsed.data;
  const admin = createAdminClient();

  if (await isGamePaused(admin)) {
    return { error: "The game is currently paused. Try again shortly." };
  }

  const { data: challenge } = await admin
    .from("challenges")
    .select("id, type, mission_id")
    .eq("id", challengeId)
    .maybeSingle();

  if (!challenge) {
    return { error: "This challenge no longer exists." };
  }

  const { data: mission } = await admin
    .from("missions")
    .select("id, status, ends_at, max_attempts, base_points, unity_points, is_unity_challenge")
    .eq("id", challenge.mission_id)
    .maybeSingle();

  if (!mission || mission.status !== "LIVE") {
    return { error: "This mission is not currently open for submissions." };
  }

  if (mission.ends_at && new Date(mission.ends_at).getTime() < Date.now()) {
    return { error: "This mission's deadline has passed." };
  }

  const { count: attemptCount } = await admin
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("challenge_id", challengeId)
    .eq("player_id", user.id);

  const nextAttempt = (attemptCount ?? 0) + 1;
  if (mission.max_attempts && nextAttempt > mission.max_attempts) {
    return { error: "You've used all your attempts for this mission." };
  }

  // Scoring integrity (found by a dedicated security review, Product Guide
  // §33.3: "Duplicate completion does not double-pay unless configured"):
  // `max_attempts` only bounds how many TRIES exist, not how many times a
  // correct one pays. Without this, resubmitting the same correct answer
  // — or, for FREE_TEXT/PHOTO_UPLOAD, having several separate submissions
  // each independently approved (see the identical guard in
  // src/app/admin/submissions/actions.ts) — paid full points every time,
  // an unlimited point-farming path requiring no special access. A
  // challenge may only ever pay out once per player, checked here before
  // either grading path so both share the exact same rule.
  const { count: alreadyApprovedCount } = await admin
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("challenge_id", challengeId)
    .eq("player_id", user.id)
    .eq("status", "APPROVED");
  const alreadyAwarded = (alreadyApprovedCount ?? 0) > 0;

  if (challenge.type === "SINGLE_CHOICE" || challenge.type === "MULTIPLE_CHOICE") {
    if (!chosenIds || chosenIds.length === 0) {
      return { error: "Select an answer first." };
    }

    const { data: options } = await admin
      .from("challenge_options")
      .select("id, is_correct")
      .eq("challenge_id", challengeId);

    const correctIds = new Set((options ?? []).filter((o) => o.is_correct).map((o) => o.id));
    const chosenSet = new Set(chosenIds);
    const isCorrect =
      correctIds.size === chosenSet.size && [...correctIds].every((id) => chosenSet.has(id));

    const { data: submission, error: submissionError } = await admin
      .from("submissions")
      .insert({
        challenge_id: challengeId,
        player_id: user.id,
        attempt_number: nextAttempt,
        selected_option_ids: chosenIds,
        status: isCorrect ? "APPROVED" : "REJECTED",
        moderated_at: isCorrect ? new Date().toISOString() : null,
      })
      .select("id")
      .single();

    if (submissionError || !submission) {
      return { error: "Could not record your answer. Try again." };
    }

    if (!isCorrect) {
      revalidatePath(`/play/mission/${challenge.mission_id}`);
      return { error: "Not quite. Try again." };
    }

    if (alreadyAwarded) {
      revalidatePath(`/play/mission/${challenge.mission_id}`);
      return { success: { message: "Correct! (Already counted from an earlier attempt.)", pointsAwarded: 0 } };
    }

    const pointsAwarded = await awardMissionPoints({
      admin,
      playerId: user.id,
      missionId: mission.id,
      submissionId: submission.id,
      basePoints: mission.base_points,
      unityPoints: mission.unity_points,
      isUnityChallenge: mission.is_unity_challenge,
    });

    if (pointsAwarded > 0) {
      await broadcast("leaderboard", "points.awarded");
      // Product Guide §17 — checked from the real score_events this call
      // just wrote, never a client-claimed "I completed N missions".
      await checkMissionAchievements(admin, user.id);
    }

    revalidatePath(`/play/mission/${challenge.mission_id}`);
    revalidatePath("/leaderboards");
    return { success: { message: "Correct! That counts.", pointsAwarded } };
  }

  if (challenge.type === "FREE_TEXT") {
    if (!answerText) {
      return { error: "Write an answer first." };
    }
    const { error: submissionError } = await admin.from("submissions").insert({
      challenge_id: challengeId,
      player_id: user.id,
      attempt_number: nextAttempt,
      answer_text: answerText,
      status: "PENDING",
    });
    if (submissionError) {
      return { error: "Could not record your answer. Try again." };
    }
    await broadcast("admin:mission-control", "submission.pending");
    revalidatePath(`/play/mission/${challenge.mission_id}`);
    return { success: { message: "Got it. It's with the moderators now." } };
  }

  if (challenge.type === "PHOTO_UPLOAD") {
    const storagePath = formData.get("storagePath");
    if (typeof storagePath !== "string" || !storagePath) {
      return { error: "Upload a photo first." };
    }
    // Defense in depth: the storage RLS policy already restricts uploads to
    // the uploader's own uid-prefixed folder, but re-check here too rather
    // than trusting a client-supplied path unconditionally.
    if (!storagePath.startsWith(`${user.id}/`)) {
      return { error: "Invalid upload path." };
    }
    const { error: submissionError } = await admin.from("submissions").insert({
      challenge_id: challengeId,
      player_id: user.id,
      attempt_number: nextAttempt,
      storage_path: storagePath,
      status: "PENDING",
    });
    if (submissionError) {
      return { error: "Could not record your submission. Try again." };
    }
    await broadcast("admin:mission-control", "submission.pending");
    revalidatePath(`/play/mission/${challenge.mission_id}`);
    return { success: { message: "Got it. It's with the moderators now." } };
  }

  return { error: "Unsupported challenge type." };
}

async function awardMissionPoints(args: {
  admin: ReturnType<typeof createAdminClient>;
  playerId: string;
  missionId: string;
  submissionId: string;
  basePoints: number;
  unityPoints: number;
  isUnityChallenge: boolean;
}): Promise<number> {
  const { admin, playerId, missionId, submissionId, basePoints, unityPoints, isUnityChallenge } = args;
  let total = 0;

  if (basePoints > 0) {
    await admin.from("score_events").insert({
      player_id: playerId,
      points: basePoints,
      point_type: "MISSION_COMPLETED",
      source_type: "MISSION",
      source_id: missionId,
      reason: "Mission completed correctly",
    });
    total += basePoints;
  }

  if (isUnityChallenge && unityPoints > 0) {
    await admin.from("score_events").insert({
      player_id: playerId,
      points: unityPoints,
      point_type: "UNITY_PARTNER_VERIFIED",
      source_type: "SUBMISSION",
      source_id: submissionId,
      reason: "Cross-country unity challenge completed",
    });
    total += unityPoints;
  }

  return total;
}
