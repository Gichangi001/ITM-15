"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const TOKEN_TO_CSS_VAR: Record<string, string> = {
  colorInk: "--color-ink",
  colorMuted: "--color-muted",
  colorBg: "--color-bg",
  colorSurface: "--color-surface",
  colorWalumo: "--color-walumo",
  colorGold: "--color-gold",
};

/**
 * `#rrggbb` -> `rgba(r, g, b, alpha)`. This project deliberately avoids
 * `color-mix()` for broader browser support (see globals.css's own header
 * comment on `.btn-primary`'s `--btn-glow-soft`) — computing the soft tint
 * here, once, in plain JS achieves the same "derive a translucent version
 * of the accent" result without it.
 */
function hexToRgba(hex: string, alpha: number): string | null {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) return null;
  const int = parseInt(match[1], 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

async function applyActiveTheme() {
  const supabase = createClient();
  // `themes` is publicly readable (see the migration) — this runs for
  // every visitor, authenticated or not, since the landing page's own
  // identity (Product Guide §6) is meant to reflect the active theme too.
  const { data: theme } = await supabase.from("themes").select("tokens").eq("is_active", true).maybeSingle();
  if (!theme) return;

  const tokens = theme.tokens as Record<string, unknown>;
  for (const [tokenKey, cssVar] of Object.entries(TOKEN_TO_CSS_VAR)) {
    const value = tokens[tokenKey];
    if (typeof value === "string") {
      document.documentElement.style.setProperty(cssVar, value);
    }
  }

  // Experience Transformation Slice 6 fix: found while reviewing the new
  // multi-destination journey themes — `.btn-primary`'s glow
  // (`--btn-glow-soft`) and every `.itm-*` card/choice/reward effect in
  // globals.css were using a hardcoded walumo-blue rgba rather than a
  // translucent version of whichever accent is actually active. Invisible
  // while only the blue-ish Origin/Kenya themes existed; wrong the moment
  // a genuinely different accent (Senegal's terracotta, Nigeria's magenta,
  // ...) activates — the button/card glow would stay blue while its
  // border correctly changed color. Setting these here, once, fixes every
  // consumer (existing and future) without each one needing its own
  // per-theme color logic.
  const walumoHex = typeof tokens.colorWalumo === "string" ? tokens.colorWalumo : null;
  if (walumoHex) {
    const soft = hexToRgba(walumoHex, 0.28);
    const weak = hexToRgba(walumoHex, 0.12);
    const strong = hexToRgba(walumoHex, 0.35);
    if (soft) document.documentElement.style.setProperty("--btn-glow-soft", soft);
    if (weak) document.documentElement.style.setProperty("--color-walumo-soft-weak", weak);
    if (strong) document.documentElement.style.setProperty("--color-walumo-soft-strong", strong);
  }
}

/**
 * Product Guide §19.2: "Connected clients transition without full
 * refresh." Mounted once in the root layout (not the player shell) so it
 * covers every route, signed in or not — the landing/login pages are
 * part of "every connected user" too. Applies the active theme's tokens
 * as inline CSS custom-property overrides on `<html>`, which win over
 * globals.css's `:root` defaults per normal CSS cascade rules, no
 * JS-driven re-render of anything else needed.
 *
 * Its own "theme" broadcast topic, deliberately not "game:global" —
 * avoids the exact channel-collision class of bug documented at length in
 * PresenceHeartbeat.tsx; this mounts on pages PresenceHeartbeat never
 * does (the public landing page, /login), so sharing a channel object
 * wouldn't even be possible here.
 */
export function ThemeProvider() {
  useEffect(() => {
    applyActiveTheme();

    const supabase = createClient();
    const channel = supabase.channel("theme");
    channel.on("broadcast", { event: "theme.changed" }, () => {
      applyActiveTheme();
    });
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
