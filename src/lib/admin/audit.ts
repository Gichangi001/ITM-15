import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";
import { broadcast } from "@/lib/realtime/broadcast";

type AuditLogInput = {
  actorId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, Json | undefined>;
};

/**
 * Every high-impact admin action writes an audit_logs row (CLAUDE.md:
 * "Admin actions affecting gameplay are auditable") — this project already
 * did that consistently before Phase 11 existed. What's new here: the same
 * write now also pings `admin:mission-control` (Product Guide §17.2's
 * "Live Activity Feed"), so `/admin`'s recent-activity list updates for
 * every connected admin without a manual refresh. The broadcast payload
 * carries only the action name, never the metadata — an admin's client
 * refetches the real feed through the service-role page query, same
 * "broadcast is a ping, not the data" rule as every other channel in
 * `src/lib/realtime/broadcast.ts`.
 *
 * A thin wrapper, not a new abstraction over `audit_logs` itself — every
 * call site still passes exactly the columns it did before; this just
 * de-duplicates the insert+broadcast pairing across the ~10 admin actions
 * that need it.
 */
export async function logAdminActivity(
  admin: ReturnType<typeof createAdminClient>,
  input: AuditLogInput,
) {
  await admin.from("audit_logs").insert({
    actor_id: input.actorId,
    action: input.action,
    target_type: input.targetType ?? null,
    target_id: input.targetId ?? null,
    metadata: input.metadata ?? {},
  });

  await broadcast("admin:mission-control", "activity.created", {
    action: input.action,
  });
}
