import type { ReactNode } from "react";
import { PlayerNav } from "@/components/player/PlayerNav";

/**
 * Shared shell for every Phase 4 player route (Product Guide §7, §26 Phase
 * 4: "Navigation... Responsive layout"). Auth/onboarding/role gating
 * already happens once, for every path under this group, in src/proxy.ts
 * (see PROTECTED_PREFIXES) — this layout adds navigation, not a second
 * authorization check.
 */
export default function PlayerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <PlayerNav />
      <div className="flex-1">{children}</div>
    </div>
  );
}
