import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Fans a real notification row out to every currently-active player.
 * Product Guide §15.1 (persistent notifications); the Phase 17 migration
 * extended `notifications.source_type` for `DAY_STARTED`/`DAY_ENDED`
 * specifically so this could be fired from the one place a day's status
 * already changes server-authoritatively —
 * `updateGameDayStatus` (`src/app/admin/missions/actions.ts`) — rather
 * than a time-based cron this environment has no way to observe firing.
 *
 * A plain batch insert, not per-player broadcast pings — event-scale
 * ("so many participants") makes N individual realtime broadcasts an
 * unnecessary cost for what's fundamentally a persisted inbox item, not a
 * live interruption; a player sees it next time `/notifications` loads.
 */
export async function notifyAllActivePlayers(
  admin: AdminClient,
  input: { title: string; message: string; sourceType: string; sourceId?: string },
) {
  const { data: players } = await admin.from("profiles").select("id").eq("status", "ACTIVE");
  if (!players || players.length === 0) return;

  const rows = players.map((player) => ({
    player_id: player.id,
    title: input.title,
    message: input.message,
    source_type: input.sourceType,
    source_id: input.sourceId ?? null,
  }));

  await admin.from("notifications").insert(rows);
}
