import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentRoles, getCurrentUser } from "@/lib/auth/session";
import { canManageUserRoles, ROLES, type Role } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateUser } from "./actions";

export const metadata: Metadata = {
  title: "Users — ITM@15",
};

const ERROR_MESSAGES: Record<string, string> = {
  not_authorized: "You are not authorized to manage users.",
  invalid_input: "That update didn't look right — nothing was changed.",
  cannot_edit_self: "You can't change your own role or status here.",
  update_failed: "Something went wrong saving that change. Try again.",
};

/**
 * Product Guide §4.5 ("user administration, permission management") / §27
 * (`/admin/players`). Super-Admin-only — see canManageUserRoles. Reads via
 * the service-role admin client (deliberately, after the role check above):
 * a Super Admin managing the whole roster needs to see every user, which
 * the RLS "own row" policies on profiles/user_roles correctly refuse to a
 * plain authenticated client.
 */
export default async function PlayersPage({
  searchParams,
}: PageProps<"/admin/players">) {
  const roles = await getCurrentRoles();
  if (!canManageUserRoles(roles)) {
    redirect("/admin");
  }

  const currentUser = await getCurrentUser();
  const params = await searchParams;
  const errorParam = typeof params.error === "string" ? params.error : undefined;
  const errorMessage = errorParam ? ERROR_MESSAGES[errorParam] : undefined;
  const succeeded = params.success === "1";

  // Product Guide §26 Phase 5 build list: "Role filters." A plain query
  // param rather than client-side JS — this page is otherwise a Server
  // Component with no client interactivity, and a GET form degrades
  // correctly with JS disabled.
  const roleFilterParam = typeof params.role === "string" ? params.role : undefined;
  const roleFilter: Role | undefined = ROLES.find((role) => role === roleFilterParam);

  const admin = createAdminClient();
  const [{ data: profiles }, { data: roleRows }] = await Promise.all([
    admin.from("profiles").select("id, email, full_name, status").order("email"),
    admin.from("user_roles").select("user_id, role"),
  ]);

  const rolesByUser = new Map<string, string[]>();
  for (const row of roleRows ?? []) {
    const existing = rolesByUser.get(row.user_id) ?? [];
    existing.push(row.role);
    rolesByUser.set(row.user_id, existing);
  }

  const visibleProfiles = (profiles ?? []).filter((profile) => {
    if (!roleFilter) return true;
    const userRoles = rolesByUser.get(profile.id) ?? ["PLAYER"];
    return userRoles.includes(roleFilter);
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 bg-bg px-6 py-16">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15 — Mission Control
        </p>
        <h1 className="text-3xl">Users</h1>
        <p className="text-sm text-muted">
          Change a user&apos;s role or status. Every change is logged to the audit
          trail.
        </p>
      </div>

      {/* Plain GET form — this page is a Server Component with no other
          client interactivity, so a submit button (rather than an
          auto-submitting onChange, which would require a Client Component)
          keeps it that way and works identically with JS disabled. */}
      <form className="flex flex-wrap items-center gap-2 text-sm">
        <label htmlFor="role-filter" className="text-xs font-semibold tracking-wide text-muted uppercase">
          Filter by role
        </label>
        <select
          id="role-filter"
          name="role"
          defaultValue={roleFilter ?? ""}
          className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-ink"
        >
          <option value="">All roles</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
          Apply
        </button>
      </form>

      {succeeded ? (
        <p role="status" className="text-sm text-walumo">
          Updated.
        </p>
      ) : null}
      {errorMessage ? (
        <p role="alert" className="text-sm text-red-400">
          {errorMessage}
        </p>
      ) : null}

      {visibleProfiles.length === 0 ? (
        <p className="text-sm text-muted">No users match that filter.</p>
      ) : null}

      <div className="flex flex-col gap-3">
        {visibleProfiles.map((profile) => {
          const userRoles = rolesByUser.get(profile.id) ?? [];
          const currentRole = userRoles[0] ?? "PLAYER";
          const isSelf = profile.id === currentUser?.id;

          return (
            <div
              key={profile.id}
              className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-0.5">
                <p className="text-sm text-ink">
                  {profile.full_name || profile.email}
                  {isSelf ? <span className="text-muted"> (you)</span> : null}
                </p>
                <p className="text-xs text-muted">{profile.email}</p>
              </div>

              {isSelf ? (
                <p className="text-xs text-muted">
                  {currentRole} · {profile.status}
                </p>
              ) : (
                <form action={updateUser} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="userId" value={profile.id} />
                  <select
                    name="role"
                    defaultValue={currentRole}
                    className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-ink"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <select
                    name="status"
                    defaultValue={profile.status}
                    className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-ink"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DISABLED">DISABLED</option>
                  </select>
                  <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
                    Save
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
