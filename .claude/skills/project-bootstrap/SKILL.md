---
name: project-bootstrap
description: Environment and repository discovery for ITM@15. Use at the start of a new build session, or whenever git/tooling state might have drifted, before any feature work begins.
---

# ITM@15 Project Bootstrap

Run this before starting or resuming feature work, per `ITM15_MASTER_BUILD_RUNBOOK.md` §2.

## Steps

1. Verify the local environment: `pwd`, `git status`, `git remote -v`, `git branch --show-current`, `git log --oneline -10`, `node --version`, `corepack --version || true`, `pnpm --version || true`, `claude --version`.
2. Verify required docs exist and are current: `CLAUDE.md`, `docs/PRODUCT_GUIDE.md`, `docs/WALLY.md`, `docs/PROJECT_STATE.md`, `docs/DOCS_INDEX.md`. Open and read them — do not assume prior sessions' summaries are still accurate.
3. Verify tool/MCP connections relevant to the current phase (`.mcp.json`, `gh auth status`, `vercel whoami`, Supabase connector) with a harmless read, not just a "connected" indicator.
4. Compare `docs/PROJECT_STATE.md`'s claimed state against actual `git log`/`git status`. If they disagree, git and the repository win — correct `PROJECT_STATE.md`.
5. Create any missing control files (`docs/claude/ENVIRONMENT_INVENTORY.md`, `docs/DOCS_INDEX.md`, `docs/PROJECT_STATE.md`, `docs/QUALITY_STATUS.md`) rather than assuming they exist.
6. Report: current phase, last verified commit, blockers, and the smallest next complete slice — before writing any application code.

Do not skip this because "it was just done last session." A new session has no memory of what actually happened unless it is written down in these files.
