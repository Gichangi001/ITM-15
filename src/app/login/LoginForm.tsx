"use client";

import { useActionState, useState } from "react";
import { signIn, type SignInState } from "./actions";

const initialState: SignInState = null;

/**
 * Progressive reveal, UI-only: the password field is hidden until the
 * email actually looks like an email — specifically, once an "@" has been
 * typed. Earlier this revealed on the very first keystroke (any non-empty
 * value), which popped the password field while the visitor was still
 * typing their name/local-part — confusing, and fixed here. Every
 * account — staff or participant, any email domain — still authenticates
 * with email+password (Product Guide §5.2); this doesn't change who can
 * sign in or how, only when the second field appears. Conditionally
 * rendered (not just CSS-hidden) so it's out of the tab order and not a
 * hidden-but-focusable trap while collapsed.
 */
export function LoginForm() {
  const [state, formAction, isPending] = useActionState(signIn, initialState);
  const [email, setEmail] = useState("");
  const showPassword = email.includes("@");

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-semibold tracking-wide text-muted uppercase">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
        />
      </div>

      {showPassword ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs font-semibold tracking-wide text-muted uppercase">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
          />
        </div>
      ) : null}

      {state?.error ? (
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className="btn-primary mt-2">
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
