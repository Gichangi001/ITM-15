-- Product Guide §23's original database model names `analytics_events` as
-- one of the product's core tables; nothing in this codebase has created
-- it until now — the Phase 19 analytics dashboard (src/app/admin/
-- analytics/page.tsx) explicitly disclosed this gap in its own header
-- comment, computing everything from existing tables instead. This
-- migration is the first real use: the Founder Story's own funnel events
-- (docs/ITM15_FOUNDER_STORY_OPENING_CHAPTER.md §31 —
-- founder_story_started/completed/skipped, origin_clue_collected, etc.),
-- but the table itself is generic, not Founder-Story-specific, so later
-- features can reuse it without a new migration.
--
-- Deny-all RLS, same pattern as audit_logs/admin_notifications: nothing
-- here is sensitive enough to need per-row client access, and there is no
-- legitimate reason for a client to read another visitor's analytics
-- events. Writes go through a server action (src/lib/analytics/track.ts)
-- using the service role — callable for a genuinely anonymous pre-login
-- visitor (player_id stays null) as well as a signed-in player.

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  player_id uuid references auth.users (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index analytics_events_event_name_idx on public.analytics_events (event_name);
create index analytics_events_player_id_idx on public.analytics_events (player_id);

alter table public.analytics_events enable row level security;

-- No policies for anon/authenticated: written and read exclusively
-- through the service role (a server action for writes; a future
-- analytics-dashboard extension for reads).
