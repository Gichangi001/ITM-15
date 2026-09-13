import type { ReactNode } from "react";
import { PlayerNav } from "@/components/player/PlayerNav";
import { PresenceHeartbeat } from "@/components/realtime/PresenceHeartbeat";

/**
 * Shared shell for every Phase 4 player route (Product Guide §7, §26 Phase
 * 4: "Navigation... Responsive layout"). Auth/onboarding/role gating
 * already happens once, for every path under this group, in src/proxy.ts
 * (see PROTECTED_PREFIXES) — this layout adds navigation, not a second
 * authorization check.
 *
 * `PresenceHeartbeat` (Phase 11, Product Guide §14.3) lives here rather
 * than on any one page — a player counts as "online" anywhere in the
 * player shell, not just on `/play` itself.
 */
export default function PlayerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <PresenceHeartbeat />
      <PlayerNav />
      <div className="flex-1">{children}</div>
    </div>
  );
}
