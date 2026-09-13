"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Subscribes to a realtime broadcast topic and calls `router.refresh()`
 * when a matching event arrives — re-runs the current route's Server
 * Component render (through its normal RLS-scoped queries), rather than
 * trusting anything in the broadcast payload itself. Per the runbook's
 * realtime design rule, a missed/dropped broadcast is never a correctness
 * problem this way, only a staleness one until the next natural
 * interaction — there is nothing here for a client to get authoritatively
 * wrong.
 */
export function useLiveRefresh(topic: string, events: readonly string[]) {
  const router = useRouter();
  const eventsKey = events.join(",");

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(topic);

    for (const event of eventsKey.split(",").filter(Boolean)) {
      channel.on("broadcast", { event }, () => router.refresh());
    }

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- eventsKey is the stable, comparable form of `events`; router is stable across renders per Next.js's own guidance
  }, [topic, eventsKey]);
}
