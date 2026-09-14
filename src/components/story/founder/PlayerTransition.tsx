"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { WALLY_POSES } from "@/wally/rendering/assets";
import { founderPlayerTransition } from "@/content/founderStory";
import { trackEvent } from "@/lib/analytics/track";

/**
 * §23 "Player Transition" — personalized, so it can only ever be built
 * for a real, authenticated, onboarded player, never the public
 * `/story/founder` sequence (see src/content/founderStory.ts's header
 * comment). `firstName`/`countryName` are passed in from a Server
 * Component that already resolved them from the real `profiles` row
 * (src/app/(player)/play/page.tsx) — this component never invents or
 * guesses either.
 *
 * Shown once per browser session (sessionStorage), the same lightweight
 * "don't repeat a one-time beat" mechanism `WallyProvider`'s
 * LOGIN_GREETING already uses, for the same reason: this is a welcome
 * moment, not gameplay-critical state, so a new DB column/flag to track
 * "has this player ever seen it" would be more machinery than the actual
 * stakes justify — a returning player seeing it again after clearing
 * their session is a non-issue, not a bug.
 */
export function PlayerTransition({
  firstName,
  countryName,
}: {
  firstName: string;
  countryName: string | null;
}) {
  const [visible, setVisible] = useState(false);

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
    // eslint-plugin-react-hooks's set-state-in-effect rule flags a direct,
    // synchronous setState call in an effect body (the effect should
    // synchronize with an external system via a callback, not fire a
    // state update unconditionally on every mount) — same reasoning
    // src/components/RevealOnScroll.tsx's own header comment already
    // documents for an IntersectionObserver callback. There's no async
    // work to genuinely wait on here (sessionStorage is synchronous), so
    // queueMicrotask is the minimal real deferral that satisfies it.
    queueMicrotask(() => setVisible(true));
    void trackEvent("day1_entered");
  }, []);

  if (!visible) return null;

  const wally = WALLY_POSES["open-arms"];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to ITM@15"
      className="founder-scene-armed fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-bg/98 px-6 text-center backdrop-blur-sm"
    >
      <p className="founder-line font-display text-4xl font-semibold text-walumo [--founder-delay:0.2s] sm:text-5xl">
        {firstName}
      </p>
      {countryName ? (
        <p className="founder-line text-xs tracking-[0.2em] text-muted uppercase [--founder-delay:1s]">
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
    </div>
  );
}
