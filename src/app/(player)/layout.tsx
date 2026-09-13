import type { ReactNode } from "react";
import { PlayerNav } from "@/components/player/PlayerNav";
import { PresenceHeartbeat } from "@/components/realtime/PresenceHeartbeat";
import { LiveRefresh } from "@/components/realtime/LiveRefresh";
import { GamePausedBanner } from "@/components/realtime/GamePausedBanner";
import { createClient } from "@/lib/supabase/server";

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
 *
 * The paused banner (Phase 12, §17.3) reads the real `campaigns.status`
 * on every request (campaigns has a public-read RLS policy, no service
 * role needed) and `LiveRefresh` re-runs this layout on `game.paused`/
 * `game.resumed` so it appears/disappears live, not just on next navigation.
 */
export default async function PlayerLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("status")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <PresenceHeartbeat />
      <LiveRefresh topic="game:global" events={["game.paused", "game.resumed"]} />
      <GamePausedBanner paused={campaign?.status === "PAUSED"} />
      <PlayerNav />
      <div className="flex-1">{children}</div>
    </div>
  );
}
