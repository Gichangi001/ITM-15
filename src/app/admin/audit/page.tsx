import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentRoles } from "@/lib/auth/session";
import { canViewAuditLog } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Audit Log — ITM@15",
};

const PAGE_SIZE = 50;

/**
 * Product Guide §4.5 ("audit records" — Super Admin capability), §27
 * (`/admin/audit`), §26 Phase 5 build list ("Audit viewer"). Reads via the
 * service-role admin client — audit_logs has RLS enabled with zero
 * policies for anon/authenticated (see the foundation migration's
 * comment), so this is the only way to read it at all, from anywhere.
 */
export default async function AuditLogPage() {
  const roles = await getCurrentRoles();
  if (!canViewAuditLog(roles)) {
    redirect("/admin");
  }

  const admin = createAdminClient();
  const { data: auditRows } = await admin
    .from("audit_logs")
    .select("id, actor_id, action, target_type, target_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  const actorIds = [
    ...new Set((auditRows ?? []).map((row) => row.actor_id).filter(Boolean)),
  ] as string[];
  const { data: actorProfiles } =
    actorIds.length > 0
      ? await admin.from("profiles").select("id, email").in("id", actorIds)
      : { data: [] as { id: string; email: string }[] };
  const emailById = new Map((actorProfiles ?? []).map((p) => [p.id, p.email]));

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 bg-bg px-6 py-16">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15 — Mission Control
        </p>
        <h1 className="text-3xl">Audit log</h1>
        <p className="text-sm text-muted">
          Every high-impact admin action, most recent first. Showing up to the
          last {PAGE_SIZE} entries.
        </p>
      </div>

      {!auditRows || auditRows.length === 0 ? (
        <p className="text-sm text-muted">No audit entries yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">When</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold">Actor</th>
                <th className="px-4 py-3 font-semibold">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {auditRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-ink">{row.action.replaceAll("_", " ")}</td>
                  <td className="px-4 py-3 text-muted">
                    {(row.actor_id && emailById.get(row.actor_id)) || "system"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {row.target_type ? `${row.target_type}${row.target_id ? ` · ${row.target_id.slice(0, 8)}…` : ""}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
