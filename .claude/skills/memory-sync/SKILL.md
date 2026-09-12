---
name: memory-sync
description: Reconciles Claude Code memory (auto-memory and the project knowledge-graph MCP) with git/repository truth for ITM@15. Use at session start to retrieve relevant state, and after a meaningful durable outcome to record it.
---

# ITM@15 Memory Sync

Purpose (per `ITM15_MASTER_BUILD_RUNBOOK.md` §6): three memory layers, each with a different job — `CLAUDE.md` (stable rules), auto-memory (durable technical notes), the `memory` MCP knowledge graph (durable relationships/state). This skill keeps layers B and C honest against the repository.

## At session start

1. Identify the current phase/task from `docs/PROJECT_STATE.md`.
2. Query the `memory` MCP server (if connected — check `/mcp`) for the project entity, current component and current phase. Read only relevant nodes/relations, not the whole graph.
3. Compare remembered state to git/repository truth (`git log`, `docs/PROJECT_STATE.md`, `docs/QUALITY_STATUS.md`). If memory conflicts with git, git and committed docs win — correct the graph.

## After a meaningful durable outcome

Update graph memory only for: phase completed, architecture decision approved, security finding resolved, new dependency adopted, migration introduced, major bug root cause discovered, release completed, rollback decision made. Do not store every small edit.

Observations must be atomic and factual, e.g. `Phase_02 observation: "Invite-only authentication implemented on commit abc123."`

## Hard rules

- Never store secrets, API keys, passwords, employee emails, private votes, or production data in either memory layer.
- Use synthetic test identities (e.g. "Amina Kenya", "Test Admin") for any example data that ends up in memory.
- Before major memory maintenance, back up `.claude-memory/itm15-memory.jsonl` to `.claude-memory/backups/` with a timestamp (see `.claude/scripts/backup-graph-memory.sh` if present); do nothing if the source file doesn't exist yet.
- If the `memory` MCP server is not connected, use Claude Code's file-based auto-memory as the interim durable-state layer instead of skipping this step — record the same atomic, factual observations there.
