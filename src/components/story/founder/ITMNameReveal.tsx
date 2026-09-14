import { founderItmName } from "@/content/founderStory";
import { FounderScene, type FounderDelayStyle } from "./FounderScene";

/**
 * §10: "Have the three letters animate into place individually... The
 * first letters illuminate: I / T / M. Then combine: ITM." Each word
 * reveals in turn with its first letter picked out in gold, then the
 * combined initials land as the scene's payoff — "one of the first
 * memorable visual reveals," per the spec.
 */
export function ITMNameReveal() {
  const delays = ["0.2s", "1.6s", "3s"];

  return (
    <FounderScene id="itmName" className="bg-bg text-ink">
      <div className="flex flex-col gap-3">
        {founderItmName.words.map((word, index) => (
          <p
            key={word}
            className="founder-line font-display text-2xl font-semibold tracking-[0.1em] sm:text-3xl"
            style={{ "--founder-delay": delays[index] } as FounderDelayStyle}
          >
            <span className="founder-line-gold">{word[0]}</span>
            {word.slice(1)}
          </p>
        ))}
      </div>

      <p className="founder-line founder-line-gold font-display text-6xl font-bold tracking-[0.15em] [--founder-delay:5s] sm:text-7xl">
        {founderItmName.combined}
      </p>
    </FounderScene>
  );
}
