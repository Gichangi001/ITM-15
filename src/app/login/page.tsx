import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in — ITM@15",
};

const MIDDLEWARE_ERROR_MESSAGES: Record<string, string> = {
  disabled: "This account has been disabled. Contact your administrator.",
  account_not_found: "We couldn't find your player profile. Contact your administrator.",
  magic_link_failed: "That sign-in link has expired or was already used. Request a new one below.",
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const errorParam = typeof params.error === "string" ? params.error : undefined;
  const middlewareError = errorParam ? MIDDLEWARE_ERROR_MESSAGES[errorParam] : undefined;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-bg px-6 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15 — Wally Takeover
        </p>
        <h1 className="text-3xl">Sign in</h1>
        <p className="max-w-sm text-sm text-muted">
          Enter your email to continue — some accounts need a password, most just need a
          sign-in link.
        </p>
      </div>

      {middlewareError ? (
        <p role="alert" className="max-w-sm text-center text-sm text-red-400">
          {middlewareError}
        </p>
      ) : null}

      <LoginForm />
    </main>
  );
}
