import Image from "next/image";
import sylvaMonga from "@/sylva-monga.webp";
import { FOUNDER_IMAGE_ALT, FOUNDER_IMAGE_OBJECT_POSITION, founderBelief } from "@/content/founderStory";
import { FounderScene } from "./FounderScene";

/**
 * §1-4: "The very first meaningful story page... For approximately the
 * first moment, show only the photograph. No giant interface... Let the
 * user look at the man behind the story. Then slowly reveal..." A pure
 * Server Component (the image needs no client JS to render) — only
 * `FounderScene`, which it wraps, needs "use client" for the
 * scroll-arming logic.
 */
export function FounderHero() {
  return (
    <FounderScene
      id="portrait"
      className="text-white"
      background={
        <>
          <Image
            src={sylvaMonga}
            alt={FOUNDER_IMAGE_ALT}
            fill
            priority
            placeholder="blur"
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: FOUNDER_IMAGE_OBJECT_POSITION }}
          />
          {/* §3: "left or bottom gradient... deep black into transparent...
              subtle vignette... avoid excessive corporate blue." */}
          <div className="founder-hero-scrim absolute inset-0" />
        </>
      }
    >
      <p className="founder-line text-xs tracking-[0.2em] text-white/70 uppercase [--founder-delay:0.4s]">
        {founderBelief.preHeading}
      </p>
      <p className="founder-line font-display text-3xl font-semibold sm:text-4xl [--founder-delay:2s]">
        {founderBelief.beliefLine}
      </p>
      <div className="founder-line flex flex-col gap-1 [--founder-delay:3.6s]">
        {founderBelief.strengthLines.map((line) => (
          <p key={line} className="font-display text-2xl font-semibold sm:text-3xl">
            {line}
          </p>
        ))}
      </div>
      <div className="founder-line mt-4 flex flex-col gap-0.5 [--founder-delay:5.4s]">
        <p className="text-lg font-medium">{founderBelief.founderName}</p>
        <p className="text-sm text-white/70">
          {founderBelief.founderTitle}, {founderBelief.founderOrg}
        </p>
      </div>
    </FounderScene>
  );
}
