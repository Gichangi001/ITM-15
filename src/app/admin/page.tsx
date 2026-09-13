import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { getCurrentProfile, getCurrentRoles } from "@/lib/auth/session";
import {
  canAwardBonusPoints,
  canManageContent,
  canManageVoting,
  canModerateSubmissions,
  canViewAuditLog,
} from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { OnlineCount } from "@/components/realtime/OnlineCount";
import { LiveRefresh } from "@/components/realtime/LiveRefresh";

export const metadata: Metadata = {
  title: "Mission Control — ITM@15",
};

/**
 * Real, working links to what's actually built — never a decorative
 * control. Each entry's `enabled` reads the viewer's own real role
 * capability (src/lib/auth/roles.ts), same gate every underlying page
 * re-checks itself; this list only decides what's *shown as clickable*,
 * it is not itself a security boundary.
 */
const QUICK_ACTIONS = [
  { label: "🎯 Launch mission", href: "/admin/missions/new", capability: "canManageContent" },
  { label: "📅 Unlock a day", href: "/admin/missions", capability: "canManageContent" },
  { label: "📸 Review submissions", href: "/admin/submissions", capability: "canModerateSubmissions" },
  { label: "💰 Award bonus points", href: "/admin/scoring", capability: "canAwardBonusPoints" },
  { label: "🗳 Open a vote", href: "/admin/voting/new", capability: "canManageVoting" },
] as const;

const NOT_YET_BUILT = [
  { label: "📣 Send notification", phase: "Phase 12 — Admin Notifications" },
  { label: "🧍 Trigger Wally", phase: "Phase 13 — Wally 2D Behaviour" },
  { label: "🎨 Change theme", phase: "Phase 15 — Themes" },
  { label: "⏸ Pause game", phase: "Phase 12 — Admin Notifications (Emergency Pause)" },
] as const;

const NOT_YET_AVAILABLE = [
  "Main mission completion rate (Phase 6-8 — needs per-mission attempt/completion aggregation, not built)",
  "Live vote status (Phase 9 — see the real per-poll status on /admin/voting instead)",
  "Current theme (Phase 15)",
];

// One icon per audit_logs action string that actually exists in the
// codebase today (verified by grepping every `action: "..."` call site) —
// never a guessed/aspirational category. Add a row here in the same commit
// that adds a new action string, not before.
const ACTIVITY_ICONS: Record<string, string> = {
  mission_created: "🎯",
  mission_status_changed: "🎯",
  game_day_status_changed: "📅",
  submission_approved: "📸",
  submission_rejected: "📸",
  bonus_points_awarded: "💰",
  poll_created: "🗳",
  poll_status_changed: "🗳",
  employee_account_created: "👤",
  user_role_status_updated: "👤",
  media_asset_uploaded: "🖼",
  media_asset_featured_toggled: "🖼",
};

/**
 * Product Guide §17 (Admin Mission Control), §26 Phase 5 build list:
 * "Admin layout. Real-time KPI cards. Players table. Role filters. Audit
 * viewer. Quick-action placeholders." Phase 5's own acceptance criteria
 * are deliberately modest — "Admin can monitor account state... Role-based
 * navigation works" — not a fully wired operations center, which needs the
 * content/scoring/voting/moderation/realtime engines from Phases 6-12.
 *
 * The KPI cards below show real, live-queried numbers for what already
 * exists (active accounts, active countries, campaign status, pending
 * moderation) and one genuinely live one — "Players online now" via
 * `OnlineCount` (Phase 11, Product Guide §14.3 Presence) — rather than
 * fabricating any of it; a fake static "Players online: 12" would be
 * exactly the "fake demo" the Storyline Build Bible §39 forbids, which is
 * why this counter reads "—" until the realtime channel's first sync
 * event actually reports a real number, rather than defaulting to 0.
 * What still can't be computed is listed honestly below the cards.
 *
 * Quick actions (§17.3) are real links to the real pages that now exist
 * (Phases 6, 8-10) — each one still independently re-checks its own role
 * capability server-side the moment you land on it, this list just decides
 * what's shown as clickable versus honestly locked with the phase it
 * needs. No decorative buttons: every visible action goes somewhere real.
 */
export default async function AdminHomePage() {
  const [profile, roles] = await Promise.all([getCurrentProfile(), getCurrentRoles()]);
  const admin = createAdminClient();

  const capabilities = {
    canManageContent: canManageContent(roles),
    canModerateSubmissions: canModerateSubmissions(roles),
    canAwardBonusPoints: canAwardBonusPoints(roles),
    canManageVoting: canManageVoting(roles),
  } as const;

  const [
    { count: activeAccountCount },
    { data: countryRows },
    { data: campaign },
    { count: pendingModerationCount },
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("status", "ACTIVE"),
    admin.from("profiles").select("country_id").eq("status", "ACTIVE").not("country_id", "is", null),
    admin
      .from("campaigns")
      .select("name, status")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin.from("submissions").select("id", { count: "exact", head: true }).eq("status", "PENDING"),
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
        // audit_logs.actor_id is `ON DELETE SET NULL` against auth.users —
        // a real admin performed every one of these actions; this branch
        // only fires once that admin's account has since been deleted
        // (e.g. a synthetic test account cleaned up after verification).
        // "system" would misleadingly imply an automated/non-human action,
        // which never happens anywhere in this codebase today — say what
        // actually happened instead.
        actorEmail: (row.actor_id && emailById.get(row.actor_id)) || "an admin (account since removed)",
        createdAt: row.created_at,
      }));
    }
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-10 sm:px-6">
      {/* Phase 11: refreshes this whole page's server-fetched data (KPIs,
          recent activity) whenever any admin action anywhere writes an
          audit log — see src/lib/admin/audit.ts. */}
      <LiveRefresh topic="admin:mission-control" events={["activity.created"]} />

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
          <KpiCard label="Players online now" value={<OnlineCount />} />
          <KpiCard label="Pending moderation" value={String(pendingModerationCount ?? 0)} />
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
                    <span aria-hidden="true">{ACTIVITY_ICONS[entry.action] ?? "•"}</span>{" "}
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
          {QUICK_ACTIONS.filter((action) => capabilities[action.capability]).map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="rounded-xl border border-white/10 bg-surface p-4 transition hover:border-walumo/40"
            >
              <p className="text-sm text-ink">{action.label}</p>
            </Link>
          ))}
          {NOT_YET_BUILT.map((action) => (
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

function KpiCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface p-5">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-2 text-2xl">{value}</p>
    </div>
  );
}
