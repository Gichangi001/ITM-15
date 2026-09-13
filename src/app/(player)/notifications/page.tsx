import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { markNotificationRead, markAllNotificationsRead } from "./actions";

export const metadata: Metadata = { title: "Notifications — ITM@15" };

export const dynamic = "force-dynamic";

const SEVERITY_STYLES: Record<string, string> = {
  URGENT: "border-red-400/40",
  CELEBRATION: "border-gold/40",
  INFO: "border-white/10",
};

/**
 * Product Guide §15.1 (persistent notifications). Every row here is real —
 * written server-side by `src/lib/notifications/create.ts` (day start/end,
 * mission published) or a future admin composer, never client-inserted
 * (no INSERT policy exists on `notifications` at all).
 */
export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, title, message, severity, cta_label, cta_href, read_at, created_at")
    .eq("player_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const unreadCount = (notifications ?? []).filter((n) => !n.read_at).length;

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">ITM@15</p>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl">Notifications</h1>
          {unreadCount > 0 ? (
            <form action={markAllNotificationsRead}>
              <button type="submit" className="text-xs text-muted underline decoration-1 underline-offset-4 hover:text-walumo">
                Mark all read
              </button>
            </form>
          ) : null}
        </div>
      </div>

      {!notifications || notifications.length === 0 ? (
        <p className="text-sm text-muted">Nothing yet — new missions, day updates, and results will show up here.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`flex flex-col gap-1 rounded-xl border bg-surface p-4 ${
                SEVERITY_STYLES[n.severity] ?? SEVERITY_STYLES.INFO
              } ${n.read_at ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-ink">{n.title}</p>
                <span className="shrink-0 text-xs text-muted">
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-muted">{n.message}</p>
              <div className="mt-1 flex items-center gap-3">
                {n.cta_href && n.cta_label ? (
                  <a href={n.cta_href} className="text-xs text-walumo underline decoration-1 underline-offset-4">
                    {n.cta_label}
                  </a>
                ) : null}
                {!n.read_at ? (
                  <form action={markNotificationRead.bind(null, n.id)}>
                    <button type="submit" className="text-xs text-muted underline decoration-1 underline-offset-4 hover:text-walumo">
                      Mark read
                    </button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
