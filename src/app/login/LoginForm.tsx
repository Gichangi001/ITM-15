"use client";

import { useActionState, useState, useTransition } from "react";
import { signIn, checkLoginMethod, sendMagicLink, type SignInState, type LoginMethod, type MagicLinkState } from "./actions";

const initialSignInState: SignInState = null;
const initialMagicLinkState: MagicLinkState = null;

/**
 * Per the product owner's explicit instruction: the real admin account
 * (and any other admin-surface account) signs in with a password, same as
 * always. Every other invited account no longer needs one at all — once
 * the visitor types a real-looking email, `checkLoginMethod` (a server
 * action, so this can never be spoofed by editing client state — the
 * actual sign-in path re-derives the same check server-side regardless of
 * what the UI showed) decides which credential to ask for next.
 *
 * This is a genuine one-time emailed sign-in link (see
 * `src/app/login/actions.ts`'s `sendMagicLink`), never a bare "typing an
 * email logs you in" shortcut — no account can be authenticated without
 * actually receiving and clicking that link.
 */
export function LoginForm() {
  const [signInState, signInAction, isSigningIn] = useActionState(signIn, initialSignInState);
  const [magicLinkState, magicLinkAction, isSendingLink] = useActionState(sendMagicLink, initialMagicLinkState);
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<LoginMethod | "checking" | null>(null);
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
  const showMagicLink = method === "magic_link";
  const linkSent = showMagicLink && magicLinkState?.success === true;

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
          disabled={linkSent}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo disabled:opacity-60"
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

      {showMagicLink ? (
        linkSent ? (
          <p role="status" className="text-sm text-walumo">
            Check {email} for a sign-in link. It expires after a while and works once — request a new one if it doesn&apos;t arrive.
          </p>
        ) : (
          <form action={magicLinkAction} className="flex flex-col gap-3">
            <input type="hidden" name="email" value={email} />
            {magicLinkState?.error ? (
              <p role="alert" className="text-sm text-red-400">
                {magicLinkState.error}
              </p>
            ) : null}
            <button type="submit" disabled={isSendingLink} className="btn-primary">
              {isSendingLink ? "Sending…" : "Email me a sign-in link"}
            </button>
            <p className="text-xs text-muted">No password needed — we&apos;ll email you a one-time link instead.</p>
          </form>
        )
      ) : null}

      {/* Fallback path when the email field is only prefilled/autofilled
          without a real blur event (e.g. a password manager) — plain
          Enter still submits a password sign-in if that's what was
          resolved; otherwise this stays inert (no method chosen yet). */}
      {!showPassword && !showMagicLink ? (
        <button
          type="button"
          onClick={handleEmailBlur}
          className="btn-secondary"
        >
          Continue
        </button>
      ) : null}
    </div>
  );
}
