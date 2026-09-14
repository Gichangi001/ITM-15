import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { canManageThemes } from "@/lib/auth/roles";
import { getCurrentRoles } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { activateTheme } from "./actions";

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
    .select("id, name, tokens, is_active")
    .order("created_at");

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 bg-bg px-6 py-16">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15 — Mission Control
        </p>
        <h1 className="text-3xl">Themes</h1>
        <p className="text-sm text-muted">
          Activating a theme applies live to every connected visitor — no redeploy, no page
          reload.
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
                <p className="text-sm font-semibold text-ink">{theme.name}</p>
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
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
