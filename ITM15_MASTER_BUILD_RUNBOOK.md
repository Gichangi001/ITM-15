# ITM@15 — MASTER BUILD & CLAUDE CODE EXECUTION RUNBOOK
## Start-to-Finish Instructions for Building, Testing, Securing and Launching the Walumo Wally Takeover

**Repository:** `ITM@15`  
**File purpose:** This is the execution and orchestration guide for Claude Code. It tells Claude Code how to inspect the existing repository, discover its available skills and tools, connect the development stack, build the product in the correct order, test it, update memory, document decisions, and release safely.  
**Companion specifications:** `docs/PRODUCT_GUIDE.md`, `docs/WALLY.md`, and any existing Word product guide(s) committed to the repository.  
**Product owner:** Walumo  
**Primary deployment:** Vercel  
**Primary data platform:** Supabase  
**Primary source control:** GitHub  
**Primary coding agent:** Claude Code  
**Status:** Required execution specification  
**Version:** 1.0  

---

# 0. THE ONE RULE CLAUDE MUST NEVER BREAK

Do not start coding because a prompt says “build the app.”

Claude Code must first understand the repository, the product guides, the current implementation state, the available tools, the available skills, the security boundaries and the current build/test status.

The required operating loop is:

```text
DISCOVER
  ↓
READ
  ↓
UNDERSTAND
  ↓
PLAN
  ↓
BUILD ONE COMPLETE SLICE
  ↓
TEST
  ↓
SECURITY CHECK
  ↓
VISUAL / UX CHECK
  ↓
UPDATE DOCUMENTATION
  ↓
UPDATE PROJECT MEMORY
  ↓
COMMIT
  ↓
MOVE TO NEXT SLICE
```

Claude must not jump directly to 3D Wally, cinematic effects or production deployment before the foundations pass their gates.

---

# 1. DOCUMENT AUTHORITY AND HOW TO READ THE REPOSITORY

The repository contains multiple documents serving different purposes. Claude must not flatten them into one undifferentiated prompt.

## 1.1 Authority model

Use this authority order when making decisions:

1. **Security and privacy rules** always win over convenience, visuals and speed.
2. `docs/PRODUCT_GUIDE.md` is authoritative for product requirements, architecture, roles, permissions, game rules, phases and acceptance criteria.
3. `docs/WALLY.md` is authoritative for Wally-specific behaviour, animation, events, rendering tiers, realtime integration, dialogue and Wally Mission Control.
4. This file, `ITM15_MASTER_BUILD_RUNBOOK.md`, is authoritative for the development process, tool setup, skills, memory, testing gates, Git workflow and release workflow.
5. Word documents in the repository are supporting human-readable source material. They must be reviewed, but when they duplicate an updated Markdown specification, the Markdown specification is the implementation source of truth unless the Word document contains a clearly newer approved requirement.
6. Existing code does not overrule the specifications merely because it already exists. Refactor safely where required.

## 1.2 Required reading order at the beginning of a new build session

Claude must inspect the repository and then read, in order:

```text
1. CLAUDE.md
2. ITM15_MASTER_BUILD_RUNBOOK.md
3. docs/PRODUCT_GUIDE.md
4. docs/WALLY.md
5. docs/claude/DOCS_INDEX.md, if it exists
6. docs/claude/PROJECT_STATE.md, if it exists
7. relevant ADRs under docs/adr/
8. current package.json and lockfile
9. current database migrations
10. current CI configuration
11. current git status and recent commits
```

Then review any `.docx` product/requirements documents that have not already been indexed or whose hash has changed.

## 1.3 Never claim a file was read unless it was actually opened

Before making a statement about a repository file, open it.

Before changing a feature, inspect the current implementation and its tests.

Before creating a new abstraction, search for an existing one.

Before adding a new dependency, inspect whether the capability already exists.

---

# 2. FIRST SESSION: ENVIRONMENT DISCOVERY BEFORE ANY CODE

The first Claude Code session in `ITM@15` must be a discovery/bootstrap session.

Do not begin application implementation until this section is complete.

## 2.1 Verify the local environment

Run and record the results of:

```bash
pwd
git status
git remote -v
git branch --show-current
git log --oneline -10
node --version
corepack --version || true
pnpm --version || true
claude --version
claude doctor
```

If `pnpm` is not available, enable it through Corepack rather than silently switching package managers:

```bash
corepack enable
```

Use Node 20 or newer for this project unless the actual repository already contains a stricter supported version.

## 2.2 Claude Code capability inventory

Inside Claude Code, run these commands before deciding what extensions to add:

```text
/status
/skills
/agents
/hooks
/mcp
/memory
/permissions
/plugin
/doctor
```

Create or update:

```text
docs/claude/ENVIRONMENT_INVENTORY.md
```

The inventory must record:

```text
Claude Code version
Current model
Installed project skills
Installed user skills relevant to this repo
Bundled skills visible in this Claude Code version
Configured subagents
Active hooks
Connected MCP servers
Installed plugins
Permission rules
Auto-memory status
Node version
pnpm version
Git branch
GitHub remote
Vercel connection status
Supabase connection status
Known missing capabilities
Date/time of inventory
```

Do not hard-code assumptions about which built-in skills exist. `/skills` is the runtime source of truth.

## 2.3 Skill usage rule

The instruction “use all skills” means:

> Inventory every available skill and intentionally use every **relevant** skill that improves the task.

It does **not** mean calling unrelated skills for no reason.

For example, if the current Claude Code installation includes `/simplify`, use it after a meaningful feature slice to review unnecessary complexity. If `/debug` is available, use it when a failing build or test is not immediately obvious. If `/batch` is available, use it only for genuinely independent repetitive work. If a skill is irrelevant to the project, record it as “available, not applicable” rather than invoking it pointlessly.

---

# 3. REPOSITORY DOCUMENT AUDIT

Before implementation, Claude must discover the actual files in the repository rather than assuming their locations.

## 3.1 Inventory documentation

Search for:

```bash
find . -type f \( -iname '*.md' -o -iname '*.mdx' -o -iname '*.docx' -o -iname '*.pdf' \) \
  -not -path './node_modules/*' \
  -not -path './.next/*' \
  -not -path './.git/*' | sort
```

Also inspect:

```text
README files
package.json
pnpm-lock.yaml
tsconfig.json
next.config.*
.env.example
.mcp.json
.claude/**
.github/**
vercel.json
supabase/**
tests/**
playwright.config.*
```

## 3.2 Build a documentation index

Create:

```text
docs/claude/DOCS_INDEX.md
```

For every important document record:

```text
Path
Type
Purpose
Authority level
Last modified git commit
SHA/hash
Key requirements
Whether it has been fully read
Whether another document supersedes it
```

## 3.3 Word documents must be reviewed, not ignored

Claude Code does not assume it has a built-in Word-document skill.

