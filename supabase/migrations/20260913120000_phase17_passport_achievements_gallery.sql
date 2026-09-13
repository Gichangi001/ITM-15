-- Phase 17 (Passport, Achievements) + Gallery event-photo uploads +
-- Leaderboard "new member" visibility, per the product owner's explicit
-- 2026-09-13 direction (goes beyond Product Guide §17's original spec in
-- places — see each section's own comment for what's new vs. spec'd).
--
-- Decisions the product owner made explicitly before this migration was
-- written (both via AskUserQuestion, not assumed):
--   1. Passport "location" is free-text (e.g. "Nairobi office"), never
--      live GPS — no geolocation permission/consent flow anywhere here.
--   2. Contact-sharing fields (phone, entity/company, location) are shown
--      on the shareable passport once a player has filled them in — no
--      per-field opt-in toggle. Email is already effectively shared today
--      (it's how colleagues already know each other at ITM), so it's
--      included on the same terms.

-- ---------------------------------------------------------------------------
-- passport_cards — a deliberately separate, narrow table from `profiles`.
--
-- Why not just add phone/location columns to `profiles` and open a public
-- RLS policy on it: RLS is row-level, not column-level — there is no way
-- to let anon readers see "just the shareable passport columns" of
-- `profiles` without also deciding row-visibility for every OTHER column
-- on that table (status, must_change_password, onboarding_completed, the
-- works). Duplicating only the intentionally-shareable fields into their
-- own table keeps `profiles` exactly as protected as it already is, and
-- makes the public-sharing surface auditable in one place.
--
-- Why RLS here is deny-all (like audit_logs/admin_notifications), not a
-- permissive "anyone can read" policy: a permissive `using (true)` policy
-- would let anyone with the public anon key run `select * from
-- passport_cards` and dump every player's phone number at once — RLS
-- cannot restrict that to "only the row whose slug you already know",
-- because policies gate rows by their own data, not by what the client's
-- query happened to filter on. The actual public lookup-by-slug path is
-- `/passport/[slug]`, a Server Component reading through the service-role
-- admin client — never a direct client-side query — so there is no way to
-- enumerate the table from the browser at all.
-- ---------------------------------------------------------------------------

create table public.passport_cards (
  player_id uuid primary key references auth.users (id) on delete cascade,
  -- hex, not base64: base64's +/= characters need URL-escaping to appear
  -- safely in a shared /passport/[slug] link or a QR code's payload; hex
  -- is plain [0-9a-f], safe to drop straight into a URL path unescaped.
  passport_slug text not null unique default encode(gen_random_bytes(9), 'hex'),
  full_name text,
  first_name text,
  avatar_path text,
  phone text,
  location_text text,
  company_text text,
  country_name text,
  country_flag_emoji text,
  updated_at timestamptz not null default now()
);

alter table public.passport_cards enable row level security;

-- A player may read their own card (used to render the /passport edit
-- page's current values) — never anyone else's, and never via anon.
create policy "players can read their own passport card"
  on public.passport_cards for select
  to authenticated
  using (player_id = (select auth.uid()));

-- No insert/update/delete policy for any client role — editing a passport
-- card goes through a server action (src/app/passport/actions.ts) using
-- the service role, so the same "server re-derives everything, never
-- trusts client-claimed values" rule applies here as everywhere else in
-- this app (in particular: country_name/flag are looked up server-side
-- from the player's real profile, never accepted as free text from the
-- edit form).

-- ---------------------------------------------------------------------------
-- achievements / player_achievements (Product Guide §23's original schema
-- list named these tables; this is the first migration that actually
-- creates them). Per the product owner's direction: "for those who go
-- above and beyond — collecting easter eggs, networking and standing out
-- in the vote." Easter eggs specifically depend on a hidden-object/Golden
-- Wally mechanic (docs/WALLY.md §23) that doesn't exist yet — this
-- migration creates the real engine and seeds achievement definitions for
-- what's actually derivable from data that exists today (cross-country
-- unity submissions, mission completion, vote reception); an
-- easter-egg-sourced achievement can be added later without a schema
-- change once that mechanic exists (source_type is a plain text column
-- specifically so this doesn't need new DDL when it does).
-- ---------------------------------------------------------------------------

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  description text not null,
  icon text not null default '🏅',
  created_at timestamptz not null default now()
);

alter table public.achievements enable row level security;

-- Achievement definitions are not sensitive — every player needs to read
-- them to see what's achievable at all (an empty-state "achievements to
-- unlock" list). Authoring is server-only (no client write policy).
create policy "achievements are publicly readable"
  on public.achievements for select
  to authenticated
  using (true);

create table public.player_achievements (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references auth.users (id) on delete cascade,
  achievement_id uuid not null references public.achievements (id) on delete cascade,
  source_type text,
  source_id uuid,
  awarded_at timestamptz not null default now(),
  unique (player_id, achievement_id)
);

create index player_achievements_player_id_idx on public.player_achievements (player_id);
create index player_achievements_achievement_id_idx on public.player_achievements (achievement_id);

alter table public.player_achievements enable row level security;

-- Readable by any authenticated player, not just the achiever — this is
-- recognition (Product Guide §4.1 player capability list already includes
-- "view permitted leaderboards"; a badge earned is the same kind of
-- visible-to-everyone recognition, not private data). Never client-writable
-- — every award is computed server-side from an already-verified event
-- (a real approved cross-country submission, a real mission completion,
-- a real vote-reveal result), exactly the "Wally never fabricates" and
-- "browser cannot forge points" rules applied to badges instead of points.
create policy "player achievements are readable by any signed-in player"
  on public.player_achievements for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- event_photos — free-form gallery contributions (camera capture or a
-- library picker), distinct from a `submissions` row: not tied to any one
-- mission/challenge. Product owner: "allow people to activate their
-- cameras and take photos... save photos inside the app and upload photos
-- of the event, the more the better." Goes into the SAME moderation
-- pipeline discipline as everything else in this app — Product Guide
-- §26 Phase 10's hard rule ("unapproved media never appears on public
-- surfaces") applies exactly as much to a free-form event photo as it
-- does to mission evidence; there is no separate, less-scrutinized path.
-- ---------------------------------------------------------------------------

create table public.event_photos (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  caption text,
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  moderated_by uuid references auth.users (id) on delete set null,
  moderated_at timestamptz,
  created_at timestamptz not null default now()
);

create index event_photos_player_id_idx on public.event_photos (player_id);
create index event_photos_status_idx on public.event_photos (status) where status = 'PENDING';

alter table public.event_photos enable row level security;

-- A player can see their own contributions (any status — so they can see
-- "pending moderation" vs "approved" on their own uploads) and everyone's
-- already-approved ones (this is what feeds the public in-app gallery).
create policy "players can read their own event photos or any approved one"
  on public.event_photos for select
  to authenticated
  using (player_id = (select auth.uid()) or status = 'APPROVED');

-- A player can insert only their own row, always starting PENDING —
-- mirrors the exact shape of the challenge-submissions storage policy
-- below: the row-level check here is a second, redundant gate alongside
-- that storage policy, not a replacement for it.
create policy "players can submit their own event photo"
  on public.event_photos for insert
  to authenticated
  with check (player_id = (select auth.uid()) and status = 'PENDING');

-- No client-facing UPDATE/DELETE policy — moderation (approve/reject) goes
-- through a server action using the service role, same as `submissions`.

-- ---------------------------------------------------------------------------
-- event-photos storage bucket — private by default, per-uploader-folder
-- policies, identical shape to `challenge-submissions`
-- (20260913083000_challenge_submissions_storage.sql). A signed URL is
-- minted server-side for moderation preview and for the public gallery
-- (approved only), the same pattern the gallery page already uses for
-- mission-submission photos.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-photos',
  'event-photos',
  false,
  10485760, -- 10MB, matching challenge-submissions
  array['image/jpeg', 'image/png', 'image/webp']
);

create policy "players can upload their own event photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'event-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "players can read their own event photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'event-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ---------------------------------------------------------------------------
-- notifications.source_type extended for real day-start/day-end
-- notifications (product owner: "notifications will be at the start and
-- end of the day"), fired from the one place that already
-- server-authoritatively changes a day's status —
-- updateGameDayStatus (src/app/admin/missions/actions.ts) — rather than a
-- blind time-based cron this environment has no way to observe firing
-- anyway. A day going LIVE/COMPLETED is already a real, audited,
-- previously-verified admin action; this just fans out a notification row
-- at the same moment, the same way submission.approved already does.
-- ---------------------------------------------------------------------------

alter table public.notifications drop constraint notifications_source_type_check;
alter table public.notifications add constraint notifications_source_type_check
  check (
    source_type in (
      'ADMIN_MESSAGE', 'MISSION_PUBLISHED', 'SUBMISSION_APPROVED', 'SUBMISSION_REJECTED',
      'BONUS_POINTS', 'VOTE_OPENED', 'VOTE_REVEALED', 'DAY_STARTED', 'DAY_ENDED'
    )
  );

-- ---------------------------------------------------------------------------
-- Seed a first, real, honestly-derivable set of achievement definitions.
-- Deliberately small — an achievement that can't actually be earned by any
-- currently-possible player action is worse than no achievement at all,
-- per this project's own "no fake demo" rule.
-- ---------------------------------------------------------------------------

insert into public.achievements (key, title, description, icon) values
  ('first_mission', 'First Steps', 'Completed your first mission.', '🎯'),
  ('cross_country_connector', 'Cross-Country Connector', 'Completed a Unity challenge with someone from another country.', '🌍'),
  ('crowd_favorite', 'Crowd Favorite', 'Received the most votes in a revealed poll.', '🏆'),
  ('five_missions', 'On a Roll', 'Completed five missions.', '🔥');
