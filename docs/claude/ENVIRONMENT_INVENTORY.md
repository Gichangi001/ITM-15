# ITM@15 — Claude Code Environment Inventory

**Purpose:** Record of tools/capabilities actually verified in this environment before any installation decision. Runtime truth (`/skills`, `/agents`, `/mcp`, etc.) supersedes this file if it drifts — regenerate rather than hand-edit stale entries.

**Inventory date:** 2026-09-12 (19:28 UTC, updated ~19:40 UTC after foundation setup)
**Repository:** `Gichangi001/ITM-15` — local clone at `/Users/alexandergichangi/ITM-15`
**Recorded by:** Claude Code discovery/bootstrap session (no application code written this session)

---

## 1. Claude Code core

| Item | Value |
|---|---|
| Claude Code version | 2.1.270 |
| Model | Claude Sonnet 5 (`claude-sonnet-5`) |
| Auto-memory | Enabled — file-based, at `~/.claude/projects/-Users-alexandergichangi/memory/` (see §7) |
| Global theme | dark |

This session could not invoke the interactive `/skills`, `/agents`, `/hooks`, `/mcp`, `/memory`, `/permissions`, `/plugin`, `/status`, `/doctor` slash commands directly (they are meta-UI commands for the interactive CLI, not tools exposed to this session). The equivalent facts below were reconstructed from config files on disk and from the tool/skill/agent lists the harness injected into this session — this is the closest available approximation of runtime truth and should be re-verified by running those commands interactively.

## 2. Skills

Source: skill listing injected into this session (equivalent to `/skills` output) plus `~/.claude/skills/` directory listing.