First check `/skills` for a trustworthy installed document-reading capability.

If one exists, use it.

If one does not exist, create the project skill described later in this runbook named `repo-docs-audit`, backed by a local extraction script that reads `.docx` content without uploading the document to a third party.

For `.docx`, extract text locally from the OOXML package. Prefer a small deterministic script over adding a large dependency solely to read requirements.

Store extracted temporary text under:

```text
.tmp/docs/
```

and keep `.tmp/` gitignored.

Do not treat temporary extracted text as a new authoritative document.

## 3.4 Conflict handling

When two documents conflict:

1. identify the exact conflict;
2. apply the authority model in Section 1;
3. do not silently merge incompatible requirements;
4. record the resolved decision in `docs/adr/` if architectural or security-relevant;
5. update project memory with the final decision;
6. if the conflict cannot be resolved from the documents, stop that specific implementation slice and surface the conflict clearly instead of guessing.

---

# 4. CLAUDE.MD MUST BECOME THE SHORT CONTROL PLANE

Do not put this whole runbook into `CLAUDE.md`.

Keep `CLAUDE.md` concise so Claude follows it reliably.

It should point to the longer specifications and define the non-negotiable loop.

Recommended repository `CLAUDE.md`:

```markdown
# ITM@15 Claude Code Instructions

You are building the Walumo ITM@15 Wally Takeover.

Before architectural or feature work, read:
- @ITM15_MASTER_BUILD_RUNBOOK.md
- @docs/PRODUCT_GUIDE.md
- @docs/WALLY.md

For current implementation state also read:
- @docs/claude/PROJECT_STATE.md
- @docs/claude/DOCS_INDEX.md

## Non-negotiables
- Investigate before editing. Never speculate about code you have not opened.
- Follow PRODUCT_GUIDE phases in order unless an earlier phase is already proven complete.
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
Use pnpm. Do not switch package managers.

## Required quality gate
Run the repository `pnpm verify` command before declaring a slice complete.

## Memory
At session start, retrieve relevant project memory. At meaningful milestones, update project state and memory. Memory is for durable technical knowledge, never secrets.
```

If the repository already has a `CLAUDE.md`, improve it rather than blindly overwriting it.

---

# 5. CONNECT THE DEVELOPMENT TOOLCHAIN

Do this only after the capability inventory so duplicate connections are not created.

Use project scope for integrations that should travel with `ITM@15`. Use local/user scope for credentials or personal-only tools.

## 5.1 GitHub

If the GitHub integration is not already installed, prefer the official Claude Code GitHub plugin:

```text
/plugin install github@claude-plugins-official
```

Then verify through `/plugin` and `/mcp` if it exposes an MCP connection.

Also verify local GitHub authentication:

```bash
gh auth status
```

GitHub is used for:

```text
repository inspection
branches
pull requests
issues
CI results
commit history
code review
release traceability
```

Do not grant broader GitHub permissions than required.

## 5.2 Vercel

Connect Vercel's official MCP server if not already connected:

```bash
claude mcp add --scope project --transport http vercel https://mcp.vercel.com/
```

Authenticate through `/mcp` if prompted.

Use Vercel tools for:

```text
project discovery
preview deployment inspection
production deployment inspection
build/deployment logs
environment configuration verification
```

Never echo environment secret values into chat or committed files.

## 5.3 Supabase

Connect the official Supabase MCP server.

Prefer a project-scoped URL generated for the actual Supabase project. During initial setup, the generic official connection may be added and then scoped correctly after the project exists.

Example project configuration command:

```bash
claude mcp add --scope project --transport http supabase \
  "https://mcp.supabase.com/mcp?features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching"
```

Then authenticate with `/mcp`.

Security rules:

```text
Development/staging may have approved write access.
Production MCP defaults to read-only when practical.
Never connect an unrestricted production database before RLS/security review.
Never run destructive SQL against production through an agent without explicit human approval.
All schema changes belong in committed migrations even when an MCP tool helped create them.
```

## 5.4 Playwright browser automation

Connect Playwright MCP for UI inspection and realistic browser testing if not already available:

```bash
claude mcp add --scope project playwright -- npx @playwright/mcp@latest
```

Use Playwright MCP for:

```text
landing page walkthrough
login flow
first-password-change flow
mobile viewport checks
admin Mission Control
mission creation
realtime gameplay tests
photo moderation flow
voting flow
Wally interaction checks
accessibility-oriented snapshots
cross-browser smoke testing where available
```

Do not rely only on screenshots; also keep deterministic Playwright test files under `tests/e2e/`.

## 5.5 Sentry

If Sentry is part of the product stack and its official plugin is not already present:

```text
/plugin install sentry@claude-plugins-official
```

Verify it in `/plugin`.

Use Sentry for runtime diagnostics after the SDK is integrated. Do not treat Sentry as a replacement for local tests.

## 5.6 Memory knowledge graph

Use Claude Code auto-memory **and** a separate project knowledge graph.

The graph must store technical project knowledge only.

Create a local directory:

```bash
mkdir -p .claude-memory/backups
```

Add this to `.gitignore`:

```gitignore
.claude-memory/
```

Add the MCP memory reference server with a project-specific file:

```bash
claude mcp add --scope project \
  --env MEMORY_FILE_PATH=.claude-memory/itm15-memory.jsonl \
  --transport stdio memory \
  -- npx -y @modelcontextprotocol/server-memory
```

If the server requires an absolute path on the machine, update `MEMORY_FILE_PATH` locally and do not commit machine-specific paths.

Important: the MCP memory server is a reference implementation, not the production datastore for the ITM@15 application. Never use it to store employee data, passwords, access tokens, Supabase keys, email lists, votes, production data or anything regulated.

## 5.7 Optional additional MCP/skills

Do not install random third-party plugins merely because they exist.

Before adding any new plugin, skill or MCP server:

```text
identify the missing capability
check whether Claude already has it
prefer Anthropic official or first-party vendor integrations
verify repository/source ownership
review requested permissions
record why it was installed in ENVIRONMENT_INVENTORY.md
```

---

# 6. MEMORY STRATEGY — THREE LAYERS, EACH WITH A DIFFERENT JOB

Memory must help Claude become more consistent without allowing hidden project state to become unreviewable.

## 6.1 Layer A — CLAUDE.md

Purpose:

```text
stable team instructions
architecture boundaries
quality commands
security rules
workflow expectations
```

Human-maintained and committed.

## 6.2 Layer B — Claude Code auto-memory

Verify with:

```text
/memory
```

Keep auto-memory enabled unless the user intentionally disables it.

Good auto-memory examples:

```text
pnpm is the package manager
Supabase migrations require local reset before merge
Wally renderer has High/Standard/Lite/Reduced Motion tiers
a specific browser test requires a seeded test campaign
```

Bad auto-memory examples:

