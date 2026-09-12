/**
 * Per-day accent colors for the narrative walkthrough preview.
 *
 * Grounded in docs/ITM15_STORYLINE_EXPERIENCE_BUILD_BIBLE.md §34 (Theme
 * System), which specifies an *emotional palette* per day — explicitly "not
 * hard-coded colors" at the product level, since the real game's theme
 * engine is admin-driven and live-switchable (Product Guide Phase 15 /
 * Bible §34: "Admin can change theme accents live... Changing theme must
 * not alter game logic"). These are this preview's fixed interpretation of
 * that emotional brief, not a stand-in for the real theme engine — no admin
 * control, no persistence, no effect on any game state. If Phase 15 builds
 * the real theme system, these values are a reasonable seed/reference, not
 * a source of truth to import from.
 *
 * Each entry has:
 * - `solid`: an opaque color for borders/text (the day's identity color).
 * - `soft`: the same hue as a translucent rgba, used for glow/tint so the
 *   breathing-glow effect in globals.css doesn't need `color-mix()` (kept
 *   out for broader browser support — see the button rules there).
 */

export interface DayAccent {
  solid: string;
  soft: string;
}

export const DAY_THEME_ACCENTS: Record<number, DayAccent> = {
  // Day 0 — before any chapter opens. Neutral Walumo blue, not a "day" theme.
  0: { solid: "#3b6fed", soft: "rgba(59, 111, 237, 0.28)" },
  // Day 1 — Origin: warm archival / spark.
  1: { solid: "#d98a3d", soft: "rgba(217, 138, 61, 0.28)" },
  // Day 2 — One ITM, Many Cultures: vibrant cultural spectrum.
  2: { solid: "#c23bd1", soft: "rgba(194, 59, 209, 0.28)" },
  // Day 3 — The Journey: travel / midnight / airport light.
  3: { solid: "#3ba7d1", soft: "rgba(59, 167, 209, 0.28)" },
  // Day 4 — The People: human / warm / recognition.
  4: { solid: "#d1573b", soft: "rgba(209, 87, 59, 0.28)" },
  // Day 5 — Walumo: futuristic / Walumo innovation.
  5: { solid: "#38e0c2", soft: "rgba(56, 224, 194, 0.28)" },
  // Day 6 — The Alliance: electric alliance / live energy.
  6: { solid: "#3bd15c", soft: "rgba(59, 209, 92, 0.28)" },
  // Day 7 — Legacy: premium future / restrained gold. Matches globals.css's
  // --color-gold — gold stays reserved for Day 7 and the final reveal only.
  7: { solid: "#c9a227", soft: "rgba(201, 162, 39, 0.3)" },
};
