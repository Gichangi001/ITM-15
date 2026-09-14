import { founderReturn } from "@/content/founderStory";
import { FounderScene } from "./FounderScene";

/**
 * §8-9: "ONE MAN. ONE IDEA." + the Germany → Africa → Lubumbashi journey.
 * §9 suggests "an elegant abstract map or glowing geographic line" rather
 * than a literal map — implemented as a simple vertical route of labels
 * connected by a thin gold line, which reads clearly at every viewport
 * width without needing real map tiles/geo data this project has no
 * source for.
 */
export function FounderReturn() {
  return (
    <FounderScene id="return" className="bg-bg text-ink">
      <p className="founder-line text-xs tracking-[0.2em] text-muted uppercase [--founder-delay:0.2s]">
        {founderReturn.heading}
      </p>

      <div className="founder-line flex flex-col gap-3 [--founder-delay:1.2s]">
        {founderReturn.paragraphs.map((p) => (
          <p key={p} className="text-base text-muted sm:text-lg">
            {p}
          </p>
        ))}
      </div>

      <p className="founder-line founder-line-gold font-display text-2xl font-semibold sm:text-3xl [--founder-delay:3.4s]">
        {founderReturn.isolatedLine}
      </p>

      <div className="founder-line [--founder-delay:4.8s]">
        <p className="text-xs tracking-[0.2em] text-muted uppercase">{founderReturn.beforeItmHeading}</p>
        <div className="mt-3 flex flex-col gap-2">
          {founderReturn.journeyParagraphs.map((p) => (
            <p key={p} className="text-sm text-muted">
              {p}
            </p>
          ))}
        </div>
      </div>

      <div className="founder-line flex flex-col items-center [--founder-delay:6s]" aria-hidden="true">
        {founderReturn.route.map((place, index) => (
          <div key={place} className="flex flex-col items-center">
            <p className="text-sm font-semibold tracking-[0.15em] text-gold uppercase">{place}</p>
            {index < founderReturn.route.length - 1 ? (
              <div className="my-1 h-6 w-px bg-gradient-to-b from-gold/60 to-gold/10" />
            ) : null}
          </div>
        ))}
      </div>
      <p className="sr-only">Journey: {founderReturn.route.join(" to ")}.</p>

      <div className="founder-line flex flex-col gap-1 [--founder-delay:7.5s]">
        {founderReturn.closingParagraphs.map((p) => (
          <p key={p} className="text-base text-muted">
            {p}
          </p>
        ))}
        <p className="founder-line-gold mt-1 font-display text-xl font-semibold sm:text-2xl">
          {founderReturn.emphasis}
        </p>
      </div>
    </FounderScene>
  );
}
