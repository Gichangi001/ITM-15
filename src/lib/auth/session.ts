import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/auth/roles";

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
