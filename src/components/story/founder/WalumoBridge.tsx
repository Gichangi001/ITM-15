import Image from "next/image";
import sylvaMonga from "@/sylva-monga.webp";
import { WALLY_POSES } from "@/wally/rendering/assets";
import { FOUNDER_IMAGE_ALT, founderWalumo } from "@/content/founderStory";
import { FounderScene } from "./FounderScene";

/**
 * §20-22: the Walumo bridge, present day, and the final founder moment —
 * ending in Wally's "this is where you enter" line and the route's own
 * closing CTA.
 *
 * §21 suggests revealing specific growth figures ("15,000+", "20+
 * markets") as an *example* of the reveal mechanic. This project has no
 * approved source of truth for ITM's actual current headcount or market
 * count (checked PRODUCT_GUIDE.md, WALLY.md, the Storyline Build Bible —
 * none exists), and the original landing page already made the identical
 * call for the same reason (skipped a historical timeline rather than
 * invent specific figures — docs/PROJECT_STATE.md). This scene keeps the
 * *milestone* beat (the founding year giving way to today) without
 * asserting an unconfirmed number — "8" giving way to "ITM@15" itself is
 * real and already approved throughout this project.
 *
 * §22's CTA is "ENTER THE GAME" here, not §23's personalized "BEGIN MY
 * ITM@15 JOURNEY" — see src/content/founderStory.ts's header comment for
 * why that personalized moment is a separate, post-login scene
 * (PlayerTransition.tsx) instead of living in this public sequence.
 */
export function WalumoBridge({ onVisible }: { onVisible?: () => void }) {
  const wally = WALLY_POSES["open-arms"];

  return (
    <FounderScene id="walumo" className="bg-bg text-ink" onVisible={onVisible}>
      <p className="founder-line font-display text-5xl font-semibold text-walumo [--founder-delay:0.2s] sm:text-6xl">
        {founderWalumo.year}
      </p>
      <p className="founder-line founder-line-gold font-display text-3xl font-bold tracking-[0.1em] [--founder-delay:1.4s] sm:text-4xl">
        {founderWalumo.reveal}
      </p>

      <div className="founder-line flex flex-col gap-1 [--founder-delay:2.6s]">
        {founderWalumo.paragraph1.map((p) => (
          <p key={p} className="text-sm text-muted sm:text-base">
            {p}
          </p>
        ))}
      </div>
      <p className="founder-line text-sm text-muted [--founder-delay:4.2s]">{founderWalumo.paragraph2}</p>

      <div className="founder-line flex flex-col gap-0.5 [--founder-delay:5.4s]">
        {founderWalumo.closingLines.map((line) => (
          <p key={line} className="font-display text-lg font-semibold sm:text-xl">
            {line}
          </p>
        ))}
      </div>

      <div className="founder-line mt-2 flex items-center gap-3 [--founder-delay:7s]" aria-hidden="true">
        <span className="font-display text-3xl font-bold text-muted">8</span>
        <span className="text-muted">→</span>
        <span className="founder-line-gold font-display text-3xl font-bold tracking-[0.05em]">
          {founderWalumo.presentDayLabel}
        </span>
      </div>

      <div className="founder-line mt-4 flex flex-col items-center gap-3 [--founder-delay:8.6s]">
        <Image
          src={sylvaMonga}
          alt={FOUNDER_IMAGE_ALT}
          width={80}
          height={80}
          className="h-20 w-20 rounded-full object-cover object-[50%_8%]"
        />
        {founderWalumo.finalParagraphs.map((p) => (
          <p key={p} className="max-w-sm text-sm text-muted">
            {p}
          </p>
        ))}
        <p className="founder-line-gold font-display text-xl font-semibold sm:text-2xl">
          {founderWalumo.finalStatement}
        </p>
      </div>

      <div className="founder-line mt-4 flex flex-col items-center gap-3 [--founder-delay:10.4s]">
        <Image src={wally.src} alt="" width={wally.width} height={wally.height} className="h-24 w-auto" />
        <div className="flex flex-col gap-1">
          {founderWalumo.wallyClosing.map((line) => (
            <p key={line} className="rounded-2xl rounded-bl-none bg-surface px-4 py-2 text-sm text-ink">
              {line}
            </p>
          ))}
        </div>
      </div>

      <a href="/login" className="founder-line btn-golden mt-6 [--founder-delay:12s]">
        {founderWalumo.cta}
      </a>
    </FounderScene>
  );
}
