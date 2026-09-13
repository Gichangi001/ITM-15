import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentProfile, getCurrentRoles } from "@/lib/auth/session";
import { canCreateEmployeeAccounts, canManageUserRoles } from "@/lib/auth/roles";
import { signOut } from "@/app/logout/actions";

export const metadata: Metadata = {
  title: "Mission Control — ITM@15",
};

/**
 * Honest placeholder, same reasoning as src/app/play/page.tsx — this is not
 * the Phase 5 Mission Control dashboard, just a real authenticated
 * destination proving "admin routes reject normal players" (middleware.ts
 * already redirects a PLAYER-only user away before this ever renders) and
 * giving Phase 2's one real admin action (create employee) somewhere to
 * live.
 */
export default async function AdminHomePage() {
  const [profile, roles] = await Promise.all([getCurrentProfile(), getCurrentRoles()]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 py-16 text-center">
      <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
        ITM@15 — Mission Control
      </p>
      <h1 className="text-3xl">Admin</h1>
      <p className="max-w-md text-sm text-muted">
        Signed in as <span className="text-ink">{profile?.email}</span>, role
        {roles.length === 1 ? "" : "s"}: <span className="text-ink">{roles.join(", ")}</span>.
        The full Mission Control dashboard (Product Guide Phase 5) isn&apos;t built
        yet.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {canCreateEmployeeAccounts(roles) ? (
          <Link href="/admin/players/new" className="btn-secondary">
            Add player
          </Link>
        ) : null}
        {canManageUserRoles(roles) ? (
          <Link href="/admin/players" className="btn-secondary">
            Users
          </Link>
        ) : null}
        <form action={signOut}>
          <button type="submit" className="btn-secondary">
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
