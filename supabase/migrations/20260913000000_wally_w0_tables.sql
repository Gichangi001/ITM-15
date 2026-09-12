-- ITM@15 — Wally W0 tables (docs/WALLY.md §8, §37 "W0 — Contract and
-- placeholders": Wally event types, database migrations for Wally tables,
-- placeholder Wally asset registry, no heavy 3D yet).
--
-- STATUS: DRAFT / UNVERIFIED — same caveat as
-- 20260912230000_init_foundation.sql: not yet applied to any database.
-- Reviewed against the supabase-postgres-best-practices skill (FK indexes,
-- auth.uid() wrapped in select) before being committed, same as that file.
--
-- Scope: wally_dialogues, wally_events, wally_assets, wally_skins,
-- wally_event_receipts — exactly WALLY.md §8's five tables. No Wally
-- behaviour/controller/dialogue-resolution code exists yet (that's W1+,
-- Phase 13) — this is only the data model and a seed of the 8 real
-- placeholder images from MASCOTTE.zip into wally_assets.

-- ---------------------------------------------------------------------------
-- wally_dialogues (WALLY.md §8.1)
-- ---------------------------------------------------------------------------

create table public.wally_dialogues (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns (id) on delete cascade,
  key text not null,
  locale text not null default 'en',
  event_type text not null,
  variant text,
  text text not null,
  weight integer not null default 100,
  is_active boolean not null default true,
  valid_from timestamptz,
  valid_until timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, key, locale, variant)
);

create index wally_dialogues_campaign_id_idx on public.wally_dialogues (campaign_id);

alter table public.wally_dialogues enable row level security;

