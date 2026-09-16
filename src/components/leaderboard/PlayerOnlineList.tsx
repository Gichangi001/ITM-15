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
const RANK_BADGE: Record<number, string> = {
  1: "bg-gold text-bg",
  2: "bg-white/25 text-ink",
  3: "bg-white/15 text-ink",
};

/**
 * Experience Transformation Slice 1: replaced the plain divided-list row
 * with a rank badge (gold for #1, matching this project's existing "gold
 * is rare, reserved for something that earned it" rule) and a highlight
 * for the signed-in player's own row (brief §17: "your position should
 * always be easy to find"). Deliberately does NOT show rank-movement
 * arrows (↑3/↓1, "personal best," "fastest mover") — that needs a
 * historical leaderboard snapshot this project has no table for yet;
 * fabricating movement data would violate this project's own
 * no-fake-demo rule. A real, disclosed gap for a future slice.
 */
export function PlayerOnlineList({
  players,
  currentPlayerId,
}: {
  players: PlayerLeaderboardEntry[];
  currentPlayerId?: string;
}) {
  const onlineIds = useOnlinePlayerIds();

  return (
    <ol className="itm-card flex flex-col divide-y divide-white/5">
      {players.map((entry, index) => {
        const rank = index + 1;
        const isYou = entry.playerId === currentPlayerId;
        return (
          <li
            key={entry.playerId}
            className={`flex items-center justify-between gap-4 px-5 py-3 text-sm ${
              isYou ? "bg-walumo/10" : ""
            }`}
          >
            <span className="flex items-center gap-3 text-ink">
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  RANK_BADGE[rank] ?? "bg-white/5 text-muted"
                }`}
              >
                {rank}
              </span>
              <span
                aria-hidden="true"
                className={`inline-block size-2 shrink-0 rounded-full ${
                  onlineIds.has(entry.playerId) ? "bg-emerald-400" : "bg-white/20"
                }`}
                title={onlineIds.has(entry.playerId) ? "Online" : "Offline"}
              />
              {entry.displayName}
              {entry.countryFlag ? ` ${entry.countryFlag}` : ""}
              {isYou ? <span className="text-xs text-walumo">· you</span> : null}
            </span>
            <span className="text-muted">{entry.points} pts</span>
          </li>
        );
      })}
    </ol>
  );
}
