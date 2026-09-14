-- Phase 15 — Theme Engine, Product Guide §19, §26 Phase 15.
--
-- SCOPE DECISION, disclosed: Product Guide §19.1 lists a much larger theme
-- shape (background image/video, 3D environment asset, Wally
-- outfit/skin, sound pack, confetti/effect pack, logo treatment, optional
-- country motif). Only the color-token subset is built here — exactly the
-- 6 CSS custom properties `src/app/globals.css` already defines
-- (`--color-ink/muted/bg/surface/walumo/gold`) and every component in
-- this app already reads. The richer asset-based fields need Phase 14
-- (Wally 3D, which itself is blocked on a real 3D asset — see
-- docs/PROJECT_STATE.md) and a real asset/audio pipeline neither of which
-- exist yet; adding placeholder columns for them now would invite exactly
-- the "looks built, isn't" trap this project avoids elsewhere. `tokens`
-- is a single jsonb column (not 6 separate columns) specifically so a
-- future session can extend the token set without a schema migration —
-- the CHECK constraint below only requires the 6 keys this app currently
-- reads to be present as strings, not that the object have exactly those
-- keys and no others.

create table public.themes (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  tokens jsonb not null check (
    tokens ? 'colorInk' and tokens ? 'colorMuted' and tokens ? 'colorBg'
    and tokens ? 'colorSurface' and tokens ? 'colorWalumo' and tokens ? 'colorGold'
  ),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- At most one active theme at a time — enforced at the database level
-- (a unique index on a constant partial predicate), not just by the
-- admin action always deactivating the previous one first. Every row
-- that satisfies `where is_active` has the identical index key `true`,
-- so a second one is a real uniqueness violation, not just an app-level
-- convention that a direct SQL write could silently break.
create unique index themes_only_one_active_idx on public.themes ((true)) where is_active;

alter table public.themes enable row level security;

-- Themes are not sensitive — the whole point is every visitor (including
-- an unauthenticated one on the public landing page, Product Guide §6)
-- sees the currently active one. No client-writable policy: activation
-- goes through a server action using the service role, same pattern as
-- every other admin-controlled global setting in this app.
create policy "themes are publicly readable"
  on public.themes for select
  to anon, authenticated
  using (true);

create trigger set_themes_updated_at
  before update on public.themes
  for each row execute function public.set_updated_at();

-- Seed real presets from Product Guide §19.3's named list, using colors
-- already established elsewhere in this app (src/content/dayThemes.ts's
-- day-accent palette, itself grounded in the Storyline Build Bible §34)
-- rather than inventing a second, uncoordinated color language. "Origin /
-- Heritage" is seeded active — the app already defaults to these exact
-- values today (globals.css's :root), so activating it changes nothing
-- about what a fresh install looks like.
insert into public.themes (key, name, tokens, is_active) values
  (
    'origin_heritage',
    'Origin / Heritage',
    '{"colorInk":"#f4f6fa","colorMuted":"#93a0b4","colorBg":"#090c12","colorSurface":"#131826","colorWalumo":"#3b6fed","colorGold":"#c9a227"}'::jsonb,
    true
  ),
  (
    'journey_passport',
    'Journey / Passport',
    '{"colorInk":"#f4f6fa","colorMuted":"#9bb3c4","colorBg":"#0a1420","colorSurface":"#111f2e","colorWalumo":"#3ba7d1","colorGold":"#c9a227"}'::jsonb,
    false
  ),
  (
    'legacy_future',
    'Legacy / Future 2041',
    '{"colorInk":"#f7f6f0","colorMuted":"#b8ae94","colorBg":"#0d0b08","colorSurface":"#1a160f","colorWalumo":"#c9a227","colorGold":"#e6c860"}'::jsonb,
    false
  );
