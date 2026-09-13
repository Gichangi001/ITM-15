import type { ReactNode } from "react";
import { getCurrentRoles } from "@/lib/auth/session";
import {
  canAwardBonusPoints,
  canCreateEmployeeAccounts,
  canManageContent,
  canManageUserRoles,
  canManageVoting,
  canModerateSubmissions,
  canViewAuditLog,
} from "@/lib/auth/roles";
import { AdminNav } from "@/components/admin/AdminNav";

/**
 * Shared shell for every Phase 5 admin route (Product Guide §26 Phase 5:
 * "Admin layout... Role-based navigation works"). src/proxy.ts's coarse
 * /admin/* gate already keeps a plain PLAYER out entirely; this layout's
 * only job is computing which nav links a specific admin-surface role
 * should see, once, so every page under /admin doesn't repeat it.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const roles = await getCurrentRoles();

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <AdminNav
        capabilities={{
          canManageUsers: canManageUserRoles(roles),
          canCreateAccounts: canCreateEmployeeAccounts(roles),
          canViewAudit: canViewAuditLog(roles),
          canManageContent: canManageContent(roles),
          canModerateSubmissions: canModerateSubmissions(roles),
          canAwardBonusPoints: canAwardBonusPoints(roles),
          canManageVoting: canManageVoting(roles),
        }}
      />
      <div className="flex-1">{children}</div>
    </div>
  );
}
