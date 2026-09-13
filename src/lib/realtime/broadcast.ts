import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Product Guide §14 (Realtime Engine) / runbook §21 ("Realtime is
 * presentation/coordination, not authority. The database/server decides
 * whether an event is valid... A client that misses a realtime event must
 * recover correct state by refetching canonical server state.").
 *
 * Every broadcast sent through this helper carries the bare minimum — an
 * event name and, at most, an id to key a refetch by. Never put anything
 * a client could otherwise not see through its own RLS-scoped query into
 * the payload (a score, a vote count, another player's name) — the whole
 * design here is "something changed, go refetch," with the actual data
 * always coming from a subsequent RLS/service-role-gated fetch (typically
 * a Server Component re-render via `router.refresh()`, see
 * `src/lib/realtime/useLiveRefresh.ts`). This is also why these topics
 * don't need Supabase's Realtime Authorization (private-channel RLS) —
 * nothing sent here is sensitive enough to need gating who can *receive*
 * the ping, only who can act on the refetch it triggers.
 *
 * Uses the service-role client's REST-based broadcast (Supabase's
 * "broadcast from the server" pattern — no persistent channel subscription
 * needed for a one-off send).
 */
export async function broadcast(
  topic: string,
  event: string,
  payload: Record<string, unknown> = {},
) {
  const admin = createAdminClient();
  const channel = admin.channel(topic);
  try {
    await channel.send({ type: "broadcast", event, payload });
  } finally {
    await admin.removeChannel(channel);
  }
}
