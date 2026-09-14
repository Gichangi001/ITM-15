import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { canViewAnalytics } from "@/lib/auth/roles";
import { getCurrentRoles } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCountryLeaderboard } from "@/lib/scoring/leaderboard";

export const metadata: Metadata = { title: "Analytics — ITM@15" };

export const dynamic = "force-dynamic";

const NOT_YET_AVAILABLE = [
  "First-login/daily-active/retention metrics (Product Guide §22.1) — need a real login-event log, which doesn't exist yet; profiles.created_at is account-creation time, not a login timestamp",
  "Average mission completion time — needs per-attempt start/end timestamps, not just the final submission row",
  "Belonging/learning survey outcomes (§22.2) — needs the explicit in-app questions the spec describes, not built",
  "Post-event exportable report (§22.3) — a future extension of this page, not a separate export pipeline yet",
];

/**
 * Product Guide §22 (Analytics), §26 Phase 19. Game Master/Super
 * Admin/Analytics Viewer only (Product Guide §4.6).
 *
 * Every number here is a real aggregate query against data this app
 * already writes — nothing here is a separate `analytics_events` event
 * taxonomy (§22's fuller vision), since nothing in this codebase emits
 * one yet. What that would add beyond what's shown below is listed
 * honestly, not silently omitted.
 */
export default async function AnalyticsPage() {
  const roles = await getCurrentRoles();
  if (!canViewAnalytics(roles)) {
    redirect("/admin");
  }

  const admin = createAdminClient();

  const [
    { count: totalAccounts },
    { count: activeAccounts },
    { count: onboardedAccounts },
    { count: totalMissions },
    { count: liveMissions },
    { count: totalSubmissions },
    { count: pendingSubmissions },
    { count: approvedSubmissions },
    { count: rejectedSubmissions },
    { count: totalVotes },
    { count: totalPolls },
    { count: revealedPolls },
    { data: scoreEvents },
    { count: unlockedAchievementCount },
    { data: playerAchievementRows },
    { count: approvedEventPhotos },
    countries,
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("status", "ACTIVE"),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("onboarding_completed", true),
    admin.from("missions").select("id", { count: "exact", head: true }),
    admin.from("missions").select("id", { count: "exact", head: true }).eq("status", "LIVE"),
    admin.from("submissions").select("id", { count: "exact", head: true }),
    admin.from("submissions").select("id", { count: "exact", head: true }).eq("status", "PENDING"),
    admin.from("submissions").select("id", { count: "exact", head: true }).eq("status", "APPROVED"),
    admin.from("submissions").select("id", { count: "exact", head: true }).eq("status", "REJECTED"),
    admin.from("votes").select("id", { count: "exact", head: true }),
    admin.from("polls").select("id", { count: "exact", head: true }),
    admin.from("polls").select("id", { count: "exact", head: true }).eq("status", "REVEALED"),
    admin.from("score_events").select("points, point_type"),
    admin.from("player_achievements").select("id", { count: "exact", head: true }),
    admin.from("player_achievements").select("player_id"),
    admin.from("event_photos").select("id", { count: "exact", head: true }).eq("status", "APPROVED"),
    getCountryLeaderboard(),
  ]);

  const totalPointsAwarded = (scoreEvents ?? []).reduce((sum, e) => sum + e.points, 0);
  const unityPointsAwarded = (scoreEvents ?? [])
    .filter((e) => e.point_type === "UNITY_PARTNER_VERIFIED")
    .reduce((sum, e) => sum + e.points, 0);
  const distinctPlayersWithAchievements = new Set((playerAchievementRows ?? []).map((row) => row.player_id)).size;

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-10 bg-bg px-6 py-16">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15 — Mission Control
        </p>
        <h1 className="text-3xl">Analytics</h1>
        <p className="text-sm text-muted">
          Every number below is a real aggregate query, computed fresh on every load — never a
          fabricated estimate.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold tracking-[0.15em] text-muted uppercase">Participation</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Accounts" value={totalAccounts} />
          <Stat label="Active" value={activeAccounts} />
          <Stat label="Onboarded" value={onboardedAccounts} />
          <Stat label="Countries active" value={countries.length} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold tracking-[0.15em] text-muted uppercase">Content & Engagement</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Missions (live)" value={`${liveMissions ?? 0} / ${totalMissions ?? 0}`} />
          <Stat label="Submissions" value={totalSubmissions} />
          <Stat label="— pending" value={pendingSubmissions} />
          <Stat label="— approved" value={approvedSubmissions} />
          <Stat label="— rejected" value={rejectedSubmissions} />
          <Stat label="Votes cast" value={totalVotes} />
          <Stat label="Polls (revealed)" value={`${revealedPolls ?? 0} / ${totalPolls ?? 0}`} />
          <Stat label="Approved event photos" value={approvedEventPhotos} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold tracking-[0.15em] text-muted uppercase">Scoring & Recognition</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Total points awarded" value={totalPointsAwarded} />
          <Stat label="Unity Points" value={unityPointsAwarded} />
          <Stat label="Achievements unlocked" value={unlockedAchievementCount} />
          <Stat label="Players with a badge" value={distinctPlayersWithAchievements} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold tracking-[0.15em] text-muted uppercase">Country Standings</h2>
        {countries.length === 0 ? (
          <p className="text-sm text-muted">No country points yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-white/5 rounded-xl border border-white/10 bg-surface">
            {countries.map((entry) => (
              <li key={entry.countryId} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="text-ink">
                  {entry.countryFlag ? `${entry.countryFlag} ` : ""}
                  {entry.countryName}
                </span>
                <span className="text-muted">{entry.points} pts</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold tracking-[0.15em] text-muted uppercase">
          Not yet available
        </h2>
        <ul className="flex flex-col gap-1">
          {NOT_YET_AVAILABLE.map((item) => (
            <li key={item} className="text-xs text-muted">
              — {item}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface p-4">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-1 text-2xl text-ink">{value ?? 0}</p>
    </div>
  );
}
