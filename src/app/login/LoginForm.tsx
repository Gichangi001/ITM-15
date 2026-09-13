"use client";

import { useActionState, useState, useTransition } from "react";
import { signIn, checkLoginMethod, instantJoin, type SignInState, type LoginMethod, type InstantJoinState } from "./actions";

const initialSignInState: SignInState = null;
const initialInstantJoinState: InstantJoinState = null;

/**
 * Per the product owner's explicit instruction: the real admin account
 * (and any other admin-surface account) signs in with a password, same as
 * always. Every other invited account — or a brand-new one, see
 * `instantJoin` — goes straight in the instant a real-looking email is
 * typed. `checkLoginMethod` (a server action, so this can never be
 * spoofed by editing client state — the actual sign-in path re-derives
 * the same check server-side regardless of what the UI showed) decides
 * which happens.
 */
export function LoginForm() {
  const [signInState, signInAction, isSigningIn] = useActionState(signIn, initialSignInState);
  const [instantJoinState, instantJoinAction, isJoining] = useActionState(instantJoin, initialInstantJoinState);
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<LoginMethod | null>(null);
  const [isChecking, startChecking] = useTransition();

  function handleEmailChange(value: string) {
    setEmail(value);
    // Any further edit invalidates whatever method was resolved for the
    // previous value — re-check on the next blur rather than trusting a
    // stale answer for a since-edited address.
    setMethod(null);
  }

  function handleEmailBlur() {
    const trimmed = email.trim();
    if (!trimmed.includes("@") || method !== null) return;
    startChecking(async () => {
      const result = await checkLoginMethod(trimmed);
      setMethod(result);
    });
  }

  const showPassword = method === "password";
  const showInstant = method === "instant";

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
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
          onChange={(e) => handleEmailChange(e.target.value)}
          onBlur={handleEmailBlur}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
        />
        {isChecking ? <p className="text-xs text-muted">Checking…</p> : null}
      </div>

      {showPassword ? (
        <form action={signInAction} className="flex flex-col gap-4">
          <input type="hidden" name="email" value={email} />
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
          {signInState?.error ? (
            <p role="alert" className="text-sm text-red-400">
              {signInState.error}
            </p>
          ) : null}
          <button type="submit" disabled={isSigningIn} className="btn-primary mt-2">
            {isSigningIn ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : null}

      {showInstant ? (
        <form action={instantJoinAction} className="flex flex-col gap-3">
          <input type="hidden" name="email" value={email} />
          {instantJoinState?.error ? (
            <p role="alert" className="text-sm text-red-400">
              {instantJoinState.error}
            </p>
          ) : null}
          <button type="submit" disabled={isJoining} className="btn-primary">
            {isJoining ? "Joining…" : "Enter ITM@15"}
          </button>
          <p className="text-xs text-muted">No password needed.</p>
        </form>
      ) : null}

      {/* Fallback path when the email field is only prefilled/autofilled
          without a real blur event (e.g. a password manager) — this
          triggers the same check `onBlur` does. */}
      {!showPassword && !showInstant ? (
        <button type="button" onClick={handleEmailBlur} className="btn-secondary">
          Continue
        </button>
      ) : null}
    </div>
  );
}
