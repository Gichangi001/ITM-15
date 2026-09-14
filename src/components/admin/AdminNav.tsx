"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/logout/actions";

export type AdminNavCapabilities = {
  canManageUsers: boolean;
  canCreateAccounts: boolean;
  canViewAudit: boolean;
  canManageContent: boolean;
  canModerateSubmissions: boolean;
  canAwardBonusPoints: boolean;
  canManageVoting: boolean;
  canManageThemes: boolean;
};

/**
 * Product Guide §26 Phase 5: "Responsive desktop/tablet dashboard...
 * Role-based navigation works." Which links render at all depends on the
 * signed-in admin's actual capabilities (computed server-side in
 * layout.tsx from their real role rows, passed down as plain booleans —
 * this component makes no authorization decision itself). A
 * MODERATOR/COUNTRY_ADMIN/GAME_MASTER/ANALYTICS_VIEWER account sees only
 * "Overview"; this is presentation only; every gated page independently
 * re-checks the same capability server-side (see e.g.
 * src/app/admin/players/page.tsx), so hiding a link here is not itself the
 * security boundary.
 */
export function AdminNav({ capabilities }: { capabilities: AdminNavCapabilities }) {
  const pathname = usePathname();

  const items: { href: string; label: string }[] = [{ href: "/admin", label: "Overview" }];
  if (capabilities.canManageUsers) {
    items.push({ href: "/admin/players", label: "Users" });
  }
  if (capabilities.canCreateAccounts) {
    items.push({ href: "/admin/players/new", label: "Add Player" });
  }
  if (capabilities.canManageContent) {
    items.push({ href: "/admin/missions", label: "Missions" });
    items.push({ href: "/admin/media", label: "Media" });
  }
  if (capabilities.canModerateSubmissions) {
    items.push({ href: "/admin/submissions", label: "Submissions" });
  }
  if (capabilities.canAwardBonusPoints) {
    items.push({ href: "/admin/scoring", label: "Scoring" });
  }
  if (capabilities.canManageVoting) {
    items.push({ href: "/admin/voting", label: "Voting" });
  }
  if (capabilities.canManageThemes) {
    items.push({ href: "/admin/themes", label: "Themes" });
  }
  if (capabilities.canViewAudit) {
    items.push({ href: "/admin/audit", label: "Audit Log" });
  }

  return (
    <nav aria-label="Admin navigation" className="border-b border-white/5 bg-bg">
      <ul className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4 py-3 sm:px-6">
        <li className="mr-2 shrink-0 text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          Mission Control
        </li>
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`block rounded-full px-3.5 py-1.5 text-sm whitespace-nowrap transition ${
                  isActive ? "bg-walumo/15 text-walumo" : "text-muted hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
        <li className="ml-auto shrink-0">
          <form action={signOut}>
            <button type="submit" className="btn-secondary px-3.5 py-1.5 text-xs">
              Sign out
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}
