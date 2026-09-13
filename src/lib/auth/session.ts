import "server-only";
import { createClient } from "@/lib/supabase/server";
import { hasAdminSurfaceAccess, type Role } from "@/lib/auth/roles";

/**
 * Server-side session/profile/role readers for Server Components, Server
 * Actions, and Route Handlers. All three use the RLS-scoped server client
 * (cookie-based session), never the service-role admin client — so a
 * malicious caller can never make these return another user's data no
 * matter what id they might try to pass in, because there is no id
 * parameter: every query below is implicitly scoped to `auth.uid()` by the
 * "own row" RLS policies on `profiles`/`user_roles` (see
 * supabase/migrations/20260912230000_init_foundation.sql). This is what
 * makes `getCurrentRoles()` safe to use for authorization decisions in
 * server actions, per CLAUDE.md's "server-authoritative" rule.
 */

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, first_name, country_id, entity_id, status, must_change_password, onboarding_completed",
    )
    .eq("id", user.id)
    .maybeSingle();

  return profile;
}

export async function getCurrentRoles(): Promise<Role[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  return (roleRows ?? []).map((row) => row.role as Role);
}

/**
 * The "where does this signed-in user actually belong" tail shared by
 * every post-auth entry point (password sign-in, forced first-login
 * password change, and the magic-link callback route) — previously
 * duplicated identically in two files. Deliberately narrow: callers that
 * already have the profile loaded (avoiding a redundant query) keep doing
 * their own must_change_password/onboarding_completed checks inline; this
 * only extracts the role lookup + branch, which was byte-identical in both
 * places and has nothing else to vary.
 */
export async function resolveRoleBasedDestination(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<"/admin" | "/play"> {
  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const roles = (roleRows ?? []).map((row) => row.role as Role);
  return hasAdminSurfaceAccess(roles) ? "/admin" : "/play";
}
