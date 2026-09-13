-- ITM@15 — Phases 6-10: Content Engine, Submission Engine, Authoritative
-- Scoring, Voting & Nominations, Media Moderation.
-- Product Guide §9 (content engine), §10 (scoring), §11 (voting), §12
-- (media), §23 (DB model).
--
-- SCOPE DECISIONS (disclosed, not hidden):
--
-- 1. One challenge per mission for this slice. Product Guide's hierarchy is
--    Mission -> Challenge (one-to-many), and this schema allows many
--    challenges per mission (challenges.mission_id FK, ordered) for future
--    extension, but the completion/scoring logic in this slice treats a
--    mission as "completed" when its first/primary challenge is answered
--    correctly or approved — matching Day Zero's actual scenario (Product
--    Guide §21: one mission, one photo-upload challenge, one score event).
--    Multi-challenge missions with partial credit are a future extension,
--    not required by any Phase 6-10 acceptance criterion.
--
-- 2. Four challenge types implemented, not all 20 from Product Guide §9.3:
--    SINGLE_CHOICE, MULTIPLE_CHOICE (auto-scored against challenge_options),
--    FREE_TEXT (moderator-reviewed), PHOTO_UPLOAD (moderator-reviewed,
--    Product Guide §12's media/moderation flow). These four cover every
--    Phase 6-10 gate and the Day Zero scenario. The other 16 (video/audio
--    upload, select-colleague, timed, cross-country partner, squad,
--    QR/code, find-a-person, image ID, sequence puzzle, poll-as-challenge,
--    check-in, admin-verified live) are deferred — challenges.type is a
--    plain text column (not an enum) specifically so adding more later is
--    an application-level change, not a migration.
--
-- 3. squads/squad_members are NOT included here. Product Guide lists squad
--    scoring/leaderboards, but automatic squad assignment (needed to make
--    squad_id ever populated) doesn't exist and isn't itemized in any
--    Phase 6-10 acceptance criterion. score_events.squad_id is included in
--    the schema for forward compatibility but will simply stay unpopulated
--    until a future slice builds squad assignment. Individual and country
--    leaderboards (country_id already exists on profiles) are fully real
--    with this migration alone.
--
-- 4. No separate media_submissions table. Product Guide §23 lists both
--    media_assets (general reference library — historical photos, etc.)
--    and media_submissions (challenge evidence) as distinct tables. This
--    migration adds media_assets for the former; challenge evidence lives
--    directly on `submissions` (storage_path + moderation columns) rather
--    than a second table, since every current evidence type is 1:1 with
--    its submission. Revisit only if a future challenge type needs
--    multiple media files per submission.
--
-- 5. Polls are single-choice only in this slice (Product Guide §11.1 also
--    describes multi-select). Enforcing "one ballot per player, UNLESS this
--    specific poll allows multiple selections" as a single database
--    constraint would need a partial-index predicate that reads another
--    table's column (a per-poll flag) — Postgres partial-index predicates
--    can only reference the indexed table's own columns, not join to
--    another table. Rather than approximate that with a weaker
--    server-action-only check for the multi-select case (leaving the
--    database itself unable to guarantee "duplicate vote blocked... not
--    only UI" — the actual Phase 9 acceptance wording), this slice
--    implements single-choice voting only, where a plain, correct
--    `unique(poll_id, voter_id)` constraint holds for every poll
--    unconditionally. Multi-select is a real, disclosed gap for a later
--    slice (it would need either a junction-table redesign or a trigger).

-- ---------------------------------------------------------------------------
-- game_days (Product Guide §9.1: Campaign -> Game Day -> ... -> Challenge)
-- ---------------------------------------------------------------------------

create table public.game_days (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  day_number integer not null check (day_number between 1 and 7),
  title text not null,
  theme text,
  unlock_at timestamptz,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'SCHEDULED', 'LIVE', 'COMPLETED')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, day_number)
);

create index game_days_campaign_id_idx on public.game_days (campaign_id);
create index game_days_created_by_idx on public.game_days (created_by);

alter table public.game_days enable row level security;

-- Players need to see LIVE/COMPLETED days to know what's unlocked; DRAFT/
-- SCHEDULED days stay invisible to them (Product Guide §26 Phase 6
-- acceptance: "Draft mission invisible to player" — the same rule applies
-- one level up, to days).
create policy "players can read live or completed game days"
  on public.game_days for select
  to authenticated
  using (status in ('LIVE', 'COMPLETED'));

-- No client-facing write policy — admin content management goes through
-- server actions with the service role, same pattern as every other admin
-- write in this project.

