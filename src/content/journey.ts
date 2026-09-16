/**
 * Experience Transformation Slice 2 — the African-journey atmosphere layer
 * (per the user's direction: "atmosphere layer only" — this supplies mood,
 * not content. The real day titles/mission content, e.g. "Day 1 — Origin",
 * are untouched and remain the actual game; see docs/PROJECT_STATE.md's
 * "Experience Transformation — Slice 2" for the full account of that
 * decision).
 *
 * Each stop's `themeKey` matches a row in the live `themes` table
 * (supabase/migrations/20260916100000_journey_country_themes.sql) — the
 * color-shift side of the atmosphere is DB-driven/admin-controlled per the
 * existing Phase 15 theme engine. `tagline`/`countryName`/`countryFlag`
 * here are the static content side: no admin-editable copy exists yet for
 * these (a real, disclosed gap — see PROJECT_STATE.md), so this module is
 * the source of truth for the journey's flavor text, the same pattern
 * `src/content/story.ts`/`dayThemes.ts` already use elsewhere in this app.
 *
 * `dayNumber: null` marks the two stops that are not one of the 7
 * competition days — DRC is the pre-game opening (Product Guide's
 * landing/pre-login experience), Kinshasa is the closing/finale moment
 * after Day 7. Neither has been built as a dedicated scene yet (tracked as
 * a future slice); their entries exist here so the theme engine has a
 * complete, real destination list to activate against from day one.
 */

export type JourneyStop = {
  themeKey: string;
  dayNumber: number | null;
  countryName: string;
  countryFlag: string;
  tagline: string;
};

export const JOURNEY_STOPS: readonly JourneyStop[] = [
  { themeKey: "journey_drc", dayNumber: null, countryName: "DRC", countryFlag: "🇨🇩", tagline: "Where Our Story Begins" },
  { themeKey: "journey_kenya", dayNumber: 1, countryName: "Kenya", countryFlag: "🇰🇪", tagline: "Build the Future" },
  { themeKey: "journey_senegal", dayNumber: 2, countryName: "Senegal", countryFlag: "🇸🇳", tagline: "Teranga" },
  { themeKey: "journey_tanzania", dayNumber: 3, countryName: "Tanzania", countryFlag: "🇹🇿", tagline: "Umoja & Horizons" },
  { themeKey: "journey_uganda", dayNumber: 4, countryName: "Uganda", countryFlag: "🇺🇬", tagline: "The Pearl — Discover More" },
  { themeKey: "journey_nigeria", dayNumber: 5, countryName: "Nigeria", countryFlag: "🇳🇬", tagline: "Energy Without Limits" },
  { themeKey: "journey_south_africa", dayNumber: 6, countryName: "South Africa", countryFlag: "🇿🇦", tagline: "Ubuntu & Possibility" },
  { themeKey: "journey_benin", dayNumber: 7, countryName: "Benin", countryFlag: "🇧🇯", tagline: "Heritage Meets Tomorrow" },
  { themeKey: "journey_kinshasa", dayNumber: null, countryName: "Kinshasa, DRC", countryFlag: "🇨🇩", tagline: "One ITM. One Story. Fifteen Years." },
] as const;

const STOP_BY_DAY_NUMBER = new Map(
  JOURNEY_STOPS.filter((s): s is JourneyStop & { dayNumber: number } => s.dayNumber !== null).map((s) => [
    s.dayNumber,
    s,
  ]),
);

export function getJourneyStopForDay(dayNumber: number): JourneyStop | undefined {
  return STOP_BY_DAY_NUMBER.get(dayNumber);
}
