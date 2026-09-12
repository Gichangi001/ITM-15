# ADR-0001: Prisma coexists with Supabase CLI migrations via introspection only

## Status

Accepted — 2026-09-12

## Context

`docs/PRODUCT_GUIDE.md` §3 (Recommended Technical Stack) specifies Supabase Postgres with Zod for validation; it does not call for an ORM. This project's Phase 1 work had already established `supabase/migrations/*.sql` as the schema source of truth (raw SQL, with RLS policies enabled from the first migration — see `20260912230000_init_foundation.sql`), following `ITM15_MASTER_BUILD_RUNBOOK.md` §15's "local-first migrations" workflow.

The user separately requested adding Prisma as an ORM, including its own `prisma/schema.prisma` and (per the pasted setup instructions) a `DATABASE_URL`/`DIRECT_URL`-based connection to Supabase's pooler. Prisma ships its own migration system (`prisma migrate dev`/`deploy`, tracked in `prisma/migrations/`), which would compete with `supabase/migrations/` for schema ownership if both were used as-is.

## Problem

Two systems that can each generate and apply schema migrations against the same database will drift from each other unless exactly one of them is authoritative. Additionally, **Prisma's schema language cannot express Postgres Row Level Security policies** — a `prisma migrate` workflow would either silently omit RLS (a real security regression) or require bolting raw SQL onto every Prisma migration to keep RLS in sync, which is more fragile than not using Prisma's migration system at all.

## Decision

Use Prisma **only** as a typed query client, generated via **introspection**, never as a migration tool:

1. `supabase/migrations/*.sql` remains the single source of truth for schema, including RLS. All schema changes are authored there.
2. After a migration is applied to a real database, run `prisma db pull` to introspect the live schema into `prisma/schema.prisma`, then `prisma generate` to build the typed client.
3. `prisma migrate dev` / `prisma migrate deploy` are **not used** in this project. `prisma/schema.prisma` starts empty of hand-written models — see the header comment in that file.
4. `@prisma/client` becomes an additional, optional way to write type-safe queries in server code, alongside `@supabase/supabase-js`. Neither replaces the other; RLS-sensitive reads still prefer the RLS-scoped Supabase client (`src/lib/supabase/server.ts`) unless a query is proven correct and intentional as a service-role/Prisma call.

## Alternatives considered

- **Prisma Migrate as the source of truth, drop `supabase/migrations`.** Rejected: loses RLS-in-migration tracking entirely, and would have required abandoning the Phase 1 migration already drafted and reviewed against `docs/PRODUCT_GUIDE.md`'s database model.
- **Run both migration systems independently.** Rejected: guaranteed schema drift and unclear "what actually created this table" history — exactly the failure mode ADRs exist to prevent.
- **Skip Prisma entirely, keep `@supabase/supabase-js` as the only query layer.** This was the default going in (matches the documented stack) and remains valid; Prisma was added because the user explicitly asked for it, not because a capability was missing.

## Security / privacy consequences

- RLS enforcement is unaffected — it lives entirely in `supabase/migrations/`, never in Prisma.
- `DATABASE_URL`/`DIRECT_URL` (direct Postgres connection strings, including the DB password) are server-only secrets, same tier as `SUPABASE_SECRET_KEY`. They must never reach client code. `.env.example` documents the names only.
- A Prisma client constructed with the direct connection string bypasses RLS the same way the Supabase service-role client does (it connects as the `postgres` role). Treat any `@prisma/client` call site with the same `security-gate` scrutiny as `src/lib/supabase/admin.ts`.

## Implementation consequences

- `prisma/schema.prisma` is not meaningfully usable until `DATABASE_URL`/`DIRECT_URL` are populated with a real password and at least one migration has been applied — both currently blocked/pending (see `docs/PROJECT_STATE.md`). `prisma generate` on the current empty schema produces a client with no model delegates.
- Whoever runs `prisma db pull` should diff the result before committing — introspection can reveal that a hand-written migration didn't produce the intended schema, which is a useful cross-check, not just plumbing.
- Add "run `prisma db pull && prisma generate`" as a step after every future migration that changes the schema, alongside the existing Supabase CLI workflow.