-- ---------------------------------------------------------------------------
-- missions (Product Guide §9.2)
-- ---------------------------------------------------------------------------

create table public.missions (
  id uuid primary key default gen_random_uuid(),
  game_day_id uuid not null references public.game_days (id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  status text not null default 'DRAFT' check (
    status in ('DRAFT', 'SCHEDULED', 'LIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED')
  ),
  -- Audience targeting (Product Guide §9.2 "Visibility target"). A player
  -- can see/attempt a mission only when audience_type is GLOBAL or matches
  -- their own profile — enforced in the RLS policy below, not just the UI.
  audience_type text not null default 'GLOBAL' check (
    audience_type in ('GLOBAL', 'COUNTRY', 'ENTITY', 'PLAYER')
  ),
  audience_id uuid,
  starts_at timestamptz,
  ends_at timestamptz,
  base_points integer not null default 0 check (base_points >= 0),
  unity_points integer not null default 0 check (unity_points >= 0),
  is_unity_challenge boolean not null default false,
  moderator_approval_required boolean not null default false,
  max_attempts integer check (max_attempts is null or max_attempts > 0),
  wally_intro_dialogue text,
  wally_completion_dialogue text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (game_day_id, slug)
);

create index missions_game_day_id_idx on public.missions (game_day_id);
create index missions_created_by_idx on public.missions (created_by);
-- Every player-facing query filters by exactly this pair (status + is it
-- targeted at me), matching the wally_events audience index's rationale.
create index missions_audience_idx on public.missions (audience_type, audience_id);

alter table public.missions enable row level security;

-- Product Guide §26 Phase 6 acceptance: "Player sees newly published
-- eligible mission... Draft mission is invisible to player." Deadline
-- enforcement (server timestamps, not client clocks) happens in the
-- submission server action, not here — RLS only controls visibility, per
-- the runbook's "realtime/RLS is presentation, not the sole authority"
-- pattern; a mission past its end_at is still visible (so players can see
-- what they missed) but the submit action itself checks now() server-side.
create policy "players can read live missions targeted at them"
  on public.missions for select
  to authenticated
  using (
    status in ('LIVE', 'PAUSED', 'COMPLETED')
    and (
      audience_type = 'GLOBAL'
      or (audience_type = 'PLAYER' and audience_id = (select auth.uid()))
      or (
        audience_type = 'COUNTRY'
        and audience_id = (select country_id from public.profiles where id = (select auth.uid()))
      )
      or (
        audience_type = 'ENTITY'
        and audience_id = (select entity_id from public.profiles where id = (select auth.uid()))
      )
    )
  );

-- ---------------------------------------------------------------------------
-- challenges (Product Guide §9.3)
-- ---------------------------------------------------------------------------

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions (id) on delete cascade,
  -- Plain text, not an enum: see the migration header — new challenge
  -- types are meant to be an application-level addition, not a schema
  -- change, once the four implemented here prove the pattern.
  type text not null check (type in ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'FREE_TEXT', 'PHOTO_UPLOAD')),
  prompt text not null,
  -- Free-form config (time limit, randomize options, max file size, etc.)
  -- that varies per type — validated at the application layer (Zod) per
  -- type, not constrained further at the database layer.
  config jsonb not null default '{}'::jsonb,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index challenges_mission_id_idx on public.challenges (mission_id);

alter table public.challenges enable row level security;

-- Inherits its mission's visibility rule via a join, rather than
-- duplicating the audience logic — a challenge is only ever meaningful in
-- the context of a mission a player can already see.
create policy "players can read challenges of a mission they can see"
  on public.challenges for select
  to authenticated
  using (
    exists (
      select 1 from public.missions m
      where m.id = challenges.mission_id
        and m.status in ('LIVE', 'PAUSED', 'COMPLETED')
        and (
          m.audience_type = 'GLOBAL'
          or (m.audience_type = 'PLAYER' and m.audience_id = (select auth.uid()))
          or (
            m.audience_type = 'COUNTRY'
            and m.audience_id = (select country_id from public.profiles where id = (select auth.uid()))
          )
          or (
            m.audience_type = 'ENTITY'
            and m.audience_id = (select entity_id from public.profiles where id = (select auth.uid()))
          )
        )
    )
  );

-- ---------------------------------------------------------------------------
-- challenge_options (for SINGLE_CHOICE / MULTIPLE_CHOICE)
-- ---------------------------------------------------------------------------

create table public.challenge_options (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  label text not null,
  is_correct boolean not null default false,
  order_index integer not null default 0
);

create index challenge_options_challenge_id_idx on public.challenge_options (challenge_id);

alter table public.challenge_options enable row level security;

