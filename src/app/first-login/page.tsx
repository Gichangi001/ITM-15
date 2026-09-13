import type { Metadata } from "next";
import { FirstLoginForm } from "./FirstLoginForm";
import { signOut } from "@/app/logout/actions";

export const metadata: Metadata = {
  title: "Create your password — ITM@15",
};

/**
 * Product Guide §5.3. Reachability is enforced by `middleware.ts` (only an
 * authenticated user with `must_change_password = true` lands here — anyone
 * else is redirected away before this component ever renders), so this page
 * itself only needs to render the form.
 */
export default function FirstLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-bg px-6 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15 — Wally Takeover
        </p>
        <h1 className="text-3xl">Create your password</h1>
        <p className="max-w-sm text-sm text-muted">
          Create your private password to continue into the game.
        </p>
      </div>

      <FirstLoginForm />

      <form action={signOut}>
        <button type="submit" className="text-xs text-muted underline underline-offset-2">
          Not you? Sign out
        </button>
      </form>
    </main>
  );
}