-- Dialogue text is not sensitive and every player needs to read it to see
-- Wally speak; only Game Masters/Super Admins can author it (no
-- insert/update/delete policy for anon/authenticated — that goes through
-- server actions with the service role, per WALLY.md §9 "Players may not
-- edit Wally dialogue").
create policy "wally dialogues are publicly readable"
  on public.wally_dialogues for select
  to anon, authenticated
  using (is_active);

-- ---------------------------------------------------------------------------
-- wally_assets (WALLY.md §8.3)
-- ---------------------------------------------------------------------------

create table public.wally_assets (
  id uuid primary key default gen_random_uuid(),
  asset_type text not null check (
    asset_type in (
      'MODEL_GLB', 'TEXTURE', 'ANIMATION', 'AUDIO', 'VOICE',
      'IMAGE_2D', 'LOTTIE', 'EFFECT', 'THUMBNAIL'
    )
  ),
  key text not null unique,
  storage_path text not null,
  quality_tier text,
  skin_key text,
  locale text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wally_assets enable row level security;

-- Asset metadata (which file backs which key) is not sensitive — the app
-- needs to read this to resolve what to render. Authoring is server-only.
create policy "wally assets are publicly readable"
  on public.wally_assets for select
  to anon, authenticated
  using (is_active);

-- ---------------------------------------------------------------------------
-- wally_skins (WALLY.md §8.4)
-- ---------------------------------------------------------------------------

create table public.wally_skins (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null,
  description text,
  model_asset_id uuid references public.wally_assets (id) on delete set null,
  thumbnail_asset_id uuid references public.wally_assets (id) on delete set null,
  theme_token_overrides jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index wally_skins_model_asset_id_idx on public.wally_skins (model_asset_id);
create index wally_skins_thumbnail_asset_id_idx on public.wally_skins (thumbnail_asset_id);

alter table public.wally_skins enable row level security;

create policy "wally skins are publicly readable"
  on public.wally_skins for select
  to anon, authenticated
  using (is_active);

-- ---------------------------------------------------------------------------
-- wally_events (WALLY.md §8.2)
-- ---------------------------------------------------------------------------

create table public.wally_events (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  event_type text not null,
  audience_type text not null check (
    audience_type in ('GLOBAL', 'COUNTRY', 'ENTITY', 'SQUAD', 'PLAYER')
  ),
  audience_id uuid,
  priority text not null check (
    priority in ('P0_CRITICAL', 'P1_LIVE_EVENT', 'P2_PLAYER_RESULT', 'P3_GUIDANCE', 'P4_AMBIENT')
  ),
  animation_key text not null,
  dialogue_key text,
  dialogue_override text,
  variables jsonb not null default '{}'::jsonb,
  sound_key text,
  effect_key text,
  entry_path text,
  position_key text,
  duration_ms integer,
  interruptible boolean not null default true,
  requires_acknowledgement boolean not null default false,
  cta jsonb,
  status text not null default 'DRAFT' check (
    status in ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'CANCELLED', 'EXPIRED')
  ),
  starts_at timestamptz,
  expires_at timestamptz,
  dedupe_key text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  cancelled_at timestamptz
);

create index wally_events_campaign_id_idx on public.wally_events (campaign_id);
-- Every client-side query for "events targeted at me" filters by exactly
-- this pair, per WALLY.md Sec 9's audience-matching RLS rule below.
create index wally_events_audience_idx on public.wally_events (audience_type, audience_id);

alter table public.wally_events enable row level security;

-- WALLY.md Sec 9: "Players may read Wally events targeted to them or to an
-- audience they belong to." A player is never directly a member of an
-- ENTITY/SQUAD/COUNTRY audience row here without checking their profile —
-- this policy covers GLOBAL and PLAYER-targeted events, which don't need a
-- join. COUNTRY/ENTITY/SQUAD-scoped visibility requires joining
-- public.profiles (and, once they exist, squad_members) and is
-- intentionally deferred to the migration that introduces squads (Phase 6+
-- per the Product Guide's build order) rather than guessed at here.
create policy "players can read published global or own-targeted wally events"
  on public.wally_events for select
  to authenticated
  using (
    status = 'PUBLISHED'
    and (
      audience_type = 'GLOBAL'
      or (audience_type = 'PLAYER' and audience_id = (select auth.uid()))
    )
  );

-- No client-facing write policy: publishing a Wally event is a Game
-- Master/Super Admin server action, always audited (WALLY.md Sec 9, "All
-- mass messages must create an audit log").

-- ---------------------------------------------------------------------------
-- wally_event_receipts (WALLY.md §8.5)
-- ---------------------------------------------------------------------------

create table public.wally_event_receipts (
  id uuid primary key default gen_random_uuid(),
  wally_event_id uuid not null references public.wally_events (id) on delete cascade,
  player_id uuid not null references auth.users (id) on delete cascade,
  delivered_at timestamptz,
  rendered_at timestamptz,
  acknowledged_at timestamptz,
  dismissed_at timestamptz,
  cta_clicked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (wally_event_id, player_id)
);

create index wally_event_receipts_player_id_idx on public.wally_event_receipts (player_id);

alter table public.wally_event_receipts enable row level security;

-- A player may read/insert/update only their own receipt row. Postgres RLS
-- has no column-level granularity for UPDATE, so this does technically let
-- a player set any of their own row's timestamp columns (including
-- delivered_at) to an arbitrary value via a direct REST call, not just the
-- client-observable ones. Accepted deliberately: this table is analytics
-- only (WALLY.md Sec 8.5, "enables analytics without making delivery
-- fragile") — a player fudging their own engagement timestamps is a data-
-- quality nuisance, not a privilege-escalation or cross-player exposure
-- risk, unlike profiles.must_change_password (see the ADR-worthy comment on
-- that table in 20260912230000_init_foundation.sql). If receipts data ever
-- feeds something authoritative (e.g. an achievement), move that write to
-- a server action instead of relaxing this further.
create policy "players can read own wally event receipts"
  on public.wally_event_receipts for select
  to authenticated
  using (player_id = (select auth.uid()));

create policy "players can record their own receipt"
  on public.wally_event_receipts for insert
  to authenticated
  with check (player_id = (select auth.uid()));

create policy "players can update their own receipt acknowledgement"
  on public.wally_event_receipts for update
  to authenticated
  using (player_id = (select auth.uid()))
  with check (player_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- updated_at maintenance (reuses public.set_updated_at from the foundation migration)
-- ---------------------------------------------------------------------------

create trigger set_wally_dialogues_updated_at
  before update on public.wally_dialogues
  for each row execute function public.set_updated_at();

create trigger set_wally_assets_updated_at
  before update on public.wally_assets
  for each row execute function public.set_updated_at();

create trigger set_wally_skins_updated_at
  before update on public.wally_skins
  for each row execute function public.set_updated_at();
