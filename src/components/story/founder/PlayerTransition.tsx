"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { WALLY_POSES } from "@/wally/rendering/assets";
import { founderPlayerTransition } from "@/content/founderStory";
import { AFRICAN_COUNTRIES } from "@/content/africanCountries";
import { JOURNEY_STOPS } from "@/content/journey";
import { trackEvent } from "@/lib/analytics/track";

const DRC = { name: "DR Congo", flag: "🇨🇩" };
const DESTINATIONS = JOURNEY_STOPS.filter(
  (s): s is (typeof JOURNEY_STOPS)[number] & { dayNumber: number } => s.dayNumber !== null,
);

type Beat = "flags" | "destinations" | "yourCountry" | "reveal" | "flight" | "welcome";

/**
 * §23 "Player Transition" — personalized, so it can only ever be built
 * for a real, authenticated, onboarded player, never the public
 * `/story/founder` sequence (see src/content/founderStory.ts's header
 * comment). `firstName`/`countryName`/`countryFlag` are passed in from a
 * Server Component that already resolved them from the real `profiles`
 * row (src/app/(player)/play/page.tsx) — this component never invents or
 * guesses any of them.
 *
 * Shown once per browser session (sessionStorage), the same lightweight
 * "don't repeat a one-time beat" mechanism `WallyProvider`'s
 * LOGIN_GREETING already uses.
 *
 * 2026-09-16 (user report: "the landing page becomes static for too
 * long"): rebuilt from a single static welcome card into a short,
 * continuously-animated arrival cinematic — every African country's flag,
 * then the seven journey destinations, then the player's own real
 * country highlighted, then Kinshasa (the actual event location)
 * revealed, then an animated flight path from their country to Kinshasa
 * — before landing on the original welcome content. Every beat is
 * genuinely moving (a scrolling marquee, staggered pop-ins, a drawn
 * flight path), which is what actually answers "static," not just a
 * shorter duration. Auto-advances; skippable at any point; skips the
 * whole cinematic under prefers-reduced-motion rather than showing a
 * motionless version of a flight animation.
 */
