"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Product Guide §14.3: "Use Presence for online user counts." Tracks this
 * signed-in player's presence on the `game:global` channel for as long as
 * this layout is mounted (i.e. anywhere under the player shell) — untracked
 * automatically on unmount/tab close via the channel's own cleanup, no
 * manual "player left" signal needed. Presence carries only a random join
 * ref internally; no player identity/PII is broadcast — the admin side
 * only ever reads a count (`OnlineCount`), never who's online.
 *
 * Deliberately NOT used for "current page/day" tracking (Product Guide
 * §14.3 mentions this as optional) — that would broadcast more about a
 * specific player's activity than a simple online count needs to.
 */
export function PresenceHeartbeat() {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("game:global", {
      config: { presence: { key: crypto.randomUUID() } },
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channel.track({ online_at: new Date().toISOString() });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
