import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/session";
import { signOut } from "@/app/logout/actions";
import { createClient } from "@/lib/supabase/server";
import { PlayerTransition } from "@/components/story/founder/PlayerTransition";

export const metadata: Metadata = {
  title: "Play — ITM@15",
};

const SHELL_LINKS = [
  {
    href: "/passport",
    label: "Passport",
    blurb: "Your country stamps, collected from real activity.",
  },
  {
    href: "/leaderboards",
    label: "Leaderboards",
    blurb: "Individual, squad and country standings.",
  },
  {
    href: "/gallery",
    label: "Gallery",
    blurb: "Approved photos from the campaign.",
  },
  {
    href: "/achievements",
    label: "Achievements",
    blurb: "Badges earned along the way.",
  },
] as const;

/**
 * Product Guide §7.1's full player home (Wally greeting with live game
 * state, current day/mission card, points, Unity Points, squad rank,
 * country position, countdown, live event banner...) needs the
 * content/mission/scoring engines (Phases 6-8) — none of that exists yet.
 *
 * This is the real Phase 4 shell instead: real signed-in profile data (the
 * greeting uses the player's actual first name, captured at onboarding),
 * real navigation to every player route, and honestly labeled placeholders
 * for everything that needs a backend this app doesn't have yet. Per the
 * Storyline Build Bible §39, a fabricated mission card or a fake point
 * total here would be exactly the "fake demo" it forbids — this isn't
 * that.
 */
export default async function PlayPage() {
  const profile = await getCurrentProfile();
  const greetingName = profile?.first_name || profile?.email;

  let countryName: string | null = null;
  if (profile?.country_id) {
    const supabase = await createClient();
    const { data: country } = await supabase
      .from("countries")
      .select("name")
      .eq("id", profile.country_id)
      .maybeSingle();
    countryName = country?.name ?? null;
  }

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-10 sm:px-6">
      {/* docs/ITM15_FOUNDER_STORY_OPENING_CHAPTER.md §23 — the one, real,
          personalized moment that follows the public founder story;
          firstName/countryName come from this player's real profile,
          never invented (see PlayerTransition's own header comment). */}
      {profile?.first_name ? (
        <PlayerTransition firstName={profile.first_name} countryName={countryName} />
      ) : null}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15 — Wally Takeover
        </p>
        <h1 className="text-3xl">Welcome, {greetingName}.</h1>
        <p className="max-w-lg text-sm text-muted">
          The seven-day mission engine (Product Guide Phase 6+) isn&apos;t built
          yet, so there&apos;s no active day or mission to show here. This is the
          real player shell — every link below is a working route that will
          fill in with real game state as each part of the game is built.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SHELL_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl border border-white/10 bg-surface p-5 transition hover:border-walumo/40"
          >
            <p className="font-semibold">{link.label}</p>
            <p className="mt-1 text-sm text-muted">{link.blurb}</p>
          </Link>
        ))}
      </div>

      <form action={signOut}>
        <button type="submit" className="btn-secondary self-start">
          Sign out
        </button>
      </form>
    </main>
  );
}