**Project skills (`.claude/skills/` in this repo):** 5 of the runbook's 10 (§7) — `project-bootstrap`, `repo-docs-audit`, `docs-sync`, `memory-sync`, `security-gate` — plus 2 official third-party skills installed via `npx skills add supabase/agent-skills`: `supabase` and `supabase-postgres-best-practices` (stored at `.agents/skills/`, symlinked into `.claude/skills/`; both scanned "Safe"/low-risk by the installer's Socket/Snyk checks before accepting). The remaining 5 runbook-recommended skills — `supabase-review`, `test-gate`, `visual-qa`, `wally-qa`, `release-gate` — are deliberately **not** created yet: each reviews an artifact (a database, a test suite, a UI, Wally's runtime behaviour, a release) that doesn't exist. Add each when its phase starts, not before.

**Relevant user/global skills available now:**

| Skill | Relevance to ITM@15 |
|---|---|
| `docx` | Directly satisfies runbook §3.3 ("Word documents must be reviewed"). Used this session to confirm the `.docx` build guide exists; full local extraction not yet run against it (see DOCS_INDEX §"Whether fully read"). |
| `webapp-testing` (Playwright-based) | Can substitute for/complement a Playwright MCP connection for local UI verification (§18.3, §5.4 of runbook). |
| `web-design-guidelines` | Applicable to Phase 3+ (landing, onboarding, player shell) UI review. |
| `security-review` | General security review skill; complements the project-specific `security-gate` skill the runbook wants created. |
| `code-review` (`/code-review`, incl. `ultra`) | Applicable at every phase gate and for release-candidate review (runbook §50). |
| `simplify` | Applicable after each feature slice per runbook §25. |
| `vercel:deployments-cicd`, `vercel:status`, `vercel:env-vars`, `vercel:nextjs`, `vercel:vercel-cli` | Directly relevant — Vercel is the primary deployment target. |
| `deploy-to-vercel`, `vercel-cli-with-tokens` | Relevant once Phase 0 scaffolding exists. |
| `dataviz` | Relevant to Phase 19 (Analytics) and admin KPI widgets. |
| `artifact-design` / `artifact-diagramming` | Not applicable to production app code; only useful for internal design mockups/diagrams shared as Claude artifacts, if used. |
| `pdf` | Available if any `.pdf` product/requirements documents are added later (none found in this repo yet). |
| `audit` / `scan` / `diff` (accessibility) | Applicable from Phase 3 onward for WCAG checks (runbook §18.6). |

**Available, not applicable** (present in this account's skill roster but with no current ITM@15 use): `algorithmic-art`, `canvas-design`, `slack-gif-creator`, `hungarian-humanizer`, `bencium-aeo`, `bencium-code-conventions`, `bencium-*-designer` (Bence's personal conventions, not this project's), `insurgent-campaign`, `internal-comms`, `just-scrape`, `negentropy-lens`, `relationship-design`, `renaissance-architecture`, `pptx`, `xlsx`, `theme-factory`, `typography` (useful eventually for UI text but not a discovery-phase concern), `react-native-skills` (this is a web app, not React Native), `composition-patterns` (generic React guidance — may become relevant during Wally component work), `mcp-builder` (only relevant if ITM@15 ever ships its own MCP server), `skill-creator`, `keybindings-help`, `update-config`, `fewer-permission-prompts`, `loop`, `schedule`, `claude-in-chrome`, `run`, `init`, `writing-guidelines`, `doc-coauthoring`, `brand-guidelines` (Anthropic's own brand, not Walumo's), `human-architect-mindset`, `vanity-engineering-review` (worth revisiting at a later architecture-review milestone), `frontend-design` / `bencium-impact-designer` / `bencium-innovative-ux-designer` (candidates for Phase 3+ visual polish, but redundant with `web-design-guidelines`/`design-audit` — pick one lane later rather than stacking all).

## 2b. Project agents (`.claude/agents/`)

**Resolved this session (2026-09-13).** All 6 runbook-required project agents now exist: `architecture-reviewer`, `security-reviewer`, `database-reviewer`, `test-reviewer`, `ux-reviewer`, `wally-reviewer`. Each is scoped with `tools: Read, Grep, Glob, Bash` (read-only-oriented — none can edit files directly, matching their review-not-implement purpose) and written against this actual codebase's real history rather than generic templates. Not yet exercised on a real review — effectiveness unverified until one is actually invoked via the Agent tool.

## 3. Agents (subagent types)

Source: agent listing injected into this session (equivalent to `/agents` output).

**Project agents (`.claude/agents/`):** none exist yet. Runbook §8 requires `architecture-reviewer.md`, `security-reviewer.md`, `database-reviewer.md`, `test-reviewer.md`, `ux-reviewer.md`, `wally-reviewer.md`. **None created — deferred to Phase 0.**

**Available generic agent types:** `claude` (general default), `claude-code-guide` (Claude Code/SDK/API questions), `Explore` (read-only broad search), `general-purpose`, `Plan` (architecture/implementation planning), `statusline-setup`, plus Vercel-specialist agents: `vercel:ai-architect`, `vercel:deployment-expert`, `vercel:performance-optimizer`.

None of these are ITM@15-specific reviewers; they are reasonable stand-ins (`Plan` for architecture review, `general-purpose` for isolated security/database review with the right prompt) until the dedicated project agents are created.

## 4. Hooks

**Resolved.** `.claude/settings.json` now exists (project-scoped) with a `PreToolUse` hook on `Bash`: `.claude/hooks/check-destructive-command.sh`. It blocks (exit 2) `rm -rf` against root/home/wildcard paths, `git push --force`/`-f`, `git reset --hard`, destructive SQL (`DROP DATABASE`/`DROP SCHEMA`/`TRUNCATE`), and commands that look like they print a known secret env var name. Tested directly this session by piping sample `PreToolUse` payloads to the script (blocked all four dangerous cases, allowed a plain `git status`) — **not yet confirmed via an interactive `/hooks` check**, which the runbook (§9.5) asks for; do that next session.

This is a string-matching safety net, not the primary guardrail — the `.claude/settings.json` permission rules (§8 below) remain primary. A secret-scan pre-commit hook (runbook §9.4) is **not** added yet.

## 5. MCP servers

- **Project-scoped (`.mcp.json`):** now created via `claude mcp add --scope project`, committed with the repo (no secrets — HTTP servers are OAuth-managed, the stdio servers need no credentials):
  - `vercel` — HTTP, `https://mcp.vercel.com/`
  - `supabase` — HTTP, `https://mcp.supabase.com/mcp?features=docs,account,database,debugging,development,functions,branching`
  - `playwright` — stdio, `npx @playwright/mcp@latest`
  - `memory` — stdio, `npx -y @modelcontextprotocol/server-memory`, `MEMORY_FILE_PATH=.claude-memory/itm15-memory.jsonl` (directory `.claude-memory/backups/` created, gitignored per runbook §5.6)
  Not yet exercised through `/mcp` authentication this session (the `vercel`/`supabase` HTTP servers will prompt for auth on first use; `playwright`/`memory` need no auth, only `npx` fetching the package on first run).
- **Global (`~/.claude.json`):** `mcpServers` key is present but empty (`{}`) — unaffected; the four servers above live in the project-scoped `.mcp.json` instead.
- **Account-level connectors available to this session** (distinct from `.mcp.json`/CLI-added MCP servers — these are pre-authenticated claude.ai integrations surfaced as `mcp__claude_ai_*` / `mcp__plugin_vercel_*` tools): Supabase, Google Drive, Gmail, Google Calendar, Canva, Apollo.io, Microsoft 365, Vibe Prospecting, and a Vercel plugin-backed connector.

**Verified with a harmless read this session:**

| Server | Test | Result |
|---|---|---|
| Supabase (account connector) | `list_projects` | **Connected, authenticated.** One project exists: `soko-ai` (`eu-west-3`, healthy) — this is the unrelated Alecrim/SOKO AI project. **No Supabase project exists yet for ITM@15.** |
| Vercel | `vercel whoami` (CLI, since plugin is installed rather than exposing direct MCP tools) | **Authenticated** as `alexanderworkforceafrica-9452`. CLI v54.2.0 installed (v59.10.0 available — not urgent). |
| GitHub | `gh auth status`, `gh repo view` | **Authenticated** as `Gichangi001`, scopes `gist, read:org, repo`. Already used successfully to inspect and clone `ITM-15`. |

**Configured but not yet exercised this session:**
- Memory knowledge-graph MCP and Playwright MCP — both now defined in `.mcp.json` (see §5 above); not yet invoked/authenticated.

**Not connected:**
- Sentry — no plugin/MCP installed; not in `enabledPlugins`. Correctly deferred (Phase 20-ish).

## 6. Plugins

`~/.claude/settings.json` → `enabledPlugins`: `vercel@claude-plugins-official` (v0.49.0, user scope) — this is why the Vercel-branded skills (`vercel:*`) are available — plus **`github@claude-plugins-official`, now installed this session** (user scope) per runbook §5.1, complementing the existing `gh` CLI auth.

A second, unrelated plugin, `ecc@ecc`, is installed project-scoped to a different repo (`~/claude-skills`) and is irrelevant here.

**Sentry plugin** (§5.5) — **not installed**. Not needed until the SDK is actually integrated (Phase 20-ish).

## 7. Memory

- **Auto-memory:** active, file-based, at `~/.claude/projects/-Users-alexandergichangi/memory/`. Already contains a durable note on this project (`project_itm15_walumo.md`, indexed in `MEMORY.md`) recording the local clone path and repo purpose, written in an earlier session.
- **Knowledge-graph MCP memory** (runbook §6.3): **not connected.** No `MEMORY_FILE_PATH`-based server exists. Until it is added, durable technical facts are being tracked only in the auto-memory file above and in this document set (`docs/claude/`, `docs/PROJECT_STATE.md`). This is an accepted interim substitute, not a replacement — see §9 "Missing capabilities."
- No employee PII or secrets have been written to either memory layer. None exist yet to write.

## 8. Permissions

**Resolved.** `.claude/settings.json` (project-scoped) now defines a scoped `permissions.allow` (routine git/pnpm/gh reads and the standard verify commands), an `ask` list for explicitly risky-but-sometimes-legitimate actions (`git push --force*`, `git reset --hard*`, `vercel --prod*`/`vercel deploy --prod*`, `supabase db push*`/`db reset*`), and a minimal `deny` (`rm -rf /*`, `rm -rf ~*`). This is in addition to, not a replacement for, the destructive-command hook in §4.

The global `~/.claude/settings.local.json` allow-list (mostly artifacts of unrelated prior projects — Alecrim/SOKO AI's FastAPI+npm stack, Homebrew/pyenv setup) still applies underneath this when not overridden, since Claude Code merges scopes; the project file narrows what's auto-allowed for ITM@15-specific risky commands but doesn't retract the global grants for unrelated tools.

## 9. Runtimes / package managers

| Tool | Version | Notes |
|---|---|---|
| Node.js | v26.0.0 | Exceeds the runbook's "Node 20+" floor. |
| npm | 11.12.1 | Present. |
| corepack | **not found** | `command not found: corepack`. Node 26 no longer bundles Corepack by default (removed from core starting with recent Node majors). |
| pnpm | **not found** | Depends on corepack (or a separate global install). |
| git | present, repo initialized, clean working tree on `main`, 3 commits from GitHub web upload | — |
| gh CLI | present, authenticated | — |
| vercel CLI | v54.2.0, authenticated | — |
| Playwright | not installed in this project (no `package.json` yet); `npx playwright` would fetch on demand | — |

**Action needed before Phase 0 can follow the runbook's pnpm mandate exactly:** install Corepack explicitly (e.g. `npm install -g corepack` — Node 26 dropped the bundled binary) then `corepack enable`, or install pnpm directly. Not done this session (installing global tooling is a Phase 0 implementation action, not discovery).

## 10. Vercel / Supabase / GitHub connection status summary

| Platform | Status | ITM@15-specific resource exists? |
|---|---|---|
| GitHub | Connected, authenticated | Yes — `Gichangi001/ITM-15` |
| Vercel | CLI authenticated | **Partially** — a project named `itm-15` exists (`prj_NGrGE4LBFHh3eSx1JoXXkmqUpXRs`, created 2026-09-12, under `alexanderworkforceafrica-9452's projects`), but it is empty (Framework Preset "Other", `https://itm-15.vercel.app` → `404 NOT_FOUND`), not `vercel link`-ed to this local repo, and not confirmed Git-connected to `Gichangi001/ITM-15`. Needs explicit confirmation this is the intended project before linking (the account also has `soko-ai`, `itm-green-mobility`, `frontend`). |
| Supabase | Connector authenticated (different account than the project below) | **Yes, now exists — `ysjjgzakswaohmnaowmv`.** The user supplied its URL and keys directly. It is **not** visible via this session's Supabase connector (still only shows the unrelated `soko-ai` project under org "Soko ai"), so it lives under a different Supabase account/login than the one this session is authenticated as. `.mcp.json`'s `supabase` entry is now scoped to `project_ref=ysjjgzakswaohmnaowmv`, but needs the user to run `claude /mcp` interactively to authenticate it against the right account before any MCP tool call (including migration application) can reach this project. |

## 11. Known missing capabilities (ranked by when they'll block work)

Resolved this session: doc-location mismatch (§2 above), missing `CLAUDE.md`, missing `README.md`, missing project skills (partially — 5/10), missing MCP servers (defined, not yet auth-tested), missing GitHub plugin.

Still open:

1. **No `package.json` / Next.js app at all.** The repo is documentation-only. This is the actual Phase 0 deliverable, not a capability to install — recorded here for completeness.
2. **No pnpm/corepack.** Blocks following the runbook's package-manager mandate literally until installed (`npm install -g corepack && corepack enable`).
3. **No project hooks** (destructive-command guard, secret-scan). Currently zero automated protection against accidental `rm -rf`, force-push, or committed secrets in this repo.
4. **No project-scoped `.claude/settings.json` permissions.** ITM@15 work currently inherits an unrelated global allow-list rather than a scoped, reviewed one.
5. **No Supabase project for ITM@15.** Needed starting Phase 1. The connector works and is authenticated; only org/project creation choice is pending user confirmation (billable action — see `PROJECT_STATE.md`).
6. **Vercel project (`itm-15`) exists but is unlinked and empty.** Needs confirmation it's the intended target, then `vercel link` + Git connection.
7. **Playwright/memory MCP servers defined but not yet authenticated/exercised.** First real use will trigger `npx` package fetch (Playwright, memory) — no blocking issue expected, just not yet verified end-to-end.
8. **No Sentry integration** — correctly deferred; not needed until Phase 20-ish per runbook.
9. **`.docx` build guide has not been independently text-extracted this session** to confirm it doesn't contain a newer approved requirement than the companion `.md`. Sizes/commit are identical (same upload commit `e351744`), so divergence is unlikely, but per runbook §1.1(5) and §3.3 this should be done with a local extractor (via the `docx` skill, or the new `repo-docs-audit` project skill) before treating any Word-only content as settled.
10. **5 of 10 project skills and 0 of 6 project agents remain uncreated**, deliberately — see §2/§3 above for which and why.
