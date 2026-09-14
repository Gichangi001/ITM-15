"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

const PANEL_MS = 12_000; // 12s per module — long enough to actually read on a distant TV, short enough to keep it lively
const REFRESH_MS = 60_000; // re-fetch real server data periodically; this page is meant to run unattended, so it can't rely on someone reloading it

/**
 * Product Guide §21.2: "Rotating modules... Admin can choose what the
 * screen currently displays." Only the rotation half is built here — a
 * fixed, even-weighted cycle through whatever panels are passed in, not
 * an admin-driven "show this module now" override (that needs a
 * dedicated control surface and a realtime channel to push it, disclosed
 * as deferred rather than half-built). `router.refresh()` on an interval
 * is the honest way to keep an *unattended* display's data from going
 * stale — this route intentionally has no admin viewing it to hit
 * reload.
 */
export function ScreenRotator({ panels }: { panels: ReactNode[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (panels.length <= 1) return;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % panels.length);
    }, PANEL_MS);
    return () => clearInterval(id);
  }, [panels.length]);

  useEffect(() => {
    const id = setInterval(() => router.refresh(), REFRESH_MS);
    return () => clearInterval(id);
  }, [router]);

  return <>{panels[index] ?? null}</>;
}
