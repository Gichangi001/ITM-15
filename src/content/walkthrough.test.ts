import { describe, expect, it } from "vitest";
import { FINAL_REVEAL_LETTERS, WALKTHROUGH_SLIDES } from "./walkthrough";

describe("WALKTHROUGH_SLIDES", () => {
  it("has exactly 8 slides, Day 0 through Day 7 in order", () => {
    expect(WALKTHROUGH_SLIDES.map((s) => s.day)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7,
    ]);
  });

  it("every slide has a title and a Wally quote", () => {
    for (const slide of WALKTHROUGH_SLIDES) {
      expect(slide.title.length, `day ${slide.day}`).toBeGreaterThan(0);
      expect(slide.wallyQuote.length, `day ${slide.day}`).toBeGreaterThan(0);
    }
  });

  it("days 1-7 each reveal exactly one letter, spelling I-B-E-L-O-N-G in order", () => {
    const letters = WALKTHROUGH_SLIDES.filter((s) => s.day > 0).map(
      (s) => s.letter,
    );
    expect(letters).toEqual(FINAL_REVEAL_LETTERS);
  });

  it("day 0 reveals no letter yet", () => {
    expect(WALKTHROUGH_SLIDES[0].letter).toBeUndefined();
  });
});
