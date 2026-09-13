"use client";

import { useOnlinePlayerIds } from "@/lib/realtime/onlinePresence";
import type { PlayerLeaderboardEntry } from "@/lib/scoring/leaderboard";

/**
 * Product owner's explicit 2026-09-13 direction: "for leaderboard...
 * shows their status online or offline." Reads the online-player-id set
 * from context rather than subscribing to Presence itself — see
 * PresenceHeartbeat.tsx's header comment: a second, independent
 * `channel("game:global")` subscription on the same page collides with
 * the layout's own (supabase-js reuses the channel object per topic and
 * throws if you register a presence callback on it after `subscribe()`
 * was already called elsewhere) — found and fixed live while verifying
 * this exact feature.
 */
export function PlayerOnlineList({ players }: { players: PlayerLeaderboardEntry[] }) {
  const onlineIds = useOnlinePlayerIds();

  return (
    <ol className="flex flex-col divide-y divide-white/5 rounded-xl border border-white/10 bg-surface">
      {players.map((entry, index) => (
        <li key={entry.playerId} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
          <span className="flex items-center gap-2 text-ink">
            <span
              aria-hidden="true"
              className={`inline-block size-2 shrink-0 rounded-full ${
                onlineIds.has(entry.playerId) ? "bg-emerald-400" : "bg-white/20"
              }`}
              title={onlineIds.has(entry.playerId) ? "Online" : "Offline"}
            />
            {index + 1}. {entry.displayName}
            {entry.countryFlag ? ` ${entry.countryFlag}` : ""}
          </span>
          <span className="text-muted">{entry.points} pts</span>
        </li>
      ))}
    </ol>
  );
}
