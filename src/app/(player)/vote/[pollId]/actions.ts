"use server";

import { revalidatePath } from "next/cache";
import { castVoteSchema } from "@/lib/voting/schemas";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { broadcast } from "@/lib/realtime/broadcast";

export type CastVoteState = { error?: string; success?: boolean } | null;

/**
 * Product Guide §26 Phase 9 acceptance: "Self-vote rule works. Duplicate
 * vote blocked at database/server level." Every check here re-verifies
 * against the database, never trusting what the form claims about poll
 * status or self-vote eligibility — a player's browser could submit any
 * pollId/optionId pair, but this always re-fetches the real poll/option
 * rows and re-derives the answer itself.
 */
export async function castVote(
  _prevState: CastVoteState,
  formData: FormData,
): Promise<CastVoteState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You need to be signed in." };
  }

  const parsed = castVoteSchema.safeParse({
    pollId: formData.get("pollId"),
    optionId: formData.get("optionId"),
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid vote" };
  }

  const { pollId, optionId, reason } = parsed.data;
  const admin = createAdminClient();

  const { data: poll } = await admin
    .from("polls")
    .select("id, status, self_vote_allowed, reason_required")
    .eq("id", pollId)
    .maybeSingle();

  if (!poll || poll.status !== "OPEN") {
    return { error: "This poll is not currently open for voting." };
  }

  if (poll.reason_required && !reason) {
    return { error: "A reason is required for this vote." };
  }

  const { data: option } = await admin
    .from("poll_options")
    .select("id, poll_id, candidate_player_id")
    .eq("id", optionId)
    .maybeSingle();

  if (!option || option.poll_id !== pollId) {
    return { error: "Invalid option for this poll." };
  }

  if (!poll.self_vote_allowed && option.candidate_player_id === user.id) {
    return { error: "You can't vote for yourself in this poll." };
  }

  const { data: existingVote } = await admin
    .from("votes")
    .select("id")
    .eq("poll_id", pollId)
    .eq("voter_id", user.id)
    .maybeSingle();

  if (existingVote) {
    return { error: "You've already voted in this poll." };
  }

  const { error: insertError } = await admin.from("votes").insert({
    poll_id: pollId,
    voter_id: user.id,
    option_id: optionId,
    reason: reason || null,
  });

  if (insertError) {
    // The unique(poll_id, voter_id) constraint is the real backstop for a
    // race between two concurrent requests slipping past the check above.
    if (insertError.code === "23505") {
      return { error: "You've already voted in this poll." };
    }
    return { error: "Could not record your vote. Try again." };
  }

  // Phase 11: lets a LIVE-results-visibility poll's vote count update for
  // every connected viewer (including the admin's live count on
  // /admin/voting) without a reload; carries no vote content itself.
  await broadcast(`poll:${pollId}`, "vote.cast");

  revalidatePath(`/vote/${pollId}`);
  return { success: true };
}
