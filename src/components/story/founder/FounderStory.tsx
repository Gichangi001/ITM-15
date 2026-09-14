"use client";

import { useEffect, useRef } from "react";
import { FounderHero } from "./FounderHero";
import { FounderBelief } from "./FounderBelief";
import { FounderReturn } from "./FounderReturn";
import { Founder2011 } from "./Founder2011";
import { ITMNameReveal } from "./ITMNameReveal";
import { EightReveal } from "./EightReveal";
import { GrowthReveal } from "./GrowthReveal";
import { AfricaExpansion } from "./AfricaExpansion";
import { HoldingReveal } from "./HoldingReveal";
import { PeopleReveal } from "./PeopleReveal";
import { WalumoBridge } from "./WalumoBridge";
import { unlockOriginClue } from "./actions";
import { trackEvent } from "@/lib/analytics/track";

/**
 * docs/ITM15_FOUNDER_STORY_OPENING_CHAPTER.md §26/§32 — the assembling
 * route component ("FounderStory.tsx" in the spec's own suggested file
 * list), owning the scroll-snap container, the "Skip Story" control
 * (§26: "provide SKIP STORY for returning players... the first
 * experience should encourage completion" — shown always, not
 * conditionally, since this session has no reliable "have they seen it
 * before" signal for a genuinely anonymous pre-login visitor beyond
 * localStorage, which is a real, disclosed limitation, not silently
 * pretended away), and the funnel analytics events (§31) that need to
 * know about the whole sequence rather than one scene.
 *
 * §23's personalized player-transition scene is deliberately not
 * rendered here — see src/content/founderStory.ts's header comment.
 * `WalumoBridge`'s own CTA sends a public visitor straight to `/login`
 * instead.
 */
export function FounderStory() {
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void trackEvent("founder_story_started");
  }, []);

  function handleSkip() {
    void trackEvent("founder_story_skipped");
  }

  return (
    <div className="relative">
      <a
        href="/login"
        onClick={handleSkip}
        className="btn-secondary fixed top-4 right-4 z-50 text-xs"
      >
        Skip story
      </a>

      <div className="founder-story-container" tabIndex={0} aria-label="ITM@15 founder story">
        <FounderHero />
        <FounderBelief />
        <FounderReturn />
        <Founder2011 />
        <ITMNameReveal />
        <EightReveal onOriginClueVisible={() => void unlockOriginClue()} />
        <GrowthReveal />
        <AfricaExpansion />
        <HoldingReveal />
        <PeopleReveal />
        <WalumoBridge onVisible={() => void trackEvent("founder_story_completed")} />
      </div>
    </div>
  );
}
