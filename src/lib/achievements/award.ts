import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Product Guide §17 (Achievements & Passport), completing the schema the
 * concurrent Phase-17 migration already applied
 * (`20260913120000_phase17_passport_achievements_gallery.sql`) but that
 * had no awarding logic wired to it yet — every achievement it seeded was
 * definable but nothing ever actually granted one.
 *
 * Every award here is derived from a `score_events`/`votes` row that
 * already exists at the moment this runs — never a client-claimed
 * condition. `player_achievements(player_id, achievement_id)` is
 * `unique`, so awarding is naturally idempotent: calling this after every
 * qualifying event (not just the one that first crosses a threshold) is
 * intentional and cheap, not a bug to dedupe further up the call chain.
 */
async function tryAward(
  admin: AdminClient,
  playerId: string,
  achievementKey: string,
  sourceType?: string,
  sourceId?: string,
) {
  const { data: achievement } = await admin
    .from("achievements")
    .select("id")
    .eq("key", achievementKey)
    .maybeSingle();
  if (!achievement) return; // seed row missing — fail silently, never block the caller's real work over a badge

  const { error } = await admin.from("player_achievements").insert({
    player_id: playerId,
    achievement_id: achievement.id,
    source_type: sourceType ?? null,
    source_id: sourceId ?? null,
  });
  // 23505 = unique_violation — already has it, exactly the expected
  // steady-state outcome most of the time this function runs. Any other
  // error is swallowed too: a missed achievement is never worth failing
  // the mission/submission/vote flow that triggered this check.
  void error;
}

/**
 * Call after any real point award from a mission (auto-graded answer or
 * moderator-approved submission — both paths that write `score_events`
 * with these exact `point_type`s). Checks the player's full history each
 * time rather than trusting a passed-in "this is their Nth mission" count,
 * since two award paths (auto-grade, moderation) both call this and
 * neither reliably knows the other's tally.
 */
export async function checkMissionAchievements(admin: AdminClient, playerId: string) {
  const { count: missionCount } = await admin
    .from("score_events")
    .select("id", { count: "exact", head: true })
    .eq("player_id", playerId)
    .eq("point_type", "MISSION_COMPLETED");

  if ((missionCount ?? 0) >= 1) {
    await tryAward(admin, playerId, "first_mission");
  }
  if ((missionCount ?? 0) >= 5) {
    await tryAward(admin, playerId, "five_missions");
  }

  const { count: unityCount } = await admin
    .from("score_events")
    .select("id", { count: "exact", head: true })
    .eq("player_id", playerId)
    .eq("point_type", "UNITY_PARTNER_VERIFIED");

  if ((unityCount ?? 0) >= 1) {
    await tryAward(admin, playerId, "cross_country_connector");
  }
}

/**
 * Call from `updatePollStatus` (`src/app/admin/voting/actions.ts`) the
 * moment a poll transitions to `REVEALED`. Only meaningful for a
 * nomination-style poll whose winning option is tied to a real player
 * (`poll_options.candidate_player_id`) — an ordinary informational poll
 * has no candidate to award, and this is a silent no-op for one.
 */
export async function checkPollAchievement(admin: AdminClient, pollId: string) {
  const [{ data: options }, { data: votes }] = await Promise.all([
    admin.from("poll_options").select("id, candidate_player_id").eq("poll_id", pollId),
    admin.from("votes").select("option_id").eq("poll_id", pollId),
  ]);

  if (!options || !votes || votes.length === 0) return;

  const counts = new Map<string, number>();
  for (const vote of votes) {
    counts.set(vote.option_id, (counts.get(vote.option_id) ?? 0) + 1);
  }

  let winningOptionId: string | null = null;
  let max = 0;
  for (const [optionId, count] of counts) {
    if (count > max) {
      max = count;
      winningOptionId = optionId;
    }
  }
  if (!winningOptionId) return;

  const winner = options.find((option) => option.id === winningOptionId);
  if (winner?.candidate_player_id) {
    await tryAward(admin, winner.candidate_player_id, "crowd_favorite", "poll", pollId);
  }
}
