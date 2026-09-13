import type { Metadata } from "next";
import { getCurrentProfile, getCurrentRoles } from "@/lib/auth/session";
import { canViewAuditLog } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Mission Control — ITM@15",
};

const QUICK_ACTIONS = [
  { label: "Launch Challenge", phase: "Phase 6 — Content Engine" },
  { label: "Send Notification", phase: "Phase 12 — Admin Notifications" },
  { label: "Trigger Wally", phase: "Phase 13 — Wally 2D Behaviour" },
  { label: "Award Bonus Points", phase: "Phase 8 — Scoring & Leaderboards" },
  { label: "Open Vote", phase: "Phase 9 — Voting & Nominations" },
  { label: "Change Theme", phase: "Phase 15 — Themes" },
  { label: "Unlock Day", phase: "Phase 6 — Content Engine" },
  { label: "Feature Photo", phase: "Phase 10 — Media Uploads" },
  { label: "Pause Game", phase: "Phase 12 — Admin Notifications" },
] as const;

const NOT_YET_AVAILABLE = [
  "Players online now (Phase 11 — Realtime)",
  "Main mission completion rate (Phase 6-8)",
  "Pending moderation count (Phase 10)",
  "Live vote status (Phase 9)",
  "Current theme (Phase 15)",
];

/**
 * Product Guide §17 (Admin Mission Control), §26 Phase 5 build list:
 * "Admin layout. Real-time KPI cards. Players table. Role filters. Audit
 * viewer. Quick-action placeholders." Phase 5's own acceptance criteria
 * are deliberately modest — "Admin can monitor account state... Role-based
 * navigation works" — not a fully wired operations center, which needs the
 * content/scoring/voting/moderation/realtime engines from Phases 6-12.
 *
 * The KPI cards below show real, live-queried numbers for what already
 * exists (active accounts, active countries, campaign status) and
 * honestly list what §17.1's dashboard header also calls for but can't be
 * computed yet, rather than fabricating any of it — a fake "Players online:
 * 12" would be exactly the "fake demo" the Storyline Build Bible §39
 * forbids. Quick actions (§17.3) are non-interactive — visibly locked
 * cards naming the phase each needs, not buttons that would silently do
 * nothing if clicked.
 */
export default async function AdminHomePage() {
  const [profile, roles] = await Promise.all([getCurrentProfile(), getCurrentRoles()]);
  const admin = createAdminClient();

  const [{ count: activeAccountCount }, { data: countryRows }, { data: campaign }] =
    await Promise.all([
      admin.from("profiles").select("id", { count: "exact", head: true }).eq("status", "ACTIVE"),
      admin.from("profiles").select("country_id").eq("status", "ACTIVE").not("country_id", "is", null),
      admin
        .from("campaigns")
        .select("name, status")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const activeCountryCount = new Set((countryRows ?? []).map((row) => row.country_id)).size;

  const canSeeAudit = canViewAuditLog(roles);
  let recentActivity: { action: string; actorEmail: string; createdAt: string }[] = [];
  if (canSeeAudit) {
    const { data: auditRows } = await admin
      .from("audit_logs")
      .select("action, actor_id, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (auditRows && auditRows.length > 0) {
      const actorIds = [...new Set(auditRows.map((row) => row.actor_id).filter(Boolean))] as string[];
      const { data: actorProfiles } = await admin
        .from("profiles")
        .select("id, email")
        .in("id", actorIds);
      const emailById = new Map((actorProfiles ?? []).map((p) => [p.id, p.email]));

      recentActivity = auditRows.map((row) => ({
        action: row.action,
        actorEmail: (row.actor_id && emailById.get(row.actor_id)) || "system",
        createdAt: row.created_at,
      }));
    }
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15 — Mission Control
        </p>
        <h1 className="text-3xl">Overview</h1>
        <p className="max-w-lg text-sm text-muted">
          Signed in as <span className="text-ink">{profile?.email}</span>, role
          {roles.length === 1 ? "" : "s"}: <span className="text-ink">{roles.join(", ")}</span>.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold tracking-[0.15em] text-muted uppercase">
          Account overview
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard label="Active accounts" value={String(activeAccountCount ?? 0)} />
          <KpiCard label="Countries active" value={String(activeCountryCount)} />
          <KpiCard
            label="Campaign status"
            value={campaign ? `${campaign.name} · ${campaign.status}` : "No campaign yet"}
          />
        </div>
        <p className="text-xs text-muted">
          Not yet available (need later phases): {NOT_YET_AVAILABLE.join(" · ")}.
        </p>
      </section>

      {canSeeAudit ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold tracking-[0.15em] text-muted uppercase">
            Recent admin activity
          </h2>
          {recentActivity.length > 0 ? (
            <ul className="flex flex-col divide-y divide-white/5 rounded-xl border border-white/10 bg-surface">
              {recentActivity.map((entry, i) => (
                <li key={i} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                  <span className="text-ink">
                    {entry.action.replaceAll("_", " ")}{" "}
                    <span className="text-muted">by {entry.actorEmail}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {new Date(entry.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No admin activity recorded yet.</p>
          )}
        </section>
      ) : null}

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold tracking-[0.15em] text-muted uppercase">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <div
              key={action.label}
              aria-disabled="true"
              className="cursor-not-allowed rounded-xl border border-white/5 bg-white/[0.02] p-4 opacity-50"
            >
              <p className="text-sm text-ink">{action.label}</p>
              <p className="mt-1 text-xs text-muted">{action.phase}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface p-5">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-2 text-2xl">{value}</p>
    </div>
  );
}
