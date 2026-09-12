import Image from "next/image";
import { WALLY_POSES } from "@/wally/rendering/assets";
import { STORY_DAYS } from "@/content/story";
import { RevealOnScroll } from "@/components/RevealOnScroll";

const HOW_IT_WORKS = [
  {
    term: "Points",
    definition: "Earned by completing each day’s mission.",
  },
  {
    term: "Unity Points",
    definition: "Earned by connecting with someone from another country.",
  },
  {
    term: "Squads",
    definition: "Small teams that rise and fall together.",
  },
  {
    term: "Passport",
    definition: "A record of every country you’ve connected with.",
  },
];

export default function Home() {
  const wally = WALLY_POSES.investigate;
  const silhouette = WALLY_POSES["dance-pose"];

  return (
    <div className="flex flex-1 flex-col bg-bg text-ink">
      {/*
        Scene 0 — the cold open (Storyline Bible §8). Deliberately its own
        full-viewport section in normal document flow, not a fixed overlay:
        a fixed overlay would need JS to dismiss, which either flashes
        unstyled content before hydration or permanently traps a visitor
        with JS disabled. An in-flow section plus a plain <a href="#hero">
        anchor works with or without JS, and the reveal itself is pure CSS
        (animation-delay), so it runs even if JS never loads.
      */}
      <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center">
        <Image
          aria-hidden
          src={silhouette.src}
          alt=""
          width={silhouette.width}
          height={silhouette.height}
          className="scene-0-silhouette pointer-events-none absolute bottom-24 h-32 w-auto opacity-15 grayscale [--scene0-delay:1.6s] sm:h-40"
        />

        <p className="scene-0-line text-sm tracking-[0.15em] text-muted uppercase [--scene0-delay:0.3s]">
          15 years ago…
        </p>
        <p className="scene-0-line mt-4 text-lg text-muted [--scene0-delay:2s]">
          It started small.
        </p>
        <p className="scene-0-line font-display mt-6 text-8xl font-semibold text-walumo [--scene0-delay:3.7s] sm:text-9xl">
          8
        </p>
        <p className="scene-0-line mt-6 max-w-sm text-sm text-muted [--scene0-delay:5.2s]">
          Before the countries. Before the thousands. Before the Holding.
          Before Walumo.
        </p>
        <a
          href="#hero"
          className="scene-0-line mt-10 inline-block rounded-full border border-walumo px-8 py-3 text-sm font-medium tracking-wide text-ink uppercase transition hover:bg-walumo [--scene0-delay:6.7s]"
        >
          Enter the story
        </a>
      </section>

      {/* Scene 1 — hero */}
      <section
        id="hero"
        className="flex scroll-mt-0 flex-col items-center px-6 pt-20 pb-16 text-center sm:pt-28"
      >
        <p className="text-xs font-medium tracking-[0.2em] text-muted uppercase">
          Walumo · ITM Group
        </p>

        <h1 className="mt-6 max-w-3xl text-4xl leading-[1.1] font-semibold text-balance sm:text-6xl">
          One Dream. Many Countries. Thousands of People. One ITM.
        </h1>

        <Image
          src={wally.src}
          alt="Wally, the Walumo mascot, leaning in to investigate with a magnifying glass"
          width={wally.width}
          height={wally.height}
          priority
          className="mt-10 h-44 w-auto sm:h-56"
        />

        <p className="mt-10 max-w-md text-lg text-muted">
          Seven days. One story. Your next mission is waiting.
        </p>

        <a
          href="#story"
          className="mt-8 text-sm font-medium text-ink underline decoration-walumo decoration-2 underline-offset-4 transition hover:text-walumo"
        >
          Read the story ↓
        </a>
      </section>

      {/* The seven days */}
      <section id="story" className="px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl">
          <RevealOnScroll>
            <p className="text-xs font-medium tracking-[0.2em] text-muted uppercase">
              The Seven Days
            </p>
            <h2 className="mt-4 max-w-lg text-3xl font-semibold sm:text-4xl">
              Fifteen years, told one chapter at a time.
            </h2>
          </RevealOnScroll>

          <ol className="relative mt-16 space-y-14">
            <div
              aria-hidden
              className="absolute top-2 bottom-2 left-[7px] w-px bg-gradient-to-b from-walumo via-walumo to-gold"
            />

            {STORY_DAYS.map((storyDay) => {
              const isFinal = storyDay.day === STORY_DAYS.length;
              return (
                <li key={storyDay.day} className="relative pl-10">
                  {/*
                    This marker is a sibling of RevealOnScroll's wrapper, not
                    a child inside it — RevealOnScroll applies a `translate-y-*`
                    utility, and any non-"none" `transform` establishes a new
                    CSS containing block for absolutely-positioned descendants.
                    Nesting the marker inside it would silently re-anchor
                    `absolute left-0` to that wrapper instead of this `<li>`,
                    shifting it ~40px right into the text column.
                  */}
                  <span
                    aria-hidden
                    className={`absolute top-1.5 left-0 h-3.5 w-3.5 rounded-full border-2 bg-bg ${
                      isFinal ? "border-gold" : "border-walumo"
                    }`}
                  />
                  <RevealOnScroll>
                    <p className="text-xs font-medium tracking-[0.15em] text-muted uppercase">
                      Day {String(storyDay.day).padStart(2, "0")}
                    </p>
                    <h3 className="mt-1 text-2xl font-semibold">
                      {storyDay.title}
                    </h3>
                    <p className="mt-2 max-w-md text-muted">
                      {storyDay.teaser}
                    </p>
                  </RevealOnScroll>
                </li>
              );
            })}
          </ol>

          <RevealOnScroll className="mt-16">
            <p className="text-sm text-muted italic">
              Every chapter holds something hidden.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <RevealOnScroll>
            <p className="text-xs font-medium tracking-[0.2em] text-muted uppercase">
              How It Works
            </p>
            <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
              {HOW_IT_WORKS.map((item) => (
                <div key={item.term}>
                  <dt className="font-semibold">{item.term}</dt>
                  <dd className="mt-1 text-sm text-muted">
                    {item.definition}
                  </dd>
                </div>
              ))}
            </dl>
          </RevealOnScroll>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-10 text-center">
        <p className="text-sm text-muted">
          An experience by <span className="text-ink">Walumo</span>.
        </p>
      </footer>
    </div>
  );
}
