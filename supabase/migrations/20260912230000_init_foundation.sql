-- ITM@15 — Phase 1 foundation schema
-- Product Guide §23 (Database Model), §24 (Security and Privacy Requirements)
--
-- STATUS: DRAFT / UNVERIFIED. Written and reviewed against the spec, but NOT
-- yet applied to any database — there is no live Supabase project for
-- ITM@15 yet (blocked on a free-tier project limit, see docs/PROJECT_STATE.md)
-- and this machine has no Docker, so `supabase start` (local dev stack) is
-- also unavailable to test it against. Do not treat Phase 1 as complete
-- until this has actually been run with `supabase db reset` (local) or
-- `supabase db push` (remote) and the acceptance criteria in
-- docs/PROJECT_GUIDE.md §26 Phase 1 are demonstrably true:
--   - the database can be rebuilt from migrations, and
--   - an anonymous browser cannot read private player data.
--
-- Scope: profiles, countries, entities, user_roles, campaigns, audit_logs —
-- exactly the Phase 1 build list, nothing from later phases pulled forward.

-- ---------------------------------------------------------------------------
-- countries
-- ---------------------------------------------------------------------------

create table public.countries (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  iso_code text not null unique,
  flag_emoji text,
  created_at timestamptz not null default now()
);

alter table public.countries enable row level security;

-- Country list is not sensitive and is needed on the public landing page
-- (Product Guide §6.2, "map or visual representation of ITM's multinational
-- presence") as well as onboarding, so both anon and authenticated may read.
create policy "countries are publicly readable"
  on public.countries for select
  to anon, authenticated
  using (true);

-- No insert/update/delete policy for anon/authenticated: countries are
-- managed by admins through server actions using the service role, which
-- bypasses RLS entirely. Do not add a client-writable policy here.

-- ---------------------------------------------------------------------------
-- entities (company/department within a country)
-- ---------------------------------------------------------------------------

create table public.entities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country_id uuid not null references public.countries (id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (name, country_id)
);

alter table public.entities enable row level security;

create policy "entities are publicly readable"
  on public.entities for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- campaigns
-- ---------------------------------------------------------------------------

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'DRAFT'
    check (status in ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.campaigns enable row level security;

-- Campaign name/status/dates power the public landing-page countdown
-- (Product Guide §6.2) before login, so anon read is required. Nothing
-- sensitive lives on this table.
create policy "campaigns are publicly readable"
  on public.campaigns for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- profiles (one row per auth.users row — Product Guide §23.1, §23.2)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  first_name text,
  country_id uuid references public.countries (id) on delete set null,
  entity_id uuid references public.entities (id) on delete set null,
  status text not null default 'ACTIVE'
    check (status in ('ACTIVE', 'DISABLED')),
  must_change_password boolean not null default true,
  onboarding_completed boolean not null default false,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Players may read their own profile (needed for the player shell / Wally
-- greeting to resolve first_name, country_id, etc. client-side).
create policy "users can read own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

-- Deliberately NO client-facing insert/update policy on profiles.
--
-- Product Guide §5.1: admin account creation happens server-side only.
-- §5.3/§5.4: the first-login password change and onboarding flows write
-- must_change_password / onboarding_completed / country_id etc. — if a
-- generic "users can update own profile" policy existed, a player could call
-- the REST API directly and flip must_change_password to false without
-- actually changing their password, or edit country_id after onboarding to
-- game country-scoped mechanics. Those writes belong in Next.js Server
-- Actions using the Supabase service role (bypasses RLS, runs Zod-validated,
-- narrowly-scoped updates), not in a broad client-writable RLS policy. This
-- is the server-authoritative pattern CLAUDE.md and the runbook require.
-- Revisit this decision only via an ADR if a legitimate need for direct
-- client writes to profiles is identified.

-- ---------------------------------------------------------------------------
-- user_roles (Product Guide §4 — Player/Moderator/Country Admin/Game
-- Master/Super Admin/Analytics Viewer)
-- ---------------------------------------------------------------------------

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (
    role in (
      'PLAYER',
      'MODERATOR',
      'COUNTRY_ADMIN',
      'GAME_MASTER',
      'SUPER_ADMIN',
      'ANALYTICS_VIEWER'
    )
  ),
  -- Scopes a COUNTRY_ADMIN/MODERATOR grant to one country; null for
  -- roles that are inherently global (GAME_MASTER, SUPER_ADMIN, PLAYER).
  country_id uuid references public.countries (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, role, country_id)
);

alter table public.user_roles enable row level security;

-- Players may read their own role grants (used for client-side navigation
-- hints only — every admin server action independently re-checks the role
-- server-side; a readable role row here is not itself an authorization
-- decision).
create policy "users can read own role grants"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

-- No client-facing write policy: role assignment is a Super Admin action
-- performed server-side with the service role, always audited (see
-- audit_logs below).

-- ---------------------------------------------------------------------------
-- audit_logs (Product Guide §24.5)
-- ---------------------------------------------------------------------------

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

-- No policies at all for anon/authenticated: audit logs are written and
-- read exclusively through server code using the service role, which
-- bypasses RLS. A table with RLS enabled and zero policies denies all
-- client access by default — this is intentional, not an oversight.

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_campaigns_updated_at
  before update on public.campaigns
  for each row execute function public.set_updated_at();

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
