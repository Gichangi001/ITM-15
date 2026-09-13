"use client";

import { useLiveRefresh } from "@/lib/realtime/useLiveRefresh";

/**
 * Invisible — mounted inside an otherwise server-rendered page so that
 * page can stay a Server Component while still reacting to realtime
 * events. See `useLiveRefresh` for what actually happens on an event.
 */
export function LiveRefresh({ topic, events }: { topic: string; events: readonly string[] }) {
  useLiveRefresh(topic, events);
  return null;
}
