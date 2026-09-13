-- Product Guide §15 (Notification System), §26 Phase 12.
--
-- Two tables, deliberately separate:
--
-- 1. admin_notifications — the admin's composed broadcast intent (audience,
--    title, message, severity, CTA). Admin-only, same deny-all-by-default
--    pattern as audit_logs: RLS enabled, zero client policies, read/written
--    exclusively through the service role. This is what /admin/notifications'
--    history list shows.
--
-- 2. notifications — Product Guide §15.1 "persistent notifications... store
--    in a notifications table with read/unread state." Fanned out at send
--    time to one row per targeted player (not a single shared row with an
--    audience filter) so a plain, standard "own row" RLS policy
--    (player_id = auth.uid()) is sufficient for a player's own notification
--    center — no join through admin_notifications needed for a player to
--    read their own inbox. At ITM@15's real scale (an internal company
--    campaign, not a consumer app with millions of users) a fan-out insert
--    of a few hundred rows for a GLOBAL announcement is trivial.
--
-- Audience vocabulary matches missions.audience_type exactly (GLOBAL,
-- COUNTRY, ENTITY, PLAYER — no SQUAD, since squads don't exist yet; same
-- disclosed gap already recorded on the missions table).
--
-- Scheduling: `admin_notifications.scheduled_at` exists in the schema for
-- forward compatibility, but this slice only wires up immediate delivery
-- ("Send now"). Genuinely firing at a future time needs a cron trigger,
-- which doesn't exist anywhere in this project yet (that's Phase 16's
-- territory, building the daily email job) — the composer UI does not offer
-- a "schedule for later" option it can't actually honor.

create table public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  audience_type text not null check (audience_type in ('GLOBAL', 'COUNTRY', 'ENTITY', 'PLAYER')),
  audience_id uuid,
  title text not null,
  message text not null,
  severity text not null default 'INFO' check (severity in ('INFO', 'CELEBRATION', 'URGENT')),
  cta_label text,
  cta_href text,
  scheduled_at timestamptz,
  sent_at timestamptz,
  recipient_count integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index admin_notifications_created_by_idx on public.admin_notifications (created_by);

alter table public.admin_notifications enable row level security;

-- No policies for anon/authenticated: composed and read exclusively by
-- admin server actions using the service role, same as audit_logs.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  message text not null,
  severity text not null default 'INFO' check (severity in ('INFO', 'CELEBRATION', 'URGENT')),
  cta_label text,
  cta_href text,
  source_type text not null check (
    source_type in ('ADMIN_MESSAGE', 'MISSION_PUBLISHED', 'SUBMISSION_APPROVED', 'SUBMISSION_REJECTED', 'BONUS_POINTS', 'VOTE_OPENED', 'VOTE_REVEALED')
  ),
  source_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_player_id_idx on public.notifications (player_id);
-- The player's own inbox always queries "my unread first" — a partial
-- index on exactly that predicate, same pattern as submissions' PENDING
-- partial index.
create index notifications_unread_idx on public.notifications (player_id) where read_at is null;

alter table public.notifications enable row level security;

-- A player may read only their own notifications.
create policy "players can read their own notifications"
  on public.notifications for select
  to authenticated
  using (player_id = (select auth.uid()));

-- A player MAY mark their own notification read/unread directly — this is
-- the one exception to this project's usual "no client-writable policy,
-- everything through a server action" pattern for player-owned rows, and
-- it's deliberately narrow: the policy only allows changing read_at on a
-- row that is already theirs, never any other column, and never another
-- player's row. There is no meaningful way to abuse "I marked my own
-- notification as read/unread" the way there is for, say, must_change_password
-- or a score field, so a server round trip isn't required for it to stay
-- server-authoritative in any sense that matters.
create policy "players can update read_at on their own notifications"
  on public.notifications for update
  to authenticated
  using (player_id = (select auth.uid()))
  with check (player_id = (select auth.uid()));

-- No client-facing INSERT/DELETE policy: notifications are only ever
-- created by a server action using the service role (an admin send, or a
-- future system-generated event like "mission approved").
