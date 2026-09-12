# ITM@15 Claude Code Instructions

You are building the Walumo ITM@15 Wally Takeover.

Before architectural or feature work, read:
- @ITM15_MASTER_BUILD_RUNBOOK.md
- @docs/PRODUCT_GUIDE.md
- @docs/WALLY.md

For current implementation state also read:
- @docs/PROJECT_STATE.md
- @docs/DOCS_INDEX.md
- @docs/QUALITY_STATUS.md

## Non-negotiables

- Investigate before editing. Never speculate about code you have not opened.
- Follow `PRODUCT_GUIDE.md` phases in order unless an earlier phase is already proven complete.
- Security, authorization, scores, votes, deadlines, eligibility, moderation and winners are server-authoritative.
- Never expose Supabase service credentials or any secret to browser code.
- Never store secrets or employee PII in Claude memory or the MCP knowledge graph.
- Database changes use migrations and RLS from the beginning.
- Admin actions affecting gameplay are auditable.
- Mobile is the primary player experience.
- Wally enhances server-approved state; Wally never invents game state.
- Every feature slice ends with lint, typecheck, tests, build, security review, docs/state update and a conventional commit.
- Do not deploy production merely because a preview succeeds. Production release follows the release gate in the master runbook.

## Package manager

Use pnpm (12.4.1, via corepack). Do not switch package managers.

## Required quality gate

Run `pnpm verify` (lint + typecheck + test + build) before declaring a slice complete. It exists and passes as of commit `8c8b36f`.

## Memory

At session start, retrieve relevant project memory and run `project-bootstrap`. At meaningful milestones, run `docs-sync` and `memory-sync`. Memory is for durable technical knowledge, never secrets.

## Project skills

`.claude/skills/`: `project-bootstrap`, `repo-docs-audit`, `docs-sync`, `memory-sync`, `security-gate`, plus the official `supabase` and `supabase-postgres-best-practices` skills. More (`test-gate`, `visual-qa`, `wally-qa`, `release-gate`) will be added when there is code/database/UI for them to review — see `docs/claude/ENVIRONMENT_INVENTORY.md` for the current rationale.

## Audit process

`docs/ITM15_PROJECT_AUDIT_AND_PENDING_CONTROL.md` governs how completion is tracked. `docs/PROJECT_AUDIT_CHECKLIST.md` is the authoritative backlog/checklist it requires — never maintain a second, competing completion list. A checkbox there is only `[x]` when its evidence block (requirement, implementation, tests, security, result, commit) actually backs it up.
