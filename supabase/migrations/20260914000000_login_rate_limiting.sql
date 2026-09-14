-- Rate limiting for the public login-method check and instant self-join,
-- added directly in response to a dedicated security review (Phase 20)
-- finding: neither `checkLoginMethod` nor `instantJoin`
-- (src/app/login/actions.ts) had any rate limit, which (a) let an
-- anonymous visitor probe, one guess at a time with no friction, which
-- email addresses in the organization hold an admin-surface role, and
-- (b) amplified the self-registration path as a way to harvest real
-- email addresses into `profiles`/the public leaderboard at no cost.
--
-- A plain hit-log table + a count-in-window check, not a queue/Redis —
-- this app already leans on Postgres for every other integrity backstop
-- (vote uniqueness, one-active-theme, etc.), and login-attempt volume at
-- event scale never approaches a range where that's the wrong choice.

create table public.login_rate_limit_hits (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  identifier text not null,
  created_at timestamptz not null default now()
);

-- The only query pattern this table serves: "how many hits for this
-- bucket+identifier in the last N seconds" — a composite index on
-- exactly that, descending on time so the common case (recent hits) is
-- found without a full bucket scan as the table grows.
create index login_rate_limit_hits_lookup_idx
  on public.login_rate_limit_hits (bucket, identifier, created_at desc);

alter table public.login_rate_limit_hits enable row level security;

-- No policies at all for anon/authenticated — this table is written and
-- read exclusively by server actions using the service role (the
-- unauthenticated visitor this protects, by definition, has no session
-- to scope a client-side policy to anyway). Same deny-all-to-clients
-- shape as audit_logs/admin_notifications elsewhere in this schema.
