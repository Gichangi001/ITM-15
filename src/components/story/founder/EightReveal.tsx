import Image from "next/image";
import { WALLY_POSES } from "@/wally/rendering/assets";
import { founderEight } from "@/content/founderStory";
import { FounderScene } from "./FounderScene";

/**
 * §11-13: the story's first major emotional moment. Split across two
 * scroll-snap scenes rather than crammed into one — the spec repeats
 * "reveal the story in controlled pieces... do not dump paragraphs"
 * throughout, and stacking all of §11+12+13's text (the 8, three Wally
 * lines, a statement, two more paragraph groups, a second Wally
 * interaction, and the clue-unlock badge) into a single `min-h-svh` scene
 * would be exactly that. The spec's own 12-scene outline (§26) is marked
 * "Example:", not a hard requirement, and one file exporting a pair of
 * `FounderScene`s keeps the requested `EightReveal.tsx` file boundary
 * while giving the pacing the copy itself asks for.
 */
export function EightReveal({ onOriginClueVisible }: { onOriginClueVisible?: () => void }) {
  const wally = WALLY_POSES.investigate;

  return (
    <>
      <FounderScene id="eight" className="bg-bg text-ink">
        <p className="founder-line font-display text-8xl font-bold text-walumo [--founder-delay:0.3s] sm:text-9xl">
          {founderEight.number}
        </p>

        <div className="founder-line flex flex-col items-center gap-3 [--founder-delay:2.4s]">
          <Image src={wally.src} alt="" width={wally.width} height={wally.height} className="h-24 w-auto sm:h-28" />
          <div className="flex flex-col gap-1">
            {founderEight.wallyLines.map((line) => (
              <p key={line} className="rounded-2xl rounded-bl-none bg-surface px-4 py-2 text-sm text-ink">
                {line}
              </p>
            ))}
          </div>
        </div>

        <p className="founder-line founder-line-gold mt-4 font-display text-2xl font-semibold sm:text-3xl [--founder-delay:5.6s]">
          {founderEight.statement}
        </p>
      </FounderScene>

      <FounderScene id="eightWhy" className="bg-bg text-ink" onVisible={onOriginClueVisible}>
        <div className="founder-line flex flex-col gap-2 [--founder-delay:0.2s]">
          {founderEight.whyParagraphs1.map((p) => (
            <p key={p} className="text-base text-muted sm:text-lg">
              {p}
            </p>
          ))}
        </div>

        <div className="founder-line flex flex-col gap-1 [--founder-delay:2s]">
          {founderEight.whyParagraphs2.map((p) => (
            <p key={p} className="text-sm text-muted">
              {p}
            </p>
          ))}
        </div>

        <div className="founder-line flex flex-col gap-0.5 [--founder-delay:4.4s]">
          {founderEight.closingLines.map((line, i) => (
            <p
              key={line}
              className={`font-display text-xl font-semibold sm:text-2xl ${i === 1 ? "founder-line-gold" : ""}`}
            >
              {line}
            </p>
          ))}
        </div>

        <div className="founder-line mt-4 flex flex-col items-center gap-3 [--founder-delay:6.4s]">
          <Image src={wally.src} alt="" width={wally.width} height={wally.height} className="h-20 w-auto" />
          <div className="flex flex-col gap-1">
            {founderEight.wallyInteraction.map((line) => (
              <p key={line} className="rounded-2xl rounded-bl-none bg-surface px-4 py-2 text-sm text-ink">
                {line}
              </p>
            ))}
          </div>
        </div>

        <p className="founder-line mt-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-2 text-xs font-semibold tracking-[0.15em] text-gold uppercase [--founder-delay:8.2s]">
          {founderEight.clueUnlocked}
        </p>
      </FounderScene>
    </>
  );
}
