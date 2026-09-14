"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { tryAward } from "@/lib/achievements/award";
import { trackEvent } from "@/lib/analytics/track";

/**
 * docs/ITM15_FOUNDER_STORY_OPENING_CHAPTER.md §13: "+ ORIGIN CLUE
 * UNLOCKED... This can become the first piece of the Day 1 challenge."
 * Real, not cosmetic: awards the `origin_clue` `player_achievements` row
 * for a signed-in player, using the same real, idempotent
 * `player_achievements(player_id, achievement_id)` uniqueness `tryAward`
 * already relies on elsewhere. A genuinely anonymous pre-login visitor
 * still sees the "+ ORIGIN CLUE UNLOCKED" beat in the story (it's true
 * narrative content, not gated), but there is no account to persist an
 * award against yet — nothing here pretends otherwise.
 */
export async function unlockOriginClue(): Promise<void> {
  const user = await getCurrentUser();
  await trackEvent("origin_clue_collected", { authenticated: Boolean(user) });
  if (!user) return;

  const admin = createAdminClient();
  await tryAward(admin, user.id, "origin_clue", "founder_story");
}
