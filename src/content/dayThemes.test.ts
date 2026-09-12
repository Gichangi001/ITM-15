import { describe, expect, it } from "vitest";
import { DAY_THEME_ACCENTS } from "./dayThemes";
import { WALKTHROUGH_SLIDES } from "./walkthrough";

const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const RGBA_COLOR = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/;

describe("DAY_THEME_ACCENTS", () => {
  it("has an accent for every day the walkthrough uses, 0 through 7", () => {
    const days = WALKTHROUGH_SLIDES.map((s) => s.day);
    for (const day of days) {
      expect(DAY_THEME_ACCENTS[day], `day ${day}`).toBeDefined();
    }
  });

  it("every accent has a valid hex solid color and rgba soft color", () => {
    for (const [day, accent] of Object.entries(DAY_THEME_ACCENTS)) {
      expect(accent.solid, `day ${day} solid`).toMatch(HEX_COLOR);
      expect(accent.soft, `day ${day} soft`).toMatch(RGBA_COLOR);
    }
  });

  it("day 7 reuses the gold reserved for the legacy/final-reveal moment", () => {
    expect(DAY_THEME_ACCENTS[7].solid.toLowerCase()).toBe("#c9a227");
  });
});
