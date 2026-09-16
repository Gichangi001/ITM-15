-- Experience Transformation Slice 2 — the African-journey atmosphere layer
-- (Product Guide §19/§26 Phase 15's existing theme engine, extended with
-- content rather than schema — see the Phase 15 migration's own header
-- comment: `tokens` is deliberately a single jsonb column so new keys can
-- be added without a migration; no ALTER TABLE is needed here).
--
-- Per the user's explicit 2026-09-16 direction ("atmosphere layer only"):
-- these 9 rows change the app's color mood per destination, they do NOT
-- replace the real day titles/mission content (Day 1 stays "Origin", Day 5
-- stays "Walumo", etc. — see docs/PROJECT_STATE.md and
-- src/content/journey.ts for the full account and the static
-- country-name/flag/tagline content that pairs with each key here).
--
-- Deliberately kept low-risk: colorInk/colorMuted/colorBg/colorSurface are
-- identical to the app's existing base values in every row below — only
-- colorWalumo (the single accent token) changes per destination.
-- colorGold stays the existing reserved ITM gold everywhere except the
-- Kinshasa finale, where it's the same value again (the finale is exactly
-- the moment that reserved gold already exists for). This keeps text
-- contrast/legibility identical to what's already shipped and proven —
-- "do not allow themes to fragment the UI... only the emotional layer
-- evolves" (the brief's own §23).
--
-- journey_kenya is activated here (replacing origin_heritage) because Day
-- 1 is the real, currently-LIVE day in the live campaign right now — this
-- reflects actual game state, not a guess. Going forward,
-- updateGameDayStatus (src/app/admin/missions/actions.ts) auto-activates
-- the matching journey theme whenever a day is published LIVE, via
-- src/lib/theme/activate.ts's shared helper — an admin can still manually
-- override from /admin/themes at any time.

insert into public.themes (key, name, tokens, is_active) values
  (
    'journey_drc',
    'Journey — DRC (Opening)',
    '{"colorInk":"#f4f6fa","colorMuted":"#93a0b4","colorBg":"#090c12","colorSurface":"#131826","colorWalumo":"#3b6fed","colorGold":"#c9a227"}'::jsonb,
    false
  ),
  (
    'journey_kenya',
    'Journey — Kenya: Build the Future',
    '{"colorInk":"#f4f6fa","colorMuted":"#93a0b4","colorBg":"#090c12","colorSurface":"#131826","colorWalumo":"#e08a3d","colorGold":"#c9a227"}'::jsonb,
    false
  ),
  (
    'journey_senegal',
    'Journey — Senegal: Teranga',
    '{"colorInk":"#f4f6fa","colorMuted":"#93a0b4","colorBg":"#090c12","colorSurface":"#131826","colorWalumo":"#d1573b","colorGold":"#c9a227"}'::jsonb,
    false
  ),
  (
    'journey_tanzania',
    'Journey — Tanzania: Umoja & Horizons',
    '{"colorInk":"#f4f6fa","colorMuted":"#93a0b4","colorBg":"#090c12","colorSurface":"#131826","colorWalumo":"#2ea8a0","colorGold":"#c9a227"}'::jsonb,
    false
  ),
  (
    'journey_uganda',
    'Journey — Uganda: The Pearl',
    '{"colorInk":"#f4f6fa","colorMuted":"#93a0b4","colorBg":"#090c12","colorSurface":"#131826","colorWalumo":"#2f9e63","colorGold":"#c9a227"}'::jsonb,
    false
  ),
  (
    'journey_nigeria',
    'Journey — Nigeria: Energy Without Limits',
    '{"colorInk":"#f4f6fa","colorMuted":"#93a0b4","colorBg":"#090c12","colorSurface":"#131826","colorWalumo":"#c23bd1","colorGold":"#c9a227"}'::jsonb,
    false
  ),
  (
    'journey_south_africa',
    'Journey — South Africa: Ubuntu',
    '{"colorInk":"#f4f6fa","colorMuted":"#93a0b4","colorBg":"#090c12","colorSurface":"#131826","colorWalumo":"#3b52d1","colorGold":"#c9a227"}'::jsonb,
    false
  ),
  (
    'journey_benin',
    'Journey — Benin: Heritage Meets Tomorrow',
    '{"colorInk":"#f4f6fa","colorMuted":"#93a0b4","colorBg":"#090c12","colorSurface":"#131826","colorWalumo":"#b8763b","colorGold":"#c9a227"}'::jsonb,
    false
  ),
  (
    'journey_kinshasa',
    'Journey — Kinshasa (Finale)',
    '{"colorInk":"#f4f6fa","colorMuted":"#93a0b4","colorBg":"#090c12","colorSurface":"#131826","colorWalumo":"#c9a227","colorGold":"#e6c860"}'::jsonb,
    false
  );

update public.themes set is_active = false where key = 'origin_heritage';
update public.themes set is_active = true where key = 'journey_kenya';
