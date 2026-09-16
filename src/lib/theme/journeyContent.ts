import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { JOURNEY_STOPS, type JourneyStop } from "@/content/journey";

/**
 * Experience Transformation Slice 8 — country name/flag/tagline are now
 * admin-editable, stored in `themes.tokens` (see
 * supabase/migrations/20260916110000_journey_theme_content_fields.sql).
 * This reads the live value; `src/content/journey.ts` remains the
 * fallback for a theme row that predates that migration or is missing a
 * field — never silently blank, and never a control (the admin edit
 * form) that writes somewhere no page actually reads from.
 */
export type JourneyContent = Pick<JourneyStop, "countryName" | "countryFlag" | "tagline">;

const STATIC_BY_THEME_KEY = new Map(JOURNEY_STOPS.map((s) => [s.themeKey, s]));

export async function getJourneyContentByThemeKey(
  supabase: SupabaseClient<Database>,
  themeKey: string,
): Promise<JourneyContent | null> {
  const fallback = STATIC_BY_THEME_KEY.get(themeKey) ?? null;

  const { data: theme } = await supabase.from("themes").select("tokens").eq("key", themeKey).maybeSingle();
  const tokens = (theme?.tokens ?? {}) as Record<string, unknown>;

  const countryName = typeof tokens.countryName === "string" ? tokens.countryName : fallback?.countryName;
  const countryFlag = typeof tokens.countryFlag === "string" ? tokens.countryFlag : fallback?.countryFlag;
  const tagline = typeof tokens.tagline === "string" ? tokens.tagline : fallback?.tagline;

  if (!countryName || !countryFlag || !tagline) return fallback ? { ...fallback } : null;
  return { countryName, countryFlag, tagline };
}

export async function getJourneyContentForDay(
  supabase: SupabaseClient<Database>,
  dayNumber: number,
): Promise<JourneyContent | null> {
  const fallback = JOURNEY_STOPS.find((s) => s.dayNumber === dayNumber);
  if (!fallback) return null;
  return getJourneyContentByThemeKey(supabase, fallback.themeKey);
}
