import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentRoles } from "@/lib/auth/session";
import { canSendNotifications } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { ComposeNotificationForm } from "./ComposeNotificationForm";

export const metadata: Metadata = { title: "Notifications — ITM@15" };

const AUDIENCE_LABEL: Record<string, string> = {
  GLOBAL: "Everyone",
  COUNTRY: "Country",
  ENTITY: "Entity",
  PLAYER: "Player",
};

/**
 * Product Guide §15.2 / §27's `/admin/notifications` route. The composer
 * half of Phase 12 (see actions.ts's header for the full context on why
 * this was blocked and what unblocked it) — the automated day/mission
 * status fan-out (src/lib/notifications/create.ts) already existed before
 * this; this is the first place an admin can compose and send a real,
 * arbitrary message.
 */
export default async function AdminNotificationsPage() {
  const roles = await getCurrentRoles();
  if (!canSendNotifications(roles)) {
    redirect("/admin");
  }

  const admin = createAdminClient();
  const [{ data: countries }, { data: entities }, { data: history }] = await Promise.all([
    admin.from("countries").select("id, name, flag_emoji").order("name"),
    admin.from("entities").select("id, name").order("name"),
    admin
      .from("admin_notifications")
      .select("id, audience_type, audience_id, title, message, severity, recipient_count, created_by, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const creatorIds = [...new Set((history ?? []).map((row) => row.created_by).filter((id): id is string => Boolean(id)))];
  const { data: creators } =
    creatorIds.length > 0 ? await admin.from("profiles").select("id, email").in("id", creatorIds) : { data: [] };
  const creatorEmailById = new Map((creators ?? []).map((c) => [c.id, c.email]));

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 bg-bg px-6 py-16">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">ITM@15 — Mission Control</p>
        <h1 className="text-3xl">Notifications</h1>
        <p className="text-sm text-muted">
          Every send writes a real row for each targeted player and an audit log entry — the
          recipient count below is always the real, server-resolved count, never a guess.
        </p>
      </div>

      <ComposeNotificationForm countries={countries ?? []} entities={entities ?? []} />

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold tracking-[0.15em] text-muted uppercase">Recent sends</h2>
        {!history || history.length === 0 ? (
          <p className="text-sm text-muted">Nothing sent yet.</p>
        ) : (
          <ol className="flex flex-col divide-y divide-white/5 rounded-xl border border-white/10 bg-surface">
            {history.map((row) => (
              <li key={row.id} className="flex flex-col gap-1 px-5 py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-ink">{row.title}</span>
                  <span className="shrink-0 text-xs text-muted">{new Date(row.created_at).toLocaleString()}</span>
                </div>
                <p className="text-muted">{row.message}</p>
                <p className="text-xs text-muted">
                  {AUDIENCE_LABEL[row.audience_type] ?? row.audience_type} · {row.recipient_count} recipient
                  {row.recipient_count === 1 ? "" : "s"} · sent by{" "}
                  {(row.created_by && creatorEmailById.get(row.created_by)) || "unknown"}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