```text
passwords
API keys
employee emails
private votes
production tokens
full customer datasets
```

## 6.3 Layer C — Knowledge graph MCP memory

Use the graph for durable relationships and implementation state.

Initial graph entities should include:

```text
ITM15_Project              type=project
Product_Guide              type=specification
Wally_Spec                 type=specification
Master_Runbook             type=specification
Phase_00 ... Phase_21      type=build_phase
Auth_System                type=component
Admin_Mission_Control      type=component
Game_Engine                type=component
Realtime_Engine            type=component
Scoring_Ledger             type=component
Voting_Engine              type=component
Media_Moderation           type=component
Wally_Engine               type=component
Email_Reminders            type=component
Analytics                  type=component
Vercel                     type=platform
Supabase                   type=platform
GitHub                     type=platform
```

Useful relation types:

```text
specified_by
depends_on
implemented_in
blocked_by
verified_by
supersedes
uses
protected_by
deployed_to
owned_by
completed_before
```

Observations must be atomic and factual, for example:

```text
Phase_02 observation: "Invite-only authentication implemented on commit abc123."
Auth_System observation: "must_change_password gate is enforced server-side."
Wally_Engine observation: "2D fallback passes reduced-motion E2E test."
```

## 6.4 Memory retrieval rule

At session start:

1. identify the current phase/task;
2. search memory for the project, current component and current phase;
3. read only relevant nodes/relations instead of dumping the entire graph unnecessarily;
4. compare remembered state to git/repository truth;
5. if memory conflicts with git, git and committed docs win and memory must be corrected.

## 6.5 Memory update rule

Update graph memory only after meaningful durable outcomes such as:

```text
phase completed
architecture decision approved
security finding resolved
new dependency adopted
migration introduced
major bug root cause discovered
release completed
rollback decision made
```

Do not store every tiny edit.

## 6.6 Memory backup

Because graph memory is local project assistance, create a small backup script:

```text
.claude/scripts/backup-graph-memory.sh
```

It should:

```text
copy .claude-memory/itm15-memory.jsonl to .claude-memory/backups/
include timestamp in filename
keep a limited rolling history
never commit backups
silently do nothing if the source does not exist yet
```

Run the backup before major memory maintenance and at least once per meaningful development session.

---

# 7. CREATE PROJECT-SPECIFIC CLAUDE SKILLS

Do not overload `CLAUDE.md` with long procedures. Procedures belong in skills.

Create skills under:

```text
.claude/skills/<skill-name>/SKILL.md
```

Before creating a skill, check `/skills` to ensure an equivalent does not already exist.

## 7.1 Required project skills

### `repo-docs-audit`

Purpose:

```text
inventory Markdown and Word requirements
extract changed DOCX text locally
build/update DOCS_INDEX.md
flag conflicts
never invent missing requirements
```

### `project-bootstrap`

Purpose:

```text
perform environment inventory
verify required docs
verify package manager
verify tool/MCP connections
verify git branch/status
create missing project control files
```

### `memory-sync`

Purpose:

```text
read relevant auto-memory/graph state before work
reconcile memory with git truth
update durable graph observations/relations after verified work
update PROJECT_STATE.md
never store secrets or PII
```

### `security-gate`

Purpose:

```text
review changed authorization paths
review Supabase RLS
review service-role usage
review uploads
review admin actions/audit logging
review realtime channel privacy
review score/vote integrity
review secret exposure
review dependencies
return BLOCK/PASS with findings
```

Prefer `context: fork` so the security review runs in isolated context.

### `supabase-review`

Purpose:

```text
review migrations
review RLS policies
review indexes/constraints
review auth ownership
review storage policies
run local database tests
check Supabase security advisors when connected
```

### `test-gate`

Purpose:

```text
run formatting/lint/typecheck/unit/integration/E2E/build checks appropriate to changed files
summarize failures
never mark a gate green because tests were skipped
```

### `visual-qa`

Purpose:

```text
use Playwright/browser tooling
check desktop/mobile layouts
check empty/loading/error states
check Wally obstruction
check reduced motion
check obvious accessibility problems
capture reproducible issues
```

### `wally-qa`

Purpose:

```text
verify WALLY.md contract
verify event authority
verify priority/cooldown behaviour
verify target audience
verify 3D/2D/reduced-motion fallbacks
verify Wally never fabricates server state
```

### `docs-sync`

Purpose:

```text
update PROJECT_STATE.md
update relevant docs/ADRs
update acceptance status
keep docs aligned with implementation
avoid rewriting approved product requirements unless explicitly changed
```

### `release-gate`

Purpose:

```text
verify clean git tree
verify CI
verify migrations
verify preview deployment
verify E2E smoke
verify environment variables by presence, never value
verify rollback path
verify release checklist
block production if any critical gate fails
```

## 7.2 Skill frontmatter pattern

Use concise descriptions so Claude knows when to invoke the skill.

Example:

```markdown
---
name: security-gate
description: Security and authorization review for ITM@15. Use before merging changes involving auth, Supabase, RLS, admin actions, scores, votes, uploads, realtime channels, secrets or production release.
context: fork
---

# ITM@15 Security Gate

Read the relevant specifications and changed files. Review only grounded code. Return PASS or BLOCK with evidence and required fixes. Never expose secret values.
```

Use `disable-model-invocation: true` for destructive or release skills that should only run explicitly.

---

# 8. CREATE PROJECT-SPECIFIC SUBAGENTS

Skills describe repeatable workflows. Subagents provide isolated expert review.

Create project agents under:

```text
.claude/agents/
```

Required agents:

```text
architecture-reviewer.md
security-reviewer.md
database-reviewer.md
test-reviewer.md
ux-reviewer.md
wally-reviewer.md
```

Use subagents when the review would generate a lot of logs or benefit from isolated context.

Do not spawn subagents for trivial single-file edits.

Do not let two agents edit the same files in parallel unless worktrees clearly isolate their changes.

---

# 9. CLAUDE CODE PERMISSIONS AND HOOKS

`CLAUDE.md` is guidance. Permissions and hooks enforce hard boundaries.

## 9.1 Permission philosophy

Allow routine safe commands.

Ask for sensitive actions.

Deny clearly dangerous patterns.

Never use `--dangerously-skip-permissions` for ordinary project development.

Do not give a broad `Bash(*)` allow rule.

## 9.2 Suggested safe routine commands

After verifying exact repository scripts, allow common read/verification actions such as:

```text
git status
git diff
git log
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm verify
```

Do not automatically allow deployment, database destructive actions or force pushes.

## 9.3 PreToolUse safety hook

Create:

```text
.claude/hooks/check-destructive-command.sh
```

It should inspect Bash commands and block obvious destructive operations such as:

```text
rm -rf on repository/root paths
git push --force / --force-with-lease unless explicitly approved
git reset --hard when uncommitted work exists
DROP DATABASE
DROP SCHEMA
production database reset
destructive Supabase production operations
printing known secret environment variables
```