export function PlayerTransition({
  firstName,
  countryName,
  countryFlag,
}: {
  firstName: string;
  countryName: string | null;
  countryFlag: string | null;
}) {
  const [visible, setVisible] = useState(false);
  const [beat, setBeat] = useState<Beat>("flags");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("founder-transition-seen") === "1";
    } catch {
      // sessionStorage can throw in a locked-down/private context — showing
      // the welcome moment an extra time isn't worth failing over.
    }
    if (seen) return;
    try {
      sessionStorage.setItem("founder-transition-seen", "1");
    } catch {
      // see above
    }

    let reducedMotion = false;
    try {
      reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      // matchMedia can be unavailable in unusual embeds — default to the
      // full cinematic rather than assuming a preference nobody stated.
    }

    // eslint-plugin-react-hooks's set-state-in-effect rule (see this
    // component's git history for the earlier note on this) — deferred via
    // queueMicrotask, no async work to genuinely await.
    queueMicrotask(() => setVisible(true));
    void trackEvent("day1_entered");

    if (reducedMotion || !countryFlag) {
      // No meaningful motionless version of a flight animation exists, and
      // no real departure point exists without a known country — go
      // straight to the real welcome content either way. Deferred for the
      // same reason as setVisible(true) above.
      queueMicrotask(() => setBeat("welcome"));
      return;
    }

    const schedule: [Beat, number][] = [
      ["destinations", 2200],
      ["yourCountry", 2100],
      ["reveal", 1900],
      ["flight", 1500],
      ["welcome", 2600],
    ];
    const scheduledTimers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    for (const [nextBeat, delay] of schedule) {
      elapsed += delay;
      scheduledTimers.push(setTimeout(() => setBeat(nextBeat), elapsed));
    }
    timers.current = scheduledTimers;

    return () => {
      for (const t of scheduledTimers) clearTimeout(t);
    };
  }, [countryFlag]);

  function skip() {
    for (const t of timers.current) clearTimeout(t);
    setBeat("welcome");
  }

  if (!visible) return null;

  const wally = WALLY_POSES["open-arms"];
  const isCinematic = beat !== "welcome";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to ITM@15"
      className="founder-scene-armed fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 overflow-hidden bg-bg/98 px-6 text-center backdrop-blur-sm"
    >
      {isCinematic ? (
        <button
          type="button"
          onClick={skip}
          className="absolute top-6 right-6 text-xs text-muted underline decoration-1 underline-offset-4 hover:text-ink"
        >
          Skip
        </button>
      ) : null}

      {beat === "flags" ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">One Continent</p>
          <div className="w-64 overflow-hidden sm:w-96">
            <div className="itm-flag-marquee flex gap-5 text-4xl">
              {[...AFRICAN_COUNTRIES, ...AFRICAN_COUNTRIES].map((c, i) => (
                <span key={i} aria-hidden>
                  {c.flag}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {beat === "destinations" ? (
        <div className="flex flex-col items-center gap-5">
          <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">Seven Destinations</p>
          <div className="flex flex-wrap justify-center gap-4">
            {DESTINATIONS.map((stop, i) => (
              <span
                key={stop.themeKey}
                className="itm-pop-in text-4xl"
                style={{ "--pop-delay": `${i * 90}ms` } as React.CSSProperties}
                aria-hidden
              >
                {stop.countryFlag}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {beat === "yourCountry" && countryFlag ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-4 opacity-30">
            {DESTINATIONS.filter((s) => s.countryName !== countryName).map((stop) => (
              <span key={stop.themeKey} className="text-3xl" aria-hidden>
                {stop.countryFlag}
              </span>
            ))}
          </div>
          <span className="itm-flag-hero itm-pop-in text-7xl" aria-hidden>
            {countryFlag}
          </span>
          <p className="text-lg font-semibold text-ink">Your journey begins in {countryName}.</p>
        </div>
      ) : null}

      {beat === "reveal" ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">The Destination</p>
          <span className="itm-flag-hero itm-pop-in text-7xl" aria-hidden>
            {DRC.flag}
          </span>
          <p className="text-2xl font-semibold text-ink">Kinshasa, DR Congo</p>
        </div>
      ) : null}

      {beat === "flight" && countryFlag ? (
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-24 w-72 sm:w-96">
            <svg viewBox="0 0 300 90" className="h-full w-full" aria-hidden focusable="false">
              <path d="M 10 70 Q 150 -20 290 70" fill="none" stroke="var(--color-gold)" strokeWidth="1.5" className="itm-flight-trail" />
            </svg>
            <span className="absolute bottom-2 left-0 text-3xl" aria-hidden>
              {countryFlag}
            </span>
            <span className="absolute bottom-2 right-0 text-3xl" aria-hidden>
              {DRC.flag}
            </span>
            <span className="itm-flight-plane absolute top-0 left-0 text-2xl" aria-hidden>
              ✈️
            </span>
          </div>
          <p className="text-sm text-muted">
            {countryName} → Kinshasa
          </p>
        </div>
      ) : null}

      {beat === "welcome" ? (
        <>
          <p className="founder-line font-display text-4xl font-semibold text-walumo [--founder-delay:0.2s] sm:text-5xl">
            {firstName}
          </p>
          {countryName ? (
            <p className="founder-line text-xs tracking-[0.2em] text-muted uppercase [--founder-delay:1s]">
              {countryFlag ? `${countryFlag} ` : ""}
              {countryName} · Walumo
            </p>
          ) : null}

          <div className="founder-line flex flex-col items-center gap-3 [--founder-delay:2s]">
            <Image src={wally.src} alt="" width={wally.width} height={wally.height} className="h-28 w-auto" />
            <div className="flex flex-col gap-1">
              {founderPlayerTransition.wallyLines.map((line) => (
                <p key={line} className="rounded-2xl rounded-bl-none bg-surface px-4 py-2 text-sm text-ink">
                  {line}
                </p>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setVisible(false)}
            className="founder-line btn-golden mt-2 [--founder-delay:4s]"
          >
            {founderPlayerTransition.cta}
          </button>
        </>
      ) : null}
    </div>
  );
}
