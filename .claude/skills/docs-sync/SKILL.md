---
name: docs-sync
description: Updates docs/PROJECT_STATE.md, docs/QUALITY_STATUS.md and relevant ADRs to match actual implementation state for ITM@15. Use after completing a meaningful slice, and before ending a work session.
---

# ITM@15 Docs Sync

Purpose (per `ITM15_MASTER_BUILD_RUNBOOK.md` §10, §35): keep the project's state files factual and current, never aspirational.

## Steps

1. Update `docs/PROJECT_STATE.md`: current phase, last verified commit SHA, completed/in-progress/blockers, current architecture decisions, next smallest complete slice, required verification before the next phase.
2. Update `docs/QUALITY_STATUS.md` with only the checks actually run against the current commit — lint/typecheck/unit/integration/RLS/E2E/build/visual-QA/security-gate/preview-deployment/load-test. Never mark a gate green based on a prior commit after relevant code changed; never mark a gate green because it was skipped.
3. If a decision was made that's worth remembering across sessions (architecture, security posture, a rejected alternative), write an ADR under `docs/adr/000N-<slug>.md` with Context / Decision / Alternatives considered / Security-privacy consequences / Implementation consequences / Status / Date.
4. Do not rewrite an approved product requirement in `docs/PRODUCT_GUIDE.md` or `docs/WALLY.md` to match what was implemented — if implementation diverged from spec, that's a conflict to surface (see `repo-docs-audit`) or an ADR to write, not a silent doc edit.
5. Confirm `git status` is clean or that unfinished work is clearly represented in `PROJECT_STATE.md` before ending the session.
