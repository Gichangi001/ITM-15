"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OnlinePresenceContext, WallyTriggerTickContext } from "@/lib/realtime/onlinePresence";

/**
 * Product Guide §14.3: "Use Presence for online user counts." Tracks this
 * signed-in player's presence on the `game:global` channel for as long as
 * this layout is mounted (i.e. anywhere under the player shell) — untracked
 * automatically on unmount/tab close via the channel's own cleanup, no
 * manual "player left" signal needed.
 *
 * Keyed by the player's real id (not a random join ref) — a deliberate
 * 2026-09-13 change from the original "anonymous count only" design, per
 * the product owner's explicit request that the leaderboard show each
 * player's own online/offline status. This is comparable to any ordinary
 * "green dot" online indicator (Slack, LinkedIn) — every other signed-in
 * player can see who else happens to be online right now, nothing more
 * sensitive than that (no page/activity tracking — Product Guide §14.3
 * explicitly calls that out as optional and this still doesn't do it).
 *
 * This is the SOLE owner of the "game:global" channel for the whole
 * player shell — not just Presence. supabase-js requires every `.on(...)`
 * registration on a channel (broadcast listeners included, not only
 * presence ones) to happen before `.subscribe()` is called on that same
 * channel object; a second, independent `supabase.channel("game:global")`
 * anywhere else on the page — found live as both a `LiveRefresh` mount
 * *and* `WallyProvider`'s own internal channel, both listening for
 * different broadcast events on this same topic — collides with this
 * one and throws "cannot add presence callbacks... after subscribe()" the
 * moment either registers its own listener, crashing the whole page. So
 * this component now owns every "game:global" listener the player shell
 * needs (presence, `game.paused`/`game.resumed`, `wally.triggered`) and
 * republishes them via context/direct effect — no other component may
 * call `supabase.channel("game:global")` itself. See `onlinePresence.ts`
 * for the exact same reasoning applied to `wally.triggered`.
 */
export function PresenceHeartbeat({ playerId, children }: { playerId: string; children?: ReactNode }) {
  const router = useRouter();
  const [onlineIds, setOnlineIds] = useState<ReadonlySet<string>>(new Set());
  const [wallyTriggerTick, setWallyTriggerTick] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("game:global", {
      config: { presence: { key: playerId } },
    });

    channel.on("presence", { event: "sync" }, () => {
      setOnlineIds(new Set(Object.keys(channel.presenceState())));
    });
    // Product Guide §17.3 pause/resume — previously a standalone
    // <LiveRefresh topic="game:global"> mount; folded in here since that
    // separate channel is exactly what was colliding with this one.
    channel.on("broadcast", { event: "game.paused" }, () => router.refresh());
    channel.on("broadcast", { event: "game.resumed" }, () => router.refresh());
    // docs/WALLY.md §15.5 — previously WallyProvider's own channel; see
    // this file's header comment and onlinePresence.ts's
    // WallyTriggerTickContext for why it moved here instead.
    channel.on("broadcast", { event: "wally.triggered" }, () => {
      setWallyTriggerTick((tick) => tick + 1);
    });
    // Phase 12 admin notification composer (src/app/admin/notifications/
    // actions.ts) — a GLOBAL send pings this same channel. A plain
    // router.refresh() is enough here (unlike wally.triggered, nothing
    // needs to decide whether to interrupt anything): it re-runs whatever
    // Server Component route is currently mounted, so an already-open
    // /notifications tab picks up the new row with no reload, the same
    // way game.paused/game.resumed already do above.
    channel.on("broadcast", { event: "notification.created" }, () => router.refresh());

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channel.track({ online_at: new Date().toISOString() });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [playerId, router]);

  return (
    <OnlinePresenceContext.Provider value={onlineIds}>
      <WallyTriggerTickContext.Provider value={wallyTriggerTick}>{children}</WallyTriggerTickContext.Provider>
    </OnlinePresenceContext.Provider>
  );
}