Use a `PreToolUse` hook in `.claude/settings.json` for Bash.

Do not rely on string matching as the only security layer. Permissions remain the primary guardrail.

## 9.4 Secret protection hook

Before git commits, run a secret scan.

Use a tool already available in the environment if trusted. If none exists, use a simple local scanner plus GitHub secret scanning where available.

At minimum detect accidental commits of:

```text
.env
.env.local
service role keys
Resend API keys
Sentry auth tokens
Vercel tokens
private key files
OAuth client secrets
```

## 9.5 Hooks must be discoverable

After creating hooks, run:

```text
/hooks
```

and verify they are active.

---

# 10. PROJECT STATE FILES CLAUDE MUST MAINTAIN

Create:

```text
docs/claude/ENVIRONMENT_INVENTORY.md
docs/claude/DOCS_INDEX.md
docs/claude/PROJECT_STATE.md
docs/claude/QUALITY_STATUS.md
docs/adr/
```

## 10.1 `PROJECT_STATE.md`

Keep this concise and factual.

Structure:

```markdown
# ITM@15 Project State

## Current phase
Phase X — ...

## Last verified commit
<sha>

## Completed
...

## In progress
...

## Blockers
...

## Current architecture decisions
...

## Next smallest complete slice
...

## Required verification before next phase
...
```

Update it after every meaningful completed slice.

## 10.2 `QUALITY_STATUS.md`

Track the last known result of:

```text
lint
typecheck
unit tests
integration tests
RLS/database tests
E2E tests
build
visual QA
security gate
preview deployment
load test
```

Include commit SHA and date.

Never claim a check is green based on a prior commit after relevant code changed.

---

# 11. BRANCHING AND GIT WORKFLOW

Never implement substantial features directly on `main` unless the repository owner explicitly chooses trunk-only development.

Recommended:

```text
main                 production-ready
feature/<name>       normal feature work
fix/<name>           bug fixes
chore/<name>         tooling/configuration
docs/<name>          documentation-only work
```

If a `develop` branch already exists and is intentionally used, respect the existing workflow rather than inventing a second model.

Before work:

```bash
git status
git pull --ff-only
```

Create a focused branch.

After each complete slice:

```bash
pnpm verify
git diff --check
git status
```

Use conventional commits, for example:

```text
feat(auth): enforce first-login password change
feat(admin): add realtime mission control dashboard
feat(game): add authoritative score ledger
feat(wally): handle targeted realtime celebration events
fix(voting): enforce one vote per eligible player
test(e2e): cover cross-country photo challenge
docs(runbook): record release gate
```

Do not combine unrelated features into one giant commit.

---

# 12. INITIAL APPLICATION FOUNDATION

If the repository currently only contains documents, bootstrap the application without deleting those documents.

## 12.1 Initialize Next.js

Use the current stable Next.js and TypeScript with App Router.

Use `pnpm`.

Do not create a second nested git repository.

Before initializing, inspect whether `package.json` already exists.

## 12.2 Minimum project dependencies

The product guide controls the stack. Expected categories include:

```text
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui or equivalent agreed UI primitives
Supabase JS/SSR libraries
Zod
React Hook Form
Zustand where justified
Motion/Framer Motion
GSAP where justified
Three.js
React Three Fiber
Drei
Sentry
React Email / Resend
Playwright
unit test framework such as Vitest
```

Do not add every dependency on day one if it is not yet used.

Add dependencies when the corresponding phase starts.

## 12.3 Required package scripts

Create a stable verification interface so Claude does not invent new commands each session.

Target scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint || eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "verify": "pnpm lint && pnpm typecheck && pnpm test && pnpm build"
  }
}
```

Adjust commands for the actual Next.js version rather than preserving obsolete CLI syntax.

Later, once E2E setup is stable, add a stricter CI/release verification command such as `verify:full` that includes E2E and database checks.

---

# 13. ENVIRONMENT VARIABLES AND SECRET DISCIPLINE

Create `.env.example` containing names only, never secret values.

Expected categories:

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or current client key equivalent)
SUPABASE_SERVICE_ROLE_KEY (server only)
RESEND_API_KEY (server only)
EMAIL_FROM
SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN as required
SENTRY_AUTH_TOKEN only where required for build tooling
CRON_SECRET
```

Rules:

```text
Never commit .env.local.
Never print secret values to the terminal transcript unnecessarily.
Never place SUPABASE_SERVICE_ROLE_KEY in NEXT_PUBLIC_*.
Never send secret values through Wally events.
Never store secrets in graph memory or auto-memory.
Use Vercel encrypted environment variables for deployed environments.
Separate Preview and Production values.
```

Create server-side environment validation with Zod.

Fail fast on missing required server configuration.

---

# 14. GITHUB ACTIONS / CI

Set up CI early, not at the end.

On every pull request, run at minimum:

```text
install with frozen lockfile
lint
typecheck
unit tests
build
```

As the project matures, add:

```text
Supabase migration/database tests
Playwright E2E against preview or local stack
secret scanning
dependency audit
```

Do not merge when required CI is red.

If branch protection is available, require CI checks before merge.

---

# 15. SUPABASE DEVELOPMENT WORKFLOW

Database design starts in Phase 1, not after the UI exists.

## 15.1 Local-first migrations

Install/configure Supabase CLI and use committed migrations.

Workflow:

```text
create migration
apply locally
seed safe test data
run database/RLS tests
regenerate types
run application tests
commit migration + types + tests together
```

No manual production-only schema changes.

## 15.2 RLS first

Every player/private table starts with an explicit RLS decision.

Never defer RLS until launch.

Required high-risk areas:

```text
profiles
roles
admin access
votes
score_events
private submissions
media uploads
moderation
notifications
realtime private channels
wally events with audience targeting
```

## 15.3 Production safety

Before any production migration:

```text
migration has run successfully in local/staging
rollback or forward-fix plan exists
backup posture is known
security-gate is PASS
CI is green
human approves production application
```

---

# 16. THE PHASE EXECUTION ALGORITHM

For every Product Guide phase, Claude follows the same algorithm.

## 16.1 Before coding

```text
Read phase requirements and acceptance criteria.
Read relevant WALLY.md sections if Wally is involved.
Search current code.
Retrieve relevant memory graph state.
Check current PROJECT_STATE.md.
List files/migrations likely to change.
Identify authority boundaries.
Identify security risks.
Identify tests required to prove completion.
```

## 16.2 During coding

```text
Implement the smallest complete vertical slice.
Prefer existing patterns.
Validate inputs with schemas.
Keep business authority server-side.
Add migrations/RLS with the feature.
Add tests with the feature.
Keep mobile behaviour in scope.
Do not add visual polish that hides an incomplete core workflow.
```

## 16.3 After coding

