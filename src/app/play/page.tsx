import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/auth/session";
import { signOut } from "@/app/logout/actions";

export const metadata: Metadata = {
  title: "Player Home — ITM@15",
};

/**
 * Deliberately a real, honestly-labeled placeholder — NOT the Phase 4
 * player shell. It exists only to give the Phase 2 auth flow a genuine
 * authenticated destination to redirect to, so "player must create a
 * private password before entering game" (Product Guide §26 Phase 2
 * acceptance) has something real to land on. Shows the actual signed-in
 * profile's own data (via `getCurrentProfile`'s RLS-scoped "own row" query)
 * — never fabricated game state — per the Storyline Build Bible §39's
 * standing rule against fake demos.
 */
export default async function PlayPage() {
  const profile = await getCurrentProfile();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 py-16 text-center">
      <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
        ITM@15 — Wally Takeover
      </p>
      <h1 className="text-3xl">You&apos;re in.</h1>
      <p className="max-w-md text-sm text-muted">
        Signed in as <span className="text-ink">{profile?.email}</span>. The player
        experience (Product Guide Phase 4+) isn&apos;t built yet — this page exists to
        prove the Phase 2 auth gate works end to end.
      </p>
      <form action={signOut}>
        <button type="submit" className="btn-secondary">
          Sign out
        </button>
      </form>
    </main>
  );
}