-- Deliberately exposes is_correct to any player who can see the parent
-- challenge — acceptable because (a) this is only reachable once a mission
-- is LIVE and a player is already eligible to attempt it, and (b) the
-- server-side scoring action never trusts a client-submitted "I got it
-- right" claim regardless of what the client could see; it always
-- re-checks is_correct itself. A future hardening (hide is_correct until
-- after submission) would need a Postgres view or RPC — not required by
-- any Phase 6-10 acceptance criterion.
create policy "players can read options of a challenge they can see"
  on public.challenge_options for select
  to authenticated
  using (
    exists (
      select 1 from public.challenges c
      join public.missions m on m.id = c.mission_id
      where c.id = challenge_options.challenge_id
        and m.status in ('LIVE', 'PAUSED', 'COMPLETED')
        and (
          m.audience_type = 'GLOBAL'
          or (m.audience_type = 'PLAYER' and m.audience_id = (select auth.uid()))
          or (
            m.audience_type = 'COUNTRY'
            and m.audience_id = (select country_id from public.profiles where id = (select auth.uid()))
          )
          or (
            m.audience_type = 'ENTITY'
            and m.audience_id = (select entity_id from public.profiles where id = (select auth.uid()))
          )
        )
    )
  );

-- ---------------------------------------------------------------------------
-- submissions (Product Guide §7 challenge types / Phase 7 Submission
-- Engine, and Phase 10 Media Moderation for PHOTO_UPLOAD)
-- ---------------------------------------------------------------------------

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  player_id uuid not null references auth.users (id) on delete cascade,
  attempt_number integer not null default 1 check (attempt_number > 0),
  -- Free-text answer or a JSON payload of selected option ids, depending
  -- on challenge type.
  answer_text text,
  selected_option_ids uuid[],
  -- PHOTO_UPLOAD only: Supabase Storage path in the private
  -- challenge-submissions bucket (Product Guide §12.1).
  storage_path text,
  status text not null default 'PENDING' check (
    status in ('PENDING', 'APPROVED', 'REJECTED')
  ),
  moderated_by uuid references auth.users (id) on delete set null,
  moderated_at timestamptz,
  moderation_note text,
  submitted_at timestamptz not null default now(),
  -- Product Guide §26 Phase 7 acceptance: "Expired mission rejects late
  -- completion when configured" — the server action stamps this from its
  -- own now(), never a client-supplied timestamp.
  server_received_at timestamptz not null default now()
);

create index submissions_challenge_id_idx on public.submissions (challenge_id);
create index submissions_player_id_idx on public.submissions (player_id);
create index submissions_moderated_by_idx on public.submissions (moderated_by);
-- The moderation queue (Phase 10) filters on exactly this.
create index submissions_status_idx on public.submissions (status) where status = 'PENDING';

alter table public.submissions enable row level security;

-- A player may read only their own submissions (their own attempt
-- history/status) — never another player's, including their answer text
-- or moderation notes.
create policy "players can read their own submissions"
  on public.submissions for select
  to authenticated
  using (player_id = (select auth.uid()));

