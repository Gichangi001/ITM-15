import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";

/**
 * Product Guide §17.3 "Pause Game" — the real enforcement half of
 * `setCampaignStatus` (src/app/admin/actions.ts). Checked server-side at
 * the start of every action that would otherwise let a player make
 * progress (answering a mission, casting a vote), so pausing the campaign
 * has genuine effect regardless of whether a player's browser ever
 * receives the `game.paused` broadcast — the runbook's realtime design
 * rule (broadcast is presentation, not authority) applies here exactly the
 * same way it does to everything else in this app.
 */
export async function isGamePaused(admin: ReturnType<typeof createAdminClient>): Promise<boolean> {
  const { data } = await admin
    .from("campaigns")
    .select("status")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.status === "PAUSED";
}
