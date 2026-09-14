import { founderHolding } from "@/content/founderStory";
import { FounderScene } from "./FounderScene";

/** §16-17: 2019, the shift from company to Group/Holding, and the underlying pattern across every service ITM added. */
export function HoldingReveal() {
  return (
    <FounderScene id="holding" className="bg-bg text-ink">
      <p className="founder-line font-display text-6xl font-semibold text-walumo [--founder-delay:0.2s] sm:text-7xl">
        {founderHolding.year}
      </p>

      <div className="founder-line flex flex-col gap-1 [--founder-delay:1.6s]">
        {founderHolding.paragraphs.map((p) => (
          <p key={p} className="text-sm text-muted sm:text-base">
            {p}
          </p>
        ))}
      </div>

      <div className="founder-line flex flex-col items-center gap-1 [--founder-delay:4s]" aria-hidden="true">
        {founderHolding.progression.map((step) => (
          <p key={step} className="text-sm tracking-[0.1em] text-muted uppercase">
            {step} ↓
          </p>
        ))}
        <p className="founder-line-gold font-display text-4xl font-bold tracking-[0.1em] sm:text-5xl">
          {founderHolding.landingWord}
        </p>
      </div>

      <div className="founder-line flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted [--founder-delay:6.2s]">
        {founderHolding.patternServices.map((s, i) => (
          <span key={s}>
            {s}
            {i < founderHolding.patternServices.length - 1 ? " ·" : ""}
          </span>
        ))}
      </div>

      <div className="founder-line flex flex-col gap-2 [--founder-delay:7.4s]">
        <p className="text-base font-medium">{founderHolding.question}</p>
        <p className="founder-line-gold font-display text-3xl font-bold sm:text-4xl">{founderHolding.answer}</p>
        <p className="max-w-lg text-sm text-muted">{founderHolding.closingParagraph}</p>
      </div>
    </FounderScene>
  );
}