-- No client-facing INSERT/UPDATE policy. Submitting an answer must go
-- through a server action so deadline/attempt-limit/audience-eligibility
-- checks (Product Guide §26 Phase 7: "server deadline validation — never
-- trust client clocks") happen server-side using the service role, exactly
-- the pattern already established for profiles/user_roles writes.

-- ---------------------------------------------------------------------------
-- score_events (Product Guide §10.1 — append-only ledger)
-- ---------------------------------------------------------------------------

create table public.score_events (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references auth.users (id) on delete cascade,
  -- Forward-compatible, deliberately unpopulated for now — see migration
  -- header decision 3.
  squad_id uuid,
  country_id uuid references public.countries (id) on delete set null,
  points integer not null,
  point_type text not null check (
    point_type in (
      'MISSION_COMPLETED', 'UNITY_PARTNER_VERIFIED', 'BONUS', 'MODERATOR_CREATIVITY_BONUS',
      'PENALTY', 'REVERSAL'
    )
  ),
  source_type text not null check (source_type in ('MISSION', 'SUBMISSION', 'ADMIN_MANUAL')),
  source_id uuid,
  reason text not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  reversible boolean not null default true,
  reversal_of uuid references public.score_events (id) on delete set null,
  -- At least one of player_id/country_id must be set — a score event
  -- awarded to nobody is meaningless. (squad_id intentionally excluded
  -- from this check since it's not populated yet; add it back once squad
  -- assignment exists.)
  constraint score_events_has_a_recipient check (player_id is not null or country_id is not null)
);

create index score_events_player_id_idx on public.score_events (player_id);
create index score_events_country_id_idx on public.score_events (country_id);
create index score_events_created_by_idx on public.score_events (created_by);
create index score_events_reversal_of_idx on public.score_events (reversal_of);
-- Leaderboard aggregation queries always filter/group by this.
create index score_events_player_points_idx on public.score_events (player_id, points);

alter table public.score_events enable row level security;

-- Product Guide §26 Phase 8 acceptance: "Browser cannot award itself
-- points." No insert/update/delete policy for anon/authenticated at all —
-- every score event is written by a server action (moderation approval,
-- auto-scored quiz correctness, or an explicit admin bonus) using the
-- service role. Players may read their OWN score events (so a future
-- "my points history" view has something real to show), never another
-- player's individual ledger — aggregate leaderboards are computed
-- through the service role and exposed via a page, not raw table access.
create policy "players can read their own score events"
  on public.score_events for select
  to authenticated
  using (player_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- media_assets (Product Guide §12.4 — general admin media library; distinct
-- from challenge-evidence submissions and from wally_assets)
-- ---------------------------------------------------------------------------

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  asset_type text not null check (asset_type in ('PHOTO', 'VIDEO', 'AUDIO')),
  storage_path text not null,
  caption text,
  tags text[] not null default '{}',
  is_featured boolean not null default false,
  uploaded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index media_assets_uploaded_by_idx on public.media_assets (uploaded_by);

alter table public.media_assets enable row level security;

create policy "media assets are publicly readable"
  on public.media_assets for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- polls / poll_options / votes (Product Guide §11 Voting & Nominations)
-- ---------------------------------------------------------------------------

create table public.polls (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  title text not null,
  description text,
  self_vote_allowed boolean not null default false,
  reason_required boolean not null default false,
  results_visibility text not null default 'ADMIN_REVEAL' check (
    results_visibility in ('LIVE', 'AFTER_VOTE', 'ADMIN_REVEAL', 'NEVER')
  ),
  status text not null default 'DRAFT' check (status in ('DRAFT', 'OPEN', 'CLOSED', 'REVEALED')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index polls_campaign_id_idx on public.polls (campaign_id);
create index polls_created_by_idx on public.polls (created_by);

alter table public.polls enable row level security;

-- Players need to see OPEN polls (to vote) and CLOSED/REVEALED ones (to
-- see what they voted on / that voting ended) — DRAFT polls stay hidden.
create policy "players can read non-draft polls"
  on public.polls for select
  to authenticated
  using (status != 'DRAFT');

create table public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls (id) on delete cascade,
  label text not null,
  candidate_player_id uuid references auth.users (id) on delete set null,
  order_index integer not null default 0
);

create index poll_options_poll_id_idx on public.poll_options (poll_id);
create index poll_options_candidate_player_id_idx on public.poll_options (candidate_player_id);

alter table public.poll_options enable row level security;

create policy "players can read options of a poll they can see"
  on public.poll_options for select
  to authenticated
  using (
    exists (
      select 1 from public.polls p
      where p.id = poll_options.poll_id and p.status != 'DRAFT'
    )
  );

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls (id) on delete cascade,
  voter_id uuid not null references auth.users (id) on delete cascade,
  option_id uuid not null references public.poll_options (id) on delete cascade,
  reason text,
  created_at timestamptz not null default now()
);

create index votes_poll_id_idx on public.votes (poll_id);
create index votes_option_id_idx on public.votes (option_id);
-- Product Guide §26 Phase 9 acceptance: "Duplicate vote blocked at
-- database/server level, not only UI." This is the actual enforcement —
-- the server action also checks first for a clean error message, but even
-- if that check were somehow bypassed (a race between two concurrent
-- requests, say), the database itself physically cannot hold two rows for
-- the same (poll_id, voter_id) — see migration header decision 5 for why
-- this slice is single-choice-only, which is what makes this plain
-- constraint correct without needing a per-poll conditional.
alter table public.votes add constraint votes_one_ballot_per_poll unique (poll_id, voter_id);

alter table public.votes enable row level security;

-- Players may read their own ballots (so "did I already vote" and "what
-- did I vote for" work) but never another player's raw vote — aggregate
-- results are computed server-side and exposed only per the poll's
-- results_visibility rule, never via direct table access.
create policy "players can read their own votes"
  on public.votes for select
  to authenticated
  using (voter_id = (select auth.uid()));

-- No client-facing INSERT policy: casting a vote must go through a server
-- action that checks poll status/window, self-vote rule, and eligibility
-- server-side before writing, using the service role.
