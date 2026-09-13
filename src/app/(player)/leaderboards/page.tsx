import type { Metadata } from "next";
import { getPlayerLeaderboard, getCountryLeaderboard } from "@/lib/scoring/leaderboard";
import { LiveRefresh } from "@/components/realtime/LiveRefresh";
import { PlayerOnlineList } from "@/components/leaderboard/PlayerOnlineList";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Leaderboards — ITM@15" };

// Without this, Next.js statically prerenders the page at build time (it
// touches no request-specific API like cookies()/headers() — both
// leaderboard queries use the service-role admin client, which needs
// none), freezing the leaderboard at whatever it was when `next build` ran
// and never updating again. A leaderboard is the definition of content
// that must be live on every request. Caught by noticing this route was
// marked ○ (Static) instead of ƒ (Dynamic) in `next build`'s own route
// summary — worth checking that output whenever a new server-rendered
// page reads live data through a client that isn't request-scoped.
export const dynamic = "force-dynamic";

/**
 * Product Guide §10.3 (individual, country leaderboards) / §26 Phase 8
 * acceptance. Squad leaderboards are omitted — see the schema migration's
 * header comment: squad assignment doesn't exist yet, so there's no real
 * squad data to show (a placeholder squad leaderboard would be exactly the
 * "fake demo" the Storyline Build Bible §39 forbids).
 */
export default async function LeaderboardsPage() {
  const admin = createAdminClient();
  const [players, countries, { data: recentJoins }] = await Promise.all([
    getPlayerLeaderboard(50),
    getCountryLeaderboard(),
    admin
      .from("profiles")
      .select("id, full_name, email, country_id, created_at")
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const recentCountryIds = [...new Set((recentJoins ?? []).map((p) => p.country_id).filter(Boolean))] as string[];
  const { data: recentCountries } =
    recentCountryIds.length > 0
      ? await admin.from("countries").select("id, flag_emoji").in("id", recentCountryIds)
      : { data: [] as { id: string; flag_emoji: string | null }[] };
  const flagByCountryId = new Map((recentCountries ?? []).map((c) => [c.id, c.flag_emoji]));

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-10 sm:px-6">
      <LiveRefresh topic="leaderboard" events={["points.awarded"]} />
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15 — Wally Takeover
        </p>
        <h1 className="text-3xl">Leaderboards</h1>
        <p className="max-w-lg text-sm text-muted">
          Built from a real, server-authoritative score ledger — every point
          here came from a completed mission or an admin-awarded bonus, never
          a client-side claim. Squad leaderboards will appear once squad
          assignment is built.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold tracking-[0.15em] text-muted uppercase">Countries</h2>
        {countries.length === 0 ? (
          <p className="text-sm text-muted">No country points yet.</p>
        ) : (
          <ol className="flex flex-col divide-y divide-white/5 rounded-xl border border-white/10 bg-surface">
            {countries.map((entry, index) => (
              <li key={entry.countryId} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <span className="text-ink">
                  {index + 1}. {entry.countryFlag ? `${entry.countryFlag} ` : ""}
                  {entry.countryName}
                </span>
                <span className="text-muted">{entry.points} pts</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold tracking-[0.15em] text-muted uppercase">Individuals</h2>
        {players.length === 0 ? (
          <p className="text-sm text-muted">No points awarded yet — be the first.</p>
        ) : (
          <PlayerOnlineList players={players} />
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold tracking-[0.15em] text-muted uppercase">
          Newest members
        </h2>
        {!recentJoins || recentJoins.length === 0 ? (
          <p className="text-sm text-muted">No one has joined yet.</p>
        ) : (
          <ol className="flex flex-col divide-y divide-white/5 rounded-xl border border-white/10 bg-surface">
            {recentJoins.map((profile) => (
              <li key={profile.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <span className="text-ink">
                  {profile.full_name || profile.email}
                  {profile.country_id && flagByCountryId.get(profile.country_id)
                    ? ` ${flagByCountryId.get(profile.country_id)}`
                    : ""}
                </span>
                <span className="text-xs text-muted">
                  {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
