"use client";

import { useActionState, useState } from "react";
import { createEmployeeAccount, type CreateEmployeeState } from "./actions";
import { hasAdminSurfaceAccess, type Role } from "@/lib/auth/roles";

const initialState: CreateEmployeeState = null;

type Country = { id: string; name: string; flag_emoji: string | null };

export function NewPlayerForm({
  countries,
  roles,
}: {
  countries: Country[];
  roles: readonly Role[];
}) {
  const [state, formAction, isPending] = useActionState(createEmployeeAccount, initialState);
  // Tracked in client state (not just the form's own DOM value) so the
  // success message below can describe the right sign-in path for the
  // role that was actually just submitted — this component doesn't
  // unmount across the action call, so this state naturally survives it.
  const [role, setRole] = useState<Role>("PLAYER");
  // src/app/login/actions.ts's checkLoginMethod: every admin-surface role
  // (everything but plain PLAYER) signs in with a password; PLAYER signs
  // in with a one-time emailed link instead, regardless of the temporary
  // Walumo password this action still stores on the account (harmless,
  // just unused for a magic-link account — see that action's own comment).
  const usesPassword = hasAdminSurfaceAccess([role]);

  if (state?.success) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-walumo/40 bg-walumo/10 p-5">
        <p className="text-sm text-ink">
          Account created for <span className="font-semibold">{state.success.email}</span>.
        </p>
        {usesPassword ? (
          <p className="text-sm text-muted">
            Temporary password: <span className="text-ink">Walumo</span>. They must set
            a private password on first sign-in.
          </p>
        ) : (
          <p className="text-sm text-muted">
            They sign in with a one-time emailed link — no password needed. Have them go
            to <span className="text-ink">/login</span> and enter this email.
          </p>
        )}
        <a href="/admin/players/new" className="btn-secondary self-start">
          Add another
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-semibold tracking-wide text-muted uppercase">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fullName" className="text-xs font-semibold tracking-wide text-muted uppercase">
          Full name (optional)
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="countryId" className="text-xs font-semibold tracking-wide text-muted uppercase">
          Country (optional)
        </label>
        <select
          id="countryId"
          name="countryId"
          defaultValue=""
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
        >
          <option value="">Not set</option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.flag_emoji ? `${country.flag_emoji} ` : ""}
              {country.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="role" className="text-xs font-semibold tracking-wide text-muted uppercase">
          Role
        </label>
        <select
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted">
          {usesPassword
            ? "Signs in with a temporary password (Walumo), then sets a private one."
            : "Signs in with a one-time emailed link — no password needed."}
        </p>
      </div>

      {state?.error ? (
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className="btn-primary mt-2">
        {isPending ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}
