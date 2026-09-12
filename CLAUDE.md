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

Use pnpm. Do not switch package managers. (Corepack/pnpm are not yet installed in this environment — see `docs/claude/ENVIRONMENT_INVENTORY.md`; install before the first `pnpm install`.)

## Required quality gate

Run the repository `pnpm verify` command before declaring a slice complete. This script does not exist yet — it is a Phase 0 deliverable (see `docs/PROJECT_STATE.md`).

## Memory

At session start, retrieve relevant project memory and run `project-bootstrap`. At meaningful milestones, run `docs-sync` and `memory-sync`. Memory is for durable technical knowledge, never secrets.

## Project skills

`.claude/skills/`: `project-bootstrap`, `repo-docs-audit`, `docs-sync`, `memory-sync`, `security-gate`. More (`supabase-review`, `test-gate`, `visual-qa`, `wally-qa`, `release-gate`) will be added when there is code/database/UI for them to review — see `docs/claude/ENVIRONMENT_INVENTORY.md` for the current rationale.