```text
Run focused tests first.
Run lint.
Run typecheck.
Run unit/integration tests.
Run relevant E2E.
Run build.
Run security-gate when relevant.
Run visual-qa when user-facing.
Use /simplify if available and appropriate.
Inspect git diff.
Update docs/state.
Update memory graph.
Commit.
```

## 16.4 Definition of done

A phase is not done because the UI exists.

A phase is done only when:

```text
implementation works
server/data authority is correct
migration/RLS is committed when applicable
tests prove critical behaviour
build passes
mobile state works
failure states exist
security review passes
acceptance criteria pass
project state is updated
memory is reconciled
commit is created
```

---

# 17. PHASE-BY-PHASE BUILD ORDER

The detailed product requirements remain in `docs/PRODUCT_GUIDE.md`. This section defines how the tools/skills are applied to each phase.

## Phase 0 — Repository and quality foundation

Use:

```text
project-bootstrap
repo-docs-audit
GitHub
Vercel
memory-sync
```

Deliver:

```text
repo understood
Next.js foundation
pnpm lockfile
TypeScript
lint/typecheck/test/build commands
CI
Vercel Preview
CLAUDE.md
project skills
project agents
hooks/permissions
DOCS_INDEX
PROJECT_STATE
QUALITY_STATUS
memory graph initialized
```

Gate: a clean preview deployment with no secrets committed.

## Phase 1 — Supabase foundation

Use:

```text
Supabase MCP
supabase-review
security-gate
memory-sync
```

Deliver database migrations, initial RLS, typed helpers, countries/entities/roles/campaigns/audit model.

Gate: fresh local database rebuild works and anonymous access cannot read private player data.

## Phase 2 — Invite-only authentication

Use:

```text
security-gate
Playwright
visual-qa
test-gate
```

Implement approved-email admin creation, temporary `Walumo` first-login credential, mandatory private password change and role-aware redirects.

`Walumo` is never a permanent shared password.

Gate: unknown email cannot self-register; admin routes reject normal players.

## Phase 3 — Landing and onboarding

Use:

```text
visual-qa
Playwright
wally-qa (teaser only)
```

Gate: mobile first load is polished, onboarding cannot be bypassed and profile values persist correctly.

## Phase 4 — Player shell

Use visual QA and accessibility checks.

Gate: player routes are navigable and admin controls do not leak.

## Phase 5 — Admin Mission Control shell

Use:

```text
security-gate
visual-qa
Playwright
```

Gate: role-based dashboard loads, live KPI architecture is ready, account state is visible.

## Phase 6 — Content engine

Use:

```text
supabase-review
security-gate
test-gate
```

Gate: admin can create/edit/draft/preview/publish content without code deployment.

## Phase 7 — Submission engine

Use integration/E2E tests.

Gate: deadline and attempt rules are server-authoritative.

## Phase 8 — Authoritative scoring and leaderboards

Use security reviewer heavily.

Gate: browser cannot award itself points; every score comes from traceable `score_events`.

## Phase 9 — Voting and nominations

Use security gate and database constraints.

Gate: duplicate/invalid/self votes follow configured rules at server/database level, not only UI.

## Phase 10 — Media uploads and moderation

Use Supabase storage review, security gate and Playwright.

Gate: unapproved media never appears on public/event surfaces.

## Phase 11 — Realtime engine

Use two-browser Playwright tests and Supabase review.

Gate: targeted realtime events arrive without refresh and private channels do not leak audiences.

## Phase 12 — Admin notifications/live controls

Use Wally QA + security gate + realtime E2E.

Gate: player-specific message reaches only the target; global event reaches all eligible connected users.

## Phase 13 — Wally 2D behaviour prototype

Read all relevant `docs/WALLY.md` sections before editing.

Use:

```text
wally-qa
visual-qa
test-gate
```

Gate: Wally reacts correctly to server-approved events without inventing values.

## Phase 14 — Wally 3D

Use performance instrumentation and fallback testing.

Gate: High/Standard/Lite/Reduced Motion are usable; 3D never blocks gameplay.

## Phase 15 — Themes and cinematic scenes

Gate: theme is data/admin-driven and connected users can receive approved live theme changes.

## Phase 16 — Email automation

Use Resend in server-only code.

Gate: daily Wally reminder includes correct game link, respects campaign/user status and logs delivery outcome without leaking recipient lists into public logs.

## Phase 17 — Achievements/passport

Gate: stamps/achievements arise from validated events, not browser claims.

## Phase 18 — Spectator screen

Use Playwright on large viewport and remote control E2E.

Gate: screen can run unattended and responds to admin selection.

## Phase 19 — Analytics

Gate: admin can answer login, completion, participation and engagement questions from real captured events.

## Phase 20 — Security/performance/load

Use:

```text
security-gate
supabase-review
test-gate
visual-qa
Sentry
load testing tool selected during inventory
```

Gate: no unresolved critical auth/privacy/scoring/voting issue; reconnect and modest-phone modes work.

## Phase 21 — Day Zero rehearsal

Execute the exact end-to-end scenario from `PRODUCT_GUIDE.md`.

Do it with realistic seeded users in at least two countries.

Do not launch the real campaign until Day Zero passes repeatedly.

---

# 18. TEST STRATEGY

Testing is layered. A green unit suite cannot prove the product works live.

## 18.1 Unit tests

Use for deterministic logic:

```text
score calculations
eligibility rules
Wally event priority
Wally dialogue variable resolution
challenge validation
achievement rules
theme resolver
audience targeting helpers
```

## 18.2 Integration tests

Use for:

```text
server actions
Supabase queries
RLS scenarios
storage permissions
vote uniqueness
score ledger writes
audit logging
```

## 18.3 E2E tests

Use Playwright for critical user journeys.

Minimum permanent E2E set:

```text
employee first login
forced password change
onboarding
admin creates/publishes mission
player completes text mission
voting eligibility
photo upload → moderation → approval
score update
leaderboard refresh
private notification targeting
Wally realtime event
Lite/reduced-motion Wally fallback
spectator screen reveal
Day Zero cross-country challenge
```

## 18.4 Two-session realtime tests

Realtime must be tested with at least two independent browser contexts.

Examples:

```text
Admin + Player
Player A + Player B
Moderator + Player
Event Screen + Admin
```

## 18.5 Visual QA

For each major player/admin surface check:

```text
mobile width
small laptop
desktop
loading
empty
error
long names
long translated text
reduced motion
slow/failed image
Wally visible but not obstructive
```

## 18.6 Accessibility

At minimum:

```text
keyboard-accessible critical flows
labels for form controls
visible focus
sufficient contrast
semantic buttons/links
reduced-motion support
non-visual alternative to Wally-only instructions
alt text or intentionally decorative images
```

## 18.7 Performance

Track:

```text
initial JS size
3D asset sizes
image optimization
mobile FPS in 3D scenes
route loading time
realtime reconnect
memory growth during long event-screen sessions
```

Do not load all seven days' heavy 3D assets on initial login.

---

# 19. SECURITY REVIEW CHECKLIST

Every high-risk change runs `security-gate` before merge.

Check:

```text
Authentication: can an uninvited user enter?
Authorization: can a player reach admin server actions?
RLS: can one player read another player's private data?
Scoring: can browser input increase score without server validation?
Voting: can votes be duplicated or forged?
Uploads: can arbitrary executable content be served?
Moderation: can unapproved images reach public surfaces?
Realtime: can users subscribe to audiences they do not belong to?
Admin actions: are high-impact actions audited?
Secrets: are service credentials server-only?
Logs: do logs leak PII/tokens?
Email: is recipient data protected?
Password flow: is `Walumo` temporary and replaced at first login?
Rate limits: can mission/vote/upload endpoints be abused?
Dependencies: any known critical vulnerability?
```

Any critical finding means BLOCK.

---

# 20. WALLY QUALITY RULES DURING BUILD

Wally is a subsystem of the game, not an independent toy.

Before every Wally feature:

```text
identify the server-approved source event
identify audience
identify priority
identify animation
identify fallback behaviour
identify accessible text equivalent
identify admin/audit implications
```

Wally may personalize using approved player state such as first name/country/squad.

Wally may never expose:

```text
private votes
another player's private data
hidden admin data
secrets
fabricated score/rank
unmoderated content
```

Every Wally action that matters to gameplay must still work when 3D is disabled.

---

# 21. REALTIME DESIGN RULE

Realtime is presentation/coordination, not authority.

The database/server decides whether an event is valid.

Realtime tells connected clients what changed.

A client that misses a realtime event must recover correct state by refetching canonical server state.

Never design a score, vote or mission completion that only exists in an ephemeral realtime message.

---

# 22. EMAIL AND REMINDER LOOP

Once an employee account is added:

```text
welcome/first-login communication is sent
account is tracked as active/inactive
campaign start state is respected
each campaign day can schedule a Wally reminder
reminder always includes canonical game URL
completion-aware wording may be used
failed delivery is visible to admin
```

Daily reminders should be useful, not spammy.

Do not send repeated reminders after a user has completed the day's required experience unless an explicit event message is intended.

Use server-side email templates and delivery logs.

---

# 23. ADMIN MISSION CONTROL MUST BE BUILT AS AN OPERATIONS PRODUCT

Do not treat the admin UI as an afterthought.

Admins must be able to operate the campaign without code edits.

The build must ultimately support:

```text
connected users / presence
player status
country/entity activity
mission create/edit/publish/schedule
question tuning
point rules and justified bonus points
voting open/close/reveal
submission moderation
photo/media approval
theme change
live notifications
Wally targeted/global events
pause/resume controls
audits
analytics
email preview/test/status
event/spectator screen control
```

Every high-impact action writes an audit event.

---

# 24. UI/3D QUALITY APPROACH

The visual target is premium, memorable and modern.

The engineering target is resilient.

Use progressive enhancement:

```text
High → full 3D
Standard → reduced 3D
Lite → 2D animated Wally
Reduced Motion → static/low-motion equivalent
```

Use images heavily where they strengthen memory, history and identity, but optimize and moderate them.

Never make 3D a prerequisite for answering a question, submitting a challenge, voting or using admin controls.

---

# 25. USING CLAUDE BUILT-IN SKILLS THROUGHOUT THE PROJECT

At the start of each session, Claude does not need to re-run the entire plugin manager, but it should know the current relevant skills from `ENVIRONMENT_INVENTORY.md` and verify again when tooling changes.

When available:

```text
/simplify → review recently changed code for unnecessary complexity after functionality is proven
/debug → investigate persistent test/build/runtime failures
/batch → only for independent repetitive changes that are safe to parallelize
/loop → only where a bounded repeated verification cycle genuinely helps
/claude-api → only if the product later integrates Anthropic API; not required merely because Claude Code is used to build the app
```

If names differ in the installed Claude Code version, use `/skills` output rather than forcing obsolete names.

Record notable skill use in implementation notes only when it materially affected the outcome.

---

# 26. WHEN TO USE SUBAGENTS VS DIRECT WORK

Direct work:

```text
single-file changes
small bug fixes
sequential feature slice
edits requiring shared context
```

Subagent:

```text
security review
database/RLS review
architecture review
large test-log analysis
visual QA report
independent documentation audit
```

Parallel subagents should not edit overlapping files.

For truly independent large workstreams, use separate worktrees rather than creating merge conflicts in the same working tree.

---

# 27. CLEAN BUILD PROTOCOL

Use this whenever dependency, configuration or CI state is uncertain.

Do not delete lockfiles casually.

First:

```bash
git status
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

If the lockfile legitimately needs updating, update it intentionally with `pnpm install`, inspect the diff, then rerun verification.

A “clean build” means reproducible from the committed lockfile, not “delete everything until it works.”

For release candidates also test from a fresh checkout/worktree when practical.

---

# 28. `pnpm verify` IS THE DAILY QUALITY CONTRACT

The repository should expose one command that answers:

> Is the codebase structurally healthy at this commit?

Start with:

```text
lint + typecheck + unit tests + production build
```

Add database and E2E checks to a `verify:full` release command when stable.

Claude may run focused tests during development, but may not declare a slice complete without the full relevant gate.

---

# 29. PREVIEW DEPLOYMENT WORKFLOW

Every meaningful feature branch should be previewable through Vercel.

Workflow:

```text
push branch
Vercel preview builds
verify deployment status/logs
run critical smoke tests against preview
perform visual QA
review Sentry/browser errors if instrumented
open/update PR
```

Preview uses non-production data/services.

Never point a public preview at unrestricted production Supabase data merely for convenience.

---

# 30. PULL REQUEST QUALITY TEMPLATE

Every significant PR should answer:

```markdown
## What changed
...

## Product Guide phase
Phase X

## Acceptance criteria proven
- ...

## Security impact
...

## Database / migration impact
...

## Tests run
- pnpm lint
- pnpm typecheck
- ...

## Visual / E2E evidence
...

## Preview
...

