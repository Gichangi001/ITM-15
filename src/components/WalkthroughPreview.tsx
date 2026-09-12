"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import {
  FINAL_REVEAL_LETTERS,
  WALKTHROUGH_SLIDES,
} from "@/content/walkthrough";
import { DAY_THEME_ACCENTS } from "@/content/dayThemes";
import { WALLY_POSES } from "@/wally/rendering/assets";

/** CSS custom properties, typed loosely since React's CSSProperties doesn't
 * know about custom properties — consumed by .btn-primary in globals.css. */
type ThemedStyle = CSSProperties & {
  "--btn-glow-solid"?: string;
  "--btn-glow-soft"?: string;
};

/**
 * A scripted, client-only narrative preview — Day 0 through Day 7 in one
 * sitting. This is NOT the interactive game: no accounts, no database, no
 * real missions, no scoring. See src/content/walkthrough.ts's header
 * comment for exactly why, and docs/PROJECT_AUDIT_CHECKLIST.md for what
 * "the real thing" actually requires before it can exist.
 */
export function WalkthroughPreview() {
  const [index, setIndex] = useState(0); // 0..slides.length-1, then slides.length = final reveal
  const totalSteps = WALKTHROUGH_SLIDES.length + 1; // + final reveal screen
  const isFinalReveal = index === WALKTHROUGH_SLIDES.length;
  const slide = isFinalReveal ? null : WALKTHROUGH_SLIDES[index];

  const revealedLetters = FINAL_REVEAL_LETTERS.filter((_, i) =>
    // letters unlock on days 1-7 (index 1-7 in WALKTHROUGH_SLIDES); once the
    // player has moved past that day's slide, its letter is "collected."
    isFinalReveal ? true : index > i,
  );

  function next() {
    setIndex((i) => Math.min(i + 1, WALKTHROUGH_SLIDES.length));
  }

  function back() {
    setIndex((i) => Math.max(i - 1, 0));
  }

  function restart() {
    setIndex(0);
  }

  // Day theme (Build Bible §34): the primary button's glow "should match
  // current Day theme." Final reveal reuses Day 7's restrained gold, since
  // it's the same legacy moment.
  const themeDay = isFinalReveal ? 7 : slide!.day;
  const accent = DAY_THEME_ACCENTS[themeDay];
  const themeStyle: ThemedStyle = {
    "--btn-glow-solid": accent.solid,
    "--btn-glow-soft": accent.soft,
  };

  return (
    <div
      className="flex min-h-svh flex-col bg-bg text-ink"
      style={themeStyle}
    >
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 text-xs text-muted">
        <span className="tracking-[0.15em] uppercase">
          Preview — narrative walkthrough
        </span>
        <span>
          {isFinalReveal ? "Reveal" : `Day ${slide!.day} of 7`}
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        {isFinalReveal ? (
          <div key="final" className="walkthrough-slide flex flex-col items-center">
            <p className="text-sm text-muted">
              Fifteen years are written.
            </p>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-7xl">
              I BELONG.
            </h1>
            <div className="mt-10 space-y-2 text-sm text-muted">
              <p>I know this story.</p>
              <p>I know these people.</p>
              <p>I belong here.</p>
            </div>
            <p className="mt-10 max-w-sm text-sm text-muted italic">
              What happens next belongs to you.
            </p>
            <button type="button" onClick={restart} className="btn-golden mt-10">
              Walk through it again
            </button>
          </div>
        ) : (
          <div
            key={slide!.day}
            className="walkthrough-slide flex max-w-md flex-col items-center"
          >
            <p className="text-xs font-medium tracking-[0.2em] text-muted uppercase">
              {slide!.dayLabel}
            </p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
              {slide!.title}
            </h1>

            <Image
              src={WALLY_POSES[slide!.wallyPose].src}
              alt=""
              width={WALLY_POSES[slide!.wallyPose].width}
              height={WALLY_POSES[slide!.wallyPose].height}
              className="mt-8 h-36 w-auto sm:h-44"
            />

            <p className="mt-6 text-lg text-ink">“{slide!.wallyQuote}”</p>

            {slide!.moment && (
              <div className="mt-8 w-full rounded-xl border border-white/10 bg-surface p-5 text-left">
                <p className="text-xs font-medium tracking-[0.1em] text-muted uppercase">
                  {slide!.moment.heading}
                </p>
                <p className="mt-2 text-sm text-muted">{slide!.moment.body}</p>
              </div>
            )}

            {slide!.nightClose && (
              <p className="mt-8 text-sm text-muted italic">
                “{slide!.nightClose}”
              </p>
            )}
          </div>
        )}
      </div>

      {/* Letter tray — builds across the week, per docs/WALLY.md §21. Only
          shown from Day 1 onward; Day 0 has no letters yet. */}
      {index > 0 && (
        <div className="flex items-center justify-center gap-2 pb-6">
          {FINAL_REVEAL_LETTERS.map((letter) => {
            const unlocked = revealedLetters.includes(letter);
            return (
              <span
                key={letter}
                aria-hidden
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${
                  unlocked
                    ? "border-gold text-gold"
                    : "border-white/10 text-transparent"
                }`}
              >
                {unlocked ? letter : "•"}
              </span>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-white/5 px-6 py-5">
        <button
          type="button"
          onClick={back}
          disabled={index === 0}
          className="btn-secondary"
        >
          Back
        </button>
        <div className="flex gap-1.5" aria-hidden>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${
                i === index ? "bg-walumo" : "bg-white/15"
              }`}
            />
          ))}
        </div>
        {!isFinalReveal ? (
          <button type="button" onClick={next} className="btn-primary">
            {index === WALKTHROUGH_SLIDES.length - 1 ? "See the reveal" : "Continue"}
          </button>
        ) : (
          <span className="w-[3.5rem]" aria-hidden />
        )}
      </div>
    </div>
  );
}
