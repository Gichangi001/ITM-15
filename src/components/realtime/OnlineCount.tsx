"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Product Guide §17.1's dashboard header: "Players online now." Reads
 * Presence state on the same `game:global` channel `PresenceHeartbeat`
 * tracks on — this admin viewer doesn't track its own presence (an admin
 * watching Mission Control isn't a "player online"), it only listens.
 *
 * Replaces the "not yet available (Phase 11)" line the Phase 5 dashboard
 * shipped with — this is the real thing, not a fixed/fake number: it
 * updates live as players' browser tabs open and close, no page refresh
 * needed, and starts genuinely uncertain (null) until the channel's first
 * `sync` event actually reports the current state.
 */
export function OnlineCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("game:global", {
      config: { presence: { key: crypto.randomUUID() } },
    });

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      setCount(Object.keys(state).length);
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <span>{count === null ? "—" : count}</span>;
}
