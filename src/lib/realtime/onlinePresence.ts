"use client";

import { createContext, useContext } from "react";

/**
 * See PresenceHeartbeat.tsx's header comment for why this exists: exactly
 * one component may own the "game:global" Presence channel subscription
 * per page (supabase-js reuses the same underlying RealtimeChannel object
 * for a given topic on one client, and throws if you try to register a
 * `presence` callback on it after `subscribe()` has already been called —
 * which a second, independent `channel("game:global")` call elsewhere on
 * the same page would do). This context lets any player-shell component
 * read the live online-player-id set without creating its own competing
 * subscription.
 */
export const OnlinePresenceContext = createContext<ReadonlySet<string>>(new Set());

export function useOnlinePlayerIds(): ReadonlySet<string> {
  return useContext(OnlinePresenceContext);
}

/**
 * The same "one channel owner" constraint applies to *any* listener on
 * "game:global", not just presence — supabase-js requires every `.on(...)`
 * registration (broadcast included) to happen before `.subscribe()` is
 * called on that channel object, so a second component adding its own
 * `.on("broadcast", ...)` after `PresenceHeartbeat` has already subscribed
 * hits the same class of error. `PresenceHeartbeat` registers the
 * `wally.triggered` listener itself (it owns the channel) and republishes
 * each occurrence here as a monotonically increasing counter — a consumer
 * (`WallyProvider`) reacts via a plain `useEffect` dependency on the
 * number, not by subscribing to anything itself.
 */
export const WallyTriggerTickContext = createContext(0);

export function useWallyTriggerTick(): number {
  return useContext(WallyTriggerTickContext);
}
