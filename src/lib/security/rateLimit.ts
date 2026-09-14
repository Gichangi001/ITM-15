import "server-only";
import { headers } from "next/headers";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Added directly in response to a dedicated security review (Phase 20):
 * `checkLoginMethod`/`instantJoin` (src/app/login/actions.ts) had no rate
 * limit at all, which (a) let an anonymous visitor probe, one guess at a
 * time with no friction, which email addresses hold an admin-surface
 * role, and (b) let self-registration be used to harvest arbitrary email
 * addresses into `profiles` at no cost. A plain Postgres hit-log +
 * count-in-window check — this app already leans on Postgres for every
 * other integrity backstop, and login-attempt volume at event scale never
 * approaches a range where that's the wrong tool.
 *
 * Rate-limited by client IP (`x-forwarded-for`, which Vercel sets), not
 * by the email being submitted — limiting by email would do nothing to
 * stop probing many *different* emails from the same visitor, which is
 * exactly the harvesting/enumeration behavior this exists to slow down.
 * Falls back to a constant identifier if no IP header is present (e.g.
 * local dev): a real gap in that one environment, not production, where
 * Vercel always sets this header.
 */
async function getClientIdentifier(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }
  return headerList.get("x-real-ip") ?? "unknown";
}

/**
 * Returns `true` if the caller is currently rate-limited (has already hit
 * `maxHits` within the last `windowSeconds`), and records this attempt
 * either way — a rate-limited caller still counts toward the next
 * window, so retrying faster never resets the clock.
 */
export async function isRateLimited(
  admin: AdminClient,
  bucket: string,
  maxHits: number,
  windowSeconds: number,
): Promise<boolean> {
  const identifier = await getClientIdentifier();
  const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString();

  const { count } = await admin
    .from("login_rate_limit_hits")
    .select("id", { count: "exact", head: true })
    .eq("bucket", bucket)
    .eq("identifier", identifier)
    .gte("created_at", windowStart);

  const limited = (count ?? 0) >= maxHits;

  await admin.from("login_rate_limit_hits").insert({ bucket, identifier });

  // Opportunistic cleanup — no cron infrastructure exists in this
  // project (see docs/PROJECT_STATE.md's Phase 16 disclosure), so this
  // table self-prunes on the traffic that already hits it rather than
  // growing unboundedly. A short, fixed retention window unrelated to
  // any specific bucket's own window.
  const pruneBefore = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  await admin.from("login_rate_limit_hits").delete().lt("created_at", pruneBefore);

  return limited;
}
