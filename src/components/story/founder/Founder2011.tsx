import { founderFounding } from "@/content/founderStory";
import { FounderScene } from "./FounderScene";

/** §10: the year, the place, and the founding idea — up to the reveal of the original full company name (the letter-by-letter "ITM" animation is its own scene, ITMNameReveal.tsx). */
export function Founder2011() {
  return (
    <FounderScene id="founding" className="bg-bg text-ink">
      <p className="founder-line font-display text-7xl font-semibold text-walumo [--founder-delay:0.2s] sm:text-8xl">
        {founderFounding.year}
      </p>
      <p className="founder-line text-sm tracking-[0.15em] text-muted uppercase [--founder-delay:1.6s]">
        {founderFounding.place}
      </p>
      <p className="founder-line max-w-lg text-base text-muted sm:text-lg [--founder-delay:3s]">
        {founderFounding.paragraph}
      </p>
      <p className="founder-line founder-line-gold mt-2 font-display text-xl font-semibold sm:text-2xl [--founder-delay:5s]">
        {founderFounding.originalName}
      </p>
    </FounderScene>
  );
}
