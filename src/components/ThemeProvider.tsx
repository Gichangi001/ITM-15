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