## Rollback / risk
...
```

Claude must not fabricate test results in PR text.

---

# 31. RELEASE CANDIDATE GATE

Before production release:

```text
main/release branch is clean
all required PRs merged
CI green
migrations tested
Supabase security gate PASS
no critical Sentry issue in preview/staging
all critical E2E green
Day Zero green
email test green
admin Mission Control green
realtime multi-browser test green
mobile/Lite mode green
reduced-motion mode green
performance/load gate green
production env variable presence verified
rollback plan written
release commit/tag identified
```

Production release requires explicit human approval.

---

# 32. PRODUCTION DEPLOYMENT

The release agent/skill must not silently deploy because a branch was merged unless the user has intentionally configured automatic production deploys.

At deployment:

```text
record release SHA
apply approved database migrations in controlled order
confirm Vercel production deployment
run production smoke tests using safe test accounts
check authentication
check admin login
check player login
check realtime
check one safe notification
check Wally fallback
check email status
check Sentry/logs
```

Do not run destructive production smoke actions.

---

# 33. ROLLBACK AND INCIDENT RESPONSE

A launch-worthy system needs a recovery path.

Prepare:

```text
previous known-good Vercel deployment
migration forward-fix/rollback strategy
ability to pause campaign
ability to disable Wally heavy rendering
ability to disable a broken mission
ability to disable realtime surprise events
ability to stop emails
admin-only maintenance notice
```

When an incident occurs:

```text
stabilize first
preserve evidence
identify affected scope
do not delete logs
use /debug if relevant
query Sentry/logs
fix in branch
verify focused + regression tests
deploy controlled fix
record root cause in ADR/project memory if durable
```

---

# 34. POST-LAUNCH OPERATING MODE

During the seven-day game, development mode changes from feature-building to controlled operations.

Rules:

```text
no risky refactors during live campaign
hotfixes require focused regression checks
admin uses Mission Control rather than database edits
score corrections are explicit audited score events
vote corrections are auditable and permissioned
photo removals remain logged
Wally live messages use approved admin controls
Sentry/logs monitored
realtime health watched
email failures watched
```

Every day close should produce a short operational health note.

---

# 35. PROJECT MEMORY UPDATE AT THE END OF EACH SESSION

Before ending meaningful work:

1. run `git status`;
2. ensure unfinished work is clearly represented in `PROJECT_STATE.md`;
3. update `QUALITY_STATUS.md` with only checks actually run on the current commit/worktree;
4. run `memory-sync`;
5. update graph nodes/relations for durable outcomes;
6. back up graph memory;
7. commit completed work or clearly leave it uncommitted with state recorded;
8. never write secret values to memory.

A future Claude session should be able to answer:

```text
What phase are we on?
What is complete?
What is failing?
Why did we choose this architecture?
What is the next complete slice?
Which tests prove the previous slice?
```

without relying on hidden conversational history.

---

# 36. REQUIRED INITIAL GRAPH MEMORY BOOTSTRAP

After the memory MCP is connected, create the project/specification/component nodes described in Section 6.

Add relations such as:

```text
ITM15_Project specified_by Product_Guide
ITM15_Project specified_by Master_Runbook
Wally_Engine specified_by Wally_Spec
Admin_Mission_Control depends_on Auth_System
Game_Engine depends_on Auth_System
Scoring_Ledger depends_on Supabase
Voting_Engine depends_on Supabase
Realtime_Engine uses Supabase
ITM15_Project deployed_to Vercel
ITM15_Project uses GitHub
```

Then add only current verified observations.

Do not pre-mark future phases as complete.

---

# 37. REQUIRED PROJECT-SCOPE `.mcp.json` PRINCIPLES

Project-scoped MCP configuration may be committed when it contains only non-secret server definitions.

Credentials remain OAuth-managed or environment-provided.

Never commit bearer tokens inside `.mcp.json`.

If local memory requires a machine-specific absolute path, keep that server local instead of committing the path.

After MCP setup, run:

```text
/mcp
```

and confirm every required server reports healthy/authenticated.

---

# 38. INITIAL TOOL CONNECTION TESTS

Do not assume a connected icon means the tool works.

Test each integration with a harmless read operation.

GitHub:

```text
read repository metadata/current branch or recent commit
```

Vercel:

```text
list/inspect the project or preview deployment
```

Supabase:

```text
list project schema/tables or docs; avoid destructive write
```

Playwright:

```text
open the current local/preview app and inspect the landing page
```

Sentry:

```text
verify organization/project visibility when configured
```

Memory:

```text
create/open a harmless ITM15_Project entity, then search it
```

Record success/failure in `ENVIRONMENT_INVENTORY.md`.

---

# 39. DEPENDENCY ADDITION RULE

Before adding a package, Claude must answer internally:

```text
What capability is missing?
Can the platform/framework already do it?
Is the package maintained?
What bundle/security impact does it have?
Is it client-side or server-only?
Is there a smaller option?
```

After adding:

```text
lockfile changes reviewed
typecheck passes
build passes
relevant test exists
```

Do not let experimental libraries quietly become core architecture without an ADR.

---

# 40. ARCHITECTURE DECISION RECORDS

Create an ADR only for decisions worth remembering across sessions/teams.

Examples:

```text
why Supabase Realtime Broadcast is used
why server score ledger is authoritative
why 3D has Lite fallback
why temporary shared starter password is first-login-only
why project uses pnpm
why production MCP is read-only by default
```

Path:

```text
docs/adr/0001-<slug>.md
```

Each ADR:

```text
Context
Decision
Alternatives considered
Security/privacy consequences
Implementation consequences
Status
Date
```

Link ADRs into the memory graph.

---

# 41. USER DATA AND PRIVACY BOUNDARY

Claude Code's development memory is not an employee-data store.

Do not place real employee names/emails/photos/votes into:

```text
CLAUDE.md
project auto-memory
graph memory
fixture files committed to git
public screenshots
PR descriptions
```

Use synthetic test identities such as:

```text
Amina Kenya
Jean DRC
Moussa Senegal
Test Admin
```

Production employee data belongs in the production application under the app's access controls.

---

# 42. IMAGE AND MEDIA DEVELOPMENT RULE

Use approved historical/brand assets from the repository/media library.

During development:

```text
preserve originals
optimize copies
strip unnecessary metadata where appropriate
use safe storage paths
validate MIME/type/size
never surface unmoderated user upload publicly
```

Image upload success is not sufficient; access-policy tests must pass.

---

# 43. PERFORMANCE BUDGET MINDSET

The product should feel premium because it is responsive, not merely because it has heavy graphics.

Claude must regularly inspect:

```text
route bundle impact
3D asset size
texture size
image payload
initial page load
mobile memory pressure
long-lived realtime subscriptions
spectator screen stability
```

Lazy-load 3D where possible.

Use static/2D fallbacks before allowing a weak device to fail.

---

# 44. STOP CONDITIONS — WHEN CLAUDE MUST NOT CONTINUE TO THE NEXT PHASE

Stop phase progression if any of these are true:

```text
required product guide not read
critical requirement conflict unresolved
secrets detected in git
build fails
critical test fails
RLS/security BLOCK
migration cannot rebuild cleanly
player can access admin action
score/vote can be forged client-side
private realtime audience leaks
unmoderated image can appear publicly
production-only manual fix exists without migration/code
Day Zero fails
```

Claude may continue debugging the current issue, but must not declare the phase complete.

---

# 45. WHAT CLAUDE SHOULD DO WHEN A TEST FAILS

Do not immediately weaken or delete the test.

Sequence:

```text
read failure
reproduce narrowly
inspect relevant code
identify expected behaviour from specification
use /debug if available and useful
fix root cause
rerun focused test
rerun regression gate
```

Only change the test if the specification proves the test expectation is wrong.

Document the reason.

---

# 46. WHAT CLAUDE SHOULD DO WHEN THE BUILD PASSES BUT UX IS BAD

A green build is not a product-quality pass.

Use `visual-qa` and Playwright.

Fix:

```text
layout breakage
mobile overflow
Wally covering controls
unreadable text
weak hierarchy
jarring animation
missing loading states
empty screens
bad image crops
slow scenes
inconsistent admin UI
```

The intended reaction remains:

> “Walumo built this?”

not:

> “The build passed.”

---

# 47. DAY ZERO IS THE TRUE SYSTEM TEST

The first complete vertical slice is more important than seven partially working days.

Day Zero must prove:

```text
admin creates employee
employee gets entry communication
employee signs in
starter password is replaced
profile captures name/email/country
Wally greets by approved name
admin launches cross-country challenge
player sees it live
player completes real-world challenge
photo uploads
moderator approves
server awards Unity Points
leaderboard updates
Wally celebrates
passport stamp unlocks
Mission Control receives activity
approved photo can be featured on event screen
```

This proves the whole platform architecture.

---

# 48. FIRST CLAUDE CODE PROMPT TO RUN AFTER ADDING THIS FILE

Paste this into Claude Code from the root of the `ITM@15` repository:

```text
You are the lead engineer for ITM@15.

