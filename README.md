# ITM@15 — Walumo Wally Takeover

A seven-day, live, mobile-first anniversary game built for ITM Group's 15th anniversary — guided by **Wally**, an animated character who reacts to real events in real time instead of sitting in a corner as decoration.

## Why this exists

ITM Group is turning 15. The obvious way to mark that is a message from leadership and a slide deck. This project exists to do something harder and more memorable instead: turn the anniversary into a game employees actually want to open every day, across every country ITM operates in.

It is also a deliberate proof of capability. Walumo is building this to demonstrate — through a real, shipped, secure, real-time product — that it can build the kind of engagement, gamification, and live-admin-operated software that other organizations would want to commission. The product has to work on its own merits first; the demonstration follows from that, not from saying so.

## Who it's for

- **ITM employees** across every country and entity, playing primarily on their phones — discovering ITM's history, meeting colleagues outside their usual country/team, completing daily missions, voting, uploading photos, and earning Unity Points.
- **Game Masters and Super Admins**, who run the live campaign from a real-time Mission Control dashboard — publishing missions, approving photos, awarding bonus points, opening votes, changing themes, and triggering Wally, without ever asking a developer to redeploy anything.
- **Moderators and Country Admins**, who review submissions and manage their own country's participation.
- **Walumo's product and leadership teams**, who use the finished platform as evidence of what Walumo can build for future clients, and as a reusable engagement engine for future campaigns beyond ITM@15.

## Goal

Make employees say **"Walumo built this?"** — and mean it as a compliment about the product, not the marketing. Concretely, that means:

1. Employees leave knowing more about ITM's history, people, countries and culture than when they started.
2. Employees interact with colleagues outside their normal country, entity or department — the game requires it.
3. Every day feels different while still belonging to one coherent, seven-day story that ends in a real emotional payoff, not just a final leaderboard.
4. Admins can run the entire live campaign — content, scoring, moderation, live messages, themes — without a code deploy.
5. Every score, vote, and admin action is server-authoritative and auditable; nothing important is ever just a client-side or realtime-only claim.
6. The game still works well on a modest phone — 3D and cinematic effects degrade gracefully and never gate gameplay.

## Current status

**Phase 0 (repository and quality foundation), in progress.** The Next.js app is scaffolded, `pnpm verify` (lint/typecheck/test/build) passes, and CI runs on every push. Vercel is linked and Git-connected; the Supabase project for ITM@15 is blocked on a free-tier project-limit decision. See [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md) for the live phase/blocker/next-step status, and [`docs/DOCS_INDEX.md`](docs/DOCS_INDEX.md) for what every document in this repo is and its authority level.

## Where to start reading

1. [`CLAUDE.md`](CLAUDE.md) — the short operating rules for Claude Code sessions working on this repo.
2. [`ITM15_MASTER_BUILD_RUNBOOK.md`](ITM15_MASTER_BUILD_RUNBOOK.md) — how this repo is built: process, tooling, testing gates, git/release workflow.
3. [`docs/PRODUCT_GUIDE.md`](docs/PRODUCT_GUIDE.md) — the authoritative product specification: vision, roles, the seven-day game structure, scoring/voting/media systems, database model, security requirements, and the phase-by-phase build plan.
4. [`docs/WALLY.md`](docs/WALLY.md) — the Wally subsystem specification: character, event catalogue, animation/rendering tiers, realtime contract, and admin control room.

## Stack (per the Product Guide)

Next.js + TypeScript, Tailwind CSS + shadcn/ui, Supabase (Postgres, Auth, Realtime, Storage), Resend + React Email, Three.js + React Three Fiber + Drei (Wally 3D), Vercel hosting, pnpm, Zod, Playwright + Vitest, Sentry.

## Product owner

Walumo.
