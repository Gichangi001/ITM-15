# ITM@15 — Documentation Index

Generated during the discovery/bootstrap session. Regenerate whenever a controlling document changes.

## Authority order (per `ITM15_MASTER_BUILD_RUNBOOK.md` §1.1)

1. Security/privacy/permissions/scoring/voting/moderation/server-authority rules (wherever stated) — always win.
2. `docs/PRODUCT_GUIDE.md` (currently at repo root as `Walumo_ITM15_Wally_Product_Build_Guide.md`) — product requirements, architecture, roles, phases, acceptance criteria.
3. `docs/WALLY.md` (currently at repo root as `WALLY.md`) — Wally-specific behaviour/rendering/events/admin control.
4. `ITM15_MASTER_BUILD_RUNBOOK.md` — process, tooling, testing gates, git/release workflow.
5. `.docx` documents — supporting human-readable source; superseded by the `.md` unless the Word file has a clearly newer approved requirement.
6. Existing code never overrules the specs merely by existing.

## Documents

| Path | Type | Purpose | Authority level | Last commit | SHA (git blob) | Key requirements | Fully read? | Superseded by |
|---|---|---|---|---|---|---|---|---|
| `ITM15_MASTER_BUILD_RUNBOOK.md` | Markdown | Execution/orchestration guide for Claude Code: discovery order, tool/MCP setup, memory strategy, skills/agents to create, git workflow, 21-phase build order mapped to tooling, test strategy, security checklist, release gate | 3 (process authority) | `011d959` (2026-09-12) | `9307c2fd…` | The DISCOVER→READ→UNDERSTAND→PLAN→BUILD→TEST→SECURITY→VISUAL→DOCS→MEMORY→COMMIT loop; "one rule": never code before understanding; full phase-by-phase tool mapping in §17 | **Yes** (full document read) | No |
| `docs/PRODUCT_GUIDE.md` | Markdown | Product specification — vision, stack, roles, auth, 7-day game structure, content engine, scoring, voting, media, Wally integration points, admin Mission Control, DB model, security, 22-phase build plan, MVP definition | 2 (product authority) | `e351744` (2026-09-12, content unchanged since relocation) | `7c1cef23…` | Server-authoritative scoring/voting/permissions; invite-only auth with temporary `Walumo` password + forced first-login change; `score_events` ledger; RLS from Phase 1; phases in §26 | **Yes** | Not superseded |
| `docs/WALLY.md` | Markdown | Wally subsystem specification — character bible, event catalogue, priority/state machine, realtime contract, DB tables (`wally_dialogues`/`wally_events`/`wally_assets`/`wally_skins`/`wally_event_receipts`), rendering tiers, admin Wally control room, dialogue engine, 8-stage Wally build order (W0–W8), acceptance criteria | 2 (Wally-subsystem authority, subordinate to security/product rules) | `e351744` (2026-09-12, content unchanged since relocation) | `62688a3e…` | Wally never authoritative for scores/ranks/votes/deadlines/permissions; Broadcast event `wally.triggered`; quality tiers HIGH/STANDARD/LITE/REDUCED_MOTION; first vertical slice = "Meet Another Country" Day Zero scenario (§44) | **Yes** | Not superseded |
| `docs/PRODUCT_GUIDE.docx` | Word | Human-readable source version of the product guide | 5 (supporting only) | `e351744` (2026-09-12) | Same content class as `docs/PRODUCT_GUIDE.md` | **No** — not independently text-extracted; same upload commit and apparent scope as the `.md`, treated as non-diverging per runbook §1.1(5) but not confirmed byte-for-byte. Use the `repo-docs-audit` skill before relying on this for anything the `.md` doesn't already say. | Superseded by `docs/PRODUCT_GUIDE.md` unless a future diff shows a newer approved requirement only present here |
| `README.md` | Markdown | Project overview — why it exists, who it's for, the goal, current status, stack, and where to start reading | 6 (none — informational) | Uncommitted (rewritten this session) | — | — | Yes (authored this session) | N/A |
| `CLAUDE.md` | Markdown | Short control-plane file per runbook §4 — non-negotiables, pointers to the specs, package manager, quality gate, memory/skill pointers | 3 (process authority) | Uncommitted (created this session) | — | Runbook §4 template, adapted to corrected `docs/` paths | Yes (authored this session) | N/A |
| `docs/claude/ENVIRONMENT_INVENTORY.md` | Markdown | Capability inventory (skills/agents/hooks/MCP/plugins/permissions/memory/runtimes) | Internal (Claude Code process record) | Uncommitted | — | See file | Yes | N/A |
| `docs/PROJECT_STATE.md` | Markdown | Current phase, completed/in-progress/blockers, next slice | Internal (Claude Code process record) | Uncommitted | — | See file | Yes | N/A |
| `docs/QUALITY_STATUS.md` | Markdown | Last known result of lint/typecheck/tests/build/security/etc. | Internal (Claude Code process record) | Uncommitted | — | See file | Yes | N/A |
| `docs/adr/` | Directory | Architecture Decision Records | Internal | Created, empty | — | — | N/A | N/A |
| `.claude/skills/*/SKILL.md` (5 files) | Markdown | Project skills: `project-bootstrap`, `repo-docs-audit`, `docs-sync`, `memory-sync`, `security-gate` | Internal (process authority) | Uncommitted | — | See runbook §7.1 | Yes | N/A |
| `.mcp.json` | JSON | Project-scoped MCP server definitions: `vercel`, `supabase`, `playwright`, `memory` (no secrets — OAuth/local-stdio only) | Internal (process config) | Uncommitted | — | Per runbook §5.2–5.3, §5.4, §5.6 | Yes | N/A |

## Conflicts identified

**None found in content.** `ITM15_MASTER_BUILD_RUNBOOK.md`, `docs/PRODUCT_GUIDE.md`, and `docs/WALLY.md` are internally consistent — they were evidently authored as one coherent set (same upload commits, cross-referencing paths and phase numbers exactly).

**Resolved this session:** the structural conflict between the documents' path assumptions and the actual repository layout (product guide and Wally spec at repo root under different filenames, no `CLAUDE.md`) has been fixed — files relocated with `git mv` (history preserved), `CLAUDE.md` created. See `docs/PROJECT_STATE.md` for the commit this lands in.

## Non-Markdown/Word files found

`docs/PRODUCT_GUIDE.docx` (relocated from repo root, unchanged). No PDFs. `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `.env.example`, `.github/`, `vercel.json`, `supabase/`, `tests/`, `playwright.config.*` still do not exist — those remain Phase 0 application-scaffolding deliverables, not documentation.
