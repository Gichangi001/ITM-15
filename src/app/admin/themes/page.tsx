import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { canManageThemes } from "@/lib/auth/roles";
import { getCurrentRoles } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { activateTheme, updateThemeContent } from "./actions";
import { JOURNEY_STOPS } from "@/content/journey";

export const metadata: Metadata = { title: "Themes — ITM@15" };

const ERROR_MESSAGES: Record<string, string> = {
  not_authorized: "You are not authorized to change themes.",
  invalid_input: "That request didn't look right — nothing was changed.",
  not_found: "That theme no longer exists.",
  update_failed: "Something went wrong saving that change. Try again.",
};

type ThemeTokens = {
  colorInk: string;
  colorMuted: string;
  colorBg: string;
  colorSurface: string;
  colorWalumo: string;
  colorGold: string;
  countryName?: string;
  countryFlag?: string;
  tagline?: string;
  dayNumber?: number;
};

/**
 * Product Guide §19 (Theme Engine), §26 Phase 15. Game Master/Super Admin
 * only. Scope disclosed in the migration's own header comment: color
 * tokens only, the 6 CSS custom properties every component in this app
 * already reads — not the full §19.1 shape (background media, 3D
 * environment, Wally skin, sound pack), which need real asset pipelines
 * that don't exist yet.
 */
export default async function ThemesPage({
  searchParams,
}: PageProps<"/admin/themes">) {
  const roles = await getCurrentRoles();
  if (!canManageThemes(roles)) {
    redirect("/admin");
  }

  const params = await searchParams;
  const errorParam = typeof params.error === "string" ? params.error : undefined;
  const errorMessage = errorParam ? ERROR_MESSAGES[errorParam] : undefined;
  const succeeded = params.success === "1";

  const admin = createAdminClient();
  const { data: themes } = await admin
    .from("themes")
    .select("id, key, name, tokens, is_active")
    .order("created_at");

  const journeyStopByThemeKey = new Map(JOURNEY_STOPS.map((s) => [s.themeKey, s]));

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 bg-bg px-6 py-16">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15 — Mission Control
        </p>
        <h1 className="text-3xl">Themes</h1>
        <p className="text-sm text-muted">
          Activating a theme applies live to every connected visitor — no redeploy, no page
          reload. Journey destinations (marked below) also activate automatically whenever
          their matching day is published — use this page to override or preview ahead.
        </p>
      </div>

      {succeeded ? (
        <p role="status" className="text-sm text-walumo">
          Activated.
        </p>
      ) : null}
      {errorMessage ? (
        <p role="alert" className="text-sm text-red-400">
          {errorMessage}
        </p>
      ) : null}

      {!themes || themes.length === 0 ? (
        <p className="text-sm text-muted">No themes defined yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {themes.map((theme) => {
            const tokens = theme.tokens as unknown as ThemeTokens;
            const staticStop = journeyStopByThemeKey.get(theme.key);
            // Live tokens (Slice 8) win over the static fallback — an
            // admin edit writes here, so this is what must be shown as
            // "current," not the file that only matters when a field is
            // still missing.
            const countryName = tokens.countryName ?? staticStop?.countryName;
            const countryFlag = tokens.countryFlag ?? staticStop?.countryFlag;
            const tagline = tokens.tagline ?? staticStop?.tagline;
            const dayNumber = tokens.dayNumber ?? staticStop?.dayNumber;
            const isJourneyStop = Boolean(countryName && tagline);
            return (
              <div
                key={theme.id}
                className={`flex flex-col gap-3 rounded-xl border p-5 ${
                  theme.is_active ? "border-walumo/50 bg-surface" : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div
                  className="flex h-16 items-center gap-2 rounded-lg border border-white/10 px-3"
                  style={{ background: tokens.colorBg }}
                >
                  <span className="h-6 w-6 rounded-full" style={{ background: tokens.colorWalumo }} />
                  <span className="h-6 w-6 rounded-full" style={{ background: tokens.colorGold }} />
                  <span className="ml-auto text-xs" style={{ color: tokens.colorInk }}>
                    Aa
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{theme.name}</p>
                  {isJourneyStop ? (
                    <p className="text-xs text-muted">
                      {countryFlag} {countryName} — {tagline}
                      {dayNumber ? ` · Day ${dayNumber}` : ""}
                    </p>
                  ) : null}
                </div>
                {theme.is_active ? (
                  <p className="text-xs text-walumo">Active now</p>
                ) : (
                  <form action={activateTheme}>
                    <input type="hidden" name="themeId" value={theme.id} />
                    <button type="submit" className="btn-secondary w-full text-xs">
                      Activate for everyone
                    </button>
                  </form>
                )}
                {isJourneyStop ? (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted hover:text-ink">Edit copy</summary>
                    <form action={updateThemeContent} className="mt-3 flex flex-col gap-2">
                      <input type="hidden" name="themeId" value={theme.id} />
                      <label className="flex flex-col gap-1">
                        <span className="text-muted">Country name</span>
                        <input
                          name="countryName"
                          defaultValue={countryName}
                          maxLength={60}
                          required
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-ink outline-none focus-visible:border-walumo"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-muted">Flag emoji</span>
                        <input
                          name="countryFlag"
                          defaultValue={countryFlag}
                          maxLength={8}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-ink outline-none focus-visible:border-walumo"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-muted">Tagline</span>
                        <input
                          name="tagline"
                          defaultValue={tagline}
                          maxLength={120}
                          required
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-ink outline-none focus-visible:border-walumo"
                        />
                      </label>
                      <button type="submit" className="btn-secondary mt-1 self-start">
                        Save copy
                      </button>
                    </form>
                  </details>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
