# ITM@15 E2E tests

The first committed E2E suite in this project's history. Every prior
phase's live verification lived in throwaway scratchpad Playwright
scripts, re-run and re-disclosed as a gap every session — this directory
closes that gap for the surfaces it covers so far.

## Why Python, not `@playwright/test`

`package.json`'s `test:e2e` script originally assumed a Node-based
`@playwright/test` suite (per the original Master Runbook's recommended
stack). That was never installed, and no session ever confirmed it would
actually work in this environment. What's proven to work — discovered
2026-09-17 via the `webapp-testing` Claude Code skill — is Python's
`playwright` package with a pre-installed Chromium, already present and
working with zero setup. Rather than gold-plate a switch to Node
Playwright that's unverified in this environment, this suite uses what's
actually confirmed working. `package.json`'s `test:e2e` script now calls
this directly. Revisit if a future session confirms Node Playwright works
here too and there's a real reason to prefer it (e.g. CI runner
constraints).

No `pytest`/`requests` dependency — plain assertions and the standard
library only, matching this project's "don't add a dependency for
something this small" convention seen throughout the codebase.

## Running

Start the app first — a **production build** is strongly recommended
over `pnpm dev`: `next start` is ready in ~150ms, while `pnpm dev`'s
per-route cold-compile under Turbopack can take 30s+ on a route's first
visit and caused real flakiness when this suite was first written.

```bash
pnpm build && pnpm start &
python3 tests/e2e/run_all.py
```

Or run one file directly:

```bash
python3 tests/e2e/test_signup_onboarding_play.py
```

Or let the `webapp-testing` skill manage the server lifecycle:

```bash
python3 ~/.claude/skills/webapp-testing/scripts/with_server.py \
  --server "pnpm start" --port 3000 -- \
  python3 tests/e2e/run_all.py
```

Set `E2E_BASE_URL` to point at a different running instance (a preview
deployment, for example) instead of `http://localhost:3000`.

## What's covered

- `test_public_pages.py` — the homepage cold-open (including the DRC
  line), `/login`, and a mobile-width overflow check. No account
  created, nothing to clean up.
- `test_signup_onboarding_play.py` — the real instant-sign-in →
  onboarding → DRC arrival cinematic → `/play` home → full player-shell
  tour, using a fresh synthetic `e2e.*@itm15.test` account. **Deletes the
  test account via the Supabase Admin API when it finishes**, success or
  failure (see `_lib/cleanup.py`) — matching this project's own
  established "create via service role, verify, delete" convention, now
  automated instead of manual.
- Two **regression checks** exist specifically because they were real
  bugs this suite's first run found (2026-09-17, commit `b63b136`): the
  arrival cinematic's background must be fully opaque (it used to be 98%,
  letting the page behind it visibly ghost through once the cinematic ran
  10+ seconds), and the `/play` hero card must not show a duplicated
  "Day 1 · Day 1" (the mission's own `dayTitle` already includes "Day N").

## What's not covered yet

Everything else in the app — admin flows, mission answering/scoring,
voting, media moderation, Wally triggers, the Kinshasa finale (needs a
player who's completed all 7 days), theme activation. This suite proves
the pattern works and covers the newest, least-verified surface
(Experience Transformation); extending it to the rest of the app is real,
tracked future work, not implied as done by this file existing.

## Cleanup safety

`_lib/cleanup.py` reads `SUPABASE_URL`/`SUPABASE_SECRET_KEY` from
`.env.local` (gitignored, never printed) to call Supabase's Admin REST
API directly. Deleting a test account's `auth.users` row is sufficient —
every real player-owned table cascades from it (confirmed by querying
`pg_constraint` against the live project before relying on this);
admin-authored-content tables that happen to reference a user are
`ON DELETE SET NULL`, so cleanup never fails because a test account
touched something unrelated.
