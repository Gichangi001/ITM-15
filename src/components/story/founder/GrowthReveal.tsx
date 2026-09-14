import { founderGrowth } from "@/content/founderStory";
import { FounderScene } from "./FounderScene";

/** §14: the evolution from training into a full people-solutions business. */
export function GrowthReveal() {
  return (
    <FounderScene id="growth" className="bg-bg text-ink">
      <p className="founder-line text-xs tracking-[0.2em] text-muted uppercase [--founder-delay:0.2s]">
        {founderGrowth.heading}
      </p>

      <div className="founder-line flex flex-col gap-1 [--founder-delay:1.2s]">
        {founderGrowth.paragraphs.map((p) => (
          <p key={p} className="text-sm text-muted sm:text-base">
            {p}
          </p>
        ))}
      </div>

      <div className="founder-line flex flex-col items-center [--founder-delay:3.4s]" aria-hidden="true">
        {founderGrowth.evolution.map((step, index) => (
          <div key={step} className="flex flex-col items-center">
            <p className="font-display text-lg font-semibold sm:text-xl">{step}</p>
            {index < founderGrowth.evolution.length - 1 ? (
              <div className="my-1 h-5 w-px bg-gradient-to-b from-walumo/60 to-walumo/10" />
            ) : null}
          </div>
        ))}
      </div>
      <p className="sr-only">Evolution: {founderGrowth.evolution.join(" then ")}.</p>

      <div className="founder-line mt-2 flex flex-col gap-2 [--founder-delay:6s]">
        <p className="text-sm text-muted">
          ITM stopped asking only: <span className="text-ink">&ldquo;{founderGrowth.questionOld}&rdquo;</span>
        </p>
        <p className="founder-line-gold text-base font-medium sm:text-lg">
          &ldquo;{founderGrowth.questionNew}&rdquo;
        </p>
      </div>
    </FounderScene>
  );
}
