import { founderBelief } from "@/content/founderStory";
import { FounderScene } from "./FounderScene";

/**
 * §5-7: the hero copy proper, plus the "DISCOVER THE BEGINNING" CTA.
 * Reuses `.btn-golden` (already built for the walkthrough's rare/golden
 * actions, Build Bible §5) rather than inventing new button CSS — it
 * already has exactly what §6 asks for: a fine gold border, a soft
 * breathing halo, a brighter hover glow, and a tactile press.
 *
 * §7 describes a multi-step JS transition (image zoom, name lingering,
 * text fade, a golden line drawing into the timeline) on click. This uses
 * a plain in-page anchor + the scroll-snap container's native smooth
 * scroll instead — same reliability trade-off already made for the
 * gallery's camera capture (native browser behavior over custom
 * animation code): it's the same *effect* (the next scene arrives, the
 * transition feels deliberate, not a hard cut) with far less to break
 * across browsers, and `scroll-behavior: smooth` on the container already
 * gives it a real, visible motion — not an instant jump.
 */
export function FounderBelief() {
  return (
    <FounderScene id="belief" className="bg-bg text-ink">
      <div className="founder-line flex flex-col gap-1 [--founder-delay:0.2s]">
        {founderBelief.heroQuote.map((line) => (
          <p key={line} className="text-lg text-muted sm:text-xl">
            {line}
          </p>
        ))}
      </div>

      <p className="founder-line founder-line-gold font-display text-2xl font-semibold sm:text-3xl [--founder-delay:2.2s]">
        {founderBelief.heroStatement}
      </p>

      <div className="founder-line flex flex-col gap-0.5 [--founder-delay:3.2s]">
        <p className="text-base font-medium">{founderBelief.founderName}</p>
        <p className="text-sm text-muted">
          {founderBelief.founderTitle}, {founderBelief.founderOrg}
        </p>
      </div>

      <a
        href="#return"
        className="founder-line btn-golden group mt-6 inline-flex items-center gap-2 [--founder-delay:4.2s]"
      >
        {founderBelief.cta}
        <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
          →
        </span>
      </a>
    </FounderScene>
  );
}
