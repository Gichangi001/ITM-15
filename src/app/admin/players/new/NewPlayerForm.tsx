"use client";

import { useActionState } from "react";
import { createEmployeeAccount, type CreateEmployeeState } from "./actions";
import type { Role } from "@/lib/auth/roles";

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

  if (state?.success) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-walumo/40 bg-walumo/10 p-5">
        <p className="text-sm text-ink">
          Account created for <span className="font-semibold">{state.success.email}</span>.
        </p>
        <p className="text-sm text-muted">
          Temporary password: <span className="text-ink">Walumo</span>. They must set
          a private password on first sign-in.
        </p>
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
          defaultValue="PLAYER"
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
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
