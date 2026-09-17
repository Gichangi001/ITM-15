import type { ReactNode } from "react";
import { PlayerNav } from "@/components/player/PlayerNav";
import { PresenceHeartbeat } from "@/components/realtime/PresenceHeartbeat";
import { GamePausedBanner } from "@/components/realtime/GamePausedBanner";
import { WallyProvider } from "@/components/wally/WallyProvider";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";

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
 * role needed); `PresenceHeartbeat` itself refetches on `game.paused`/
 * `game.resumed` so it appears/disappears live, not just on next
 * navigation — folded in there (not a standalone `LiveRefresh` mount)
 * because that separate channel is exactly what was colliding with
 * `PresenceHeartbeat`'s own "game:global" subscription; see that
 * component's header comment.
 *
 * `WallyProvider` (Phase 13, docs/WALLY.md §15.5) lives here for the same
 * reason `PresenceHeartbeat` does — Wally is present anywhere in the
 * player shell, not just on `/play`. It needs a real, verified user id and
 * first name, fetched once here server-side (never trusted from a client
 * prop), so a login greeting and any admin-targeted event can never be
 * fabricated or misattributed to the wrong player. Its own GLOBAL Wally
 * events also now arrive through `PresenceHeartbeat` (see
 * `useWallyTriggerTick`), not a channel of its own.
 */
// Every page in this route group shares this layout, which reads live
// cookies/auth on every request (createClient() below) - none of them
// can be meaningfully static. Without this, Next.js optimistically tries
// to statically prerender at build time whichever leaf pages have no
// dynamic dependency of their own (e.g. /help, /profile, /passport),
// which crashes the production build in any environment without real
// Supabase env vars configured (first caught in CI, which has none) -
// individual pages (play, leaderboards, gallery, achievements,
// notifications) already had their own "dynamic = force-dynamic" for
// unrelated reasons; this closes the same gap for the rest at the root
// instead of patching each leaf page as it happens to break.
export const dynamic = "force-dynamic";

export default async function PlayerLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const [{ data: campaign }, user] = await Promise.all([
    supabase
      .from("campaigns")
      .select("status")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getCurrentUser(),
  ]);

  let firstName: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name")
      .eq("id", user.id)
      .maybeSingle();
    firstName = profile?.first_name ?? null;
  }

  const shell = (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <GamePausedBanner paused={campaign?.status === "PAUSED"} />
      {user ? <WallyProvider playerId={user.id} firstName={firstName} /> : null}
      <PlayerNav />
      <div className="flex-1">{children}</div>
    </div>
  );

  // PresenceHeartbeat is the sole owner of the "game:global" Presence
  // subscription for the whole player shell (see its own header comment
  // for why a second independent subscription elsewhere on the page
  // would collide) — it wraps everything else so any descendant can read
  // live online-player-ids via useOnlinePlayerIds() without subscribing
  // itself.
  return user ? <PresenceHeartbeat playerId={user.id}>{shell}</PresenceHeartbeat> : shell;
}