Do not begin feature coding yet.

Read CLAUDE.md and ITM15_MASTER_BUILD_RUNBOOK.md first. Then inventory the repository and locate every Markdown, Word, PDF, config and implementation file that may define or affect the product.

Read docs/PRODUCT_GUIDE.md and docs/WALLY.md in full. Review the committed Word guide(s) too, using an installed document skill if available or a local extraction method if not.

Next, perform the Section 2 Claude Code capability inventory. Show me what /skills, /agents, /hooks, /mcp, /memory, /permissions, /plugin and /status indicate. Do not install anything blindly: identify what is already available first.

Create/update:
- docs/claude/ENVIRONMENT_INVENTORY.md
- docs/claude/DOCS_INDEX.md
- docs/claude/PROJECT_STATE.md
- docs/claude/QUALITY_STATUS.md

Then tell me:
1. the current Product Guide phase,
2. what already exists,
3. what is missing,
4. which relevant existing skills/tools you will use,
5. which project skills still need to be created,
6. which MCP/plugin connections are missing,
7. any security/configuration issue that must be resolved before coding,
8. the smallest complete next slice.

Only after this bootstrap report is grounded in the actual repository should you begin Phase 0 implementation.

During the project, follow the runbook gate after every slice: test, security, visual QA, docs update, memory sync, then commit.
```

---

# 49. PROMPT TO CONTINUE ON ANY FUTURE DAY

Use this rather than re-explaining the whole project:

```text
Resume ITM@15 from repository truth.

Read CLAUDE.md, ITM15_MASTER_BUILD_RUNBOOK.md, docs/PRODUCT_GUIDE.md, docs/WALLY.md, docs/claude/PROJECT_STATE.md and docs/claude/QUALITY_STATUS.md.

Retrieve relevant graph memory for the current phase/component and reconcile it against git. Inspect git status and recent commits.

Tell me the current phase, last verified state and smallest complete next slice. Then implement that slice under the runbook, use all relevant available Claude Code skills/tools, run the required gates, update project state/memory and create a focused conventional commit.

Do not skip a failing gate and do not deploy production unless the release gate is explicitly approved.
```

---

# 50. PROMPT FOR A FULL SECURITY / RELEASE REVIEW

```text
Prepare ITM@15 for release candidate review.

Do not add features.

Read all controlling specifications and current project state. Run the security-gate, supabase-review, test-gate, visual-qa, wally-qa and release-gate skills if available. Use the connected Supabase, Vercel, GitHub, Playwright and Sentry tools where relevant.

Verify auth, roles, RLS, scores, votes, uploads, moderation, realtime audience isolation, Wally authority, admin audit logs, email configuration, secret handling, mobile/Lite/reduced-motion paths, CI, preview deployment, migrations and rollback readiness.

Run the full test/build suite and Day Zero E2E rehearsal.

Return a release decision of PASS or BLOCK. For BLOCK, list exact issues, severity, evidence and required fix. Do not weaken gates to obtain PASS.
```

---

# 51. FINAL DEFINITION OF SUCCESS

Claude Code has succeeded when it has not merely generated a lot of code, but built a system that another engineer can understand, test and safely operate.

The final project should have:

```text
clear source-of-truth product docs
short effective CLAUDE.md
repeatable project skills
specialist review agents
safe tool/MCP integrations
persistent but privacy-safe memory
auditable architecture decisions
reproducible migrations
server-authoritative game logic
reliable tests
clean CI
preview deployments
secure production release process
premium mobile gameplay
strong admin Mission Control
Wally that feels alive without becoming business authority
safe photo/media handling
realtime multiplayer behaviour
operational observability
rollback capability
```

The product quality bar remains:

> Every employee should feel that something is happening around them, every day should create curiosity, and every important system action should still be explainable, testable and secure.

The engineering quality bar is:

> A future Claude Code session or human engineer can open `ITM@15`, understand exactly where the project stands, why the architecture exists, which gate comes next and how to prove that the next change is safe.

That is the standard for building `ITM@15` properly.

---

# 52. VERIFIED EXTERNAL REFERENCE NOTES

These external capabilities were checked against their current official documentation when this runbook was created. Claude should still use `/skills`, `/mcp`, `/plugin`, `/memory` and `claude doctor` as runtime truth because Claude Code evolves.

```text
Claude Code skills:
https://code.claude.com/docs/en/skills

Claude Code memory and auto-memory:
https://code.claude.com/docs/en/memory

Claude Code MCP:
https://code.claude.com/docs/en/mcp

Claude Code plugins:
https://code.claude.com/docs/en/discover-plugins

Claude Code hooks:
https://code.claude.com/docs/en/hooks-guide

Claude Code permissions:
https://code.claude.com/docs/en/permissions

Supabase official MCP:
https://supabase.com/docs/guides/ai-tools/mcp

Playwright MCP for Claude Code:
https://playwright.dev/mcp/clients/claude-code

MCP knowledge-graph memory reference server:
https://github.com/modelcontextprotocol/servers/tree/main/src/memory

Sentry official Claude Code plugin/MCP:
https://github.com/getsentry/plugin-claude

Vercel MCP is listed in Claude Code MCP documentation and connects at:
https://mcp.vercel.com/
```

Do not copy credentials from these sites into committed files.
