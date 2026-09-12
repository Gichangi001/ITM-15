#!/usr/bin/env bash
# PreToolUse guard for Bash commands, per ITM15_MASTER_BUILD_RUNBOOK.md §9.3.
#
# This is a string-matching safety NET, not the primary guardrail — permissions
# in .claude/settings.json remain the primary control. This hook exists to
# catch an obviously destructive command even if it slipped past an allow rule.
#
# Reads the PreToolUse hook JSON payload from stdin, looks at the Bash command
# text, and blocks (exit 2) on patterns that match runbook §9.3:
#   - rm -rf on repository/root paths
#   - git push --force / --force-with-lease
#   - git reset --hard
#   - DROP DATABASE / DROP SCHEMA
#   - printing known secret environment variable names
#
# Exit 0 = allow. Exit 2 = block, with a reason on stderr.

set -euo pipefail

input="$(cat)"

command=$(printf '%s' "$input" | python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get("tool_input", {}).get("command", ""))
except Exception:
    pass
')

if [ -z "$command" ]; then
  exit 0
fi

block() {
  echo "BLOCKED by check-destructive-command.sh: $1" >&2
  exit 2
}

# rm -rf targeting the repo root, home, or a bare slash/wildcard.
if printf '%s' "$command" | grep -Eq 'rm[[:space:]]+(-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*|-[a-zA-Z]*f[a-zA-Z]*r[a-zA-Z]*)[[:space:]]+(/|~|\$HOME|\.\.?/?\*?[[:space:]]*$|\*)'; then
  block "rm -rf against a root/home/wildcard path"
fi

# Force pushes.
if printf '%s' "$command" | grep -Eq 'git[[:space:]]+push[[:space:]]+.*(--force([^-]|$)|--force-with-lease|-f([[:space:]]|$))'; then
  block "git push --force / -f — force pushes are not auto-approved, ask the human first"
fi

# git reset --hard.
if printf '%s' "$command" | grep -Eq 'git[[:space:]]+reset[[:space:]]+.*--hard'; then
  block "git reset --hard — confirm no uncommitted work is being discarded, ask the human first"
fi

# Destructive SQL.
if printf '%s' "$command" | grep -Eiq '\b(drop[[:space:]]+database|drop[[:space:]]+schema|truncate[[:space:]]+table)\b'; then
  block "destructive SQL (DROP DATABASE/SCHEMA or TRUNCATE) — never run against production without explicit human approval"
fi

# Printing known secret env var names.
if printf '%s' "$command" | grep -Eq '\b(echo|cat|print)\b.*\$(SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|RESEND_API_KEY|SENTRY_AUTH_TOKEN|CRON_SECRET|VERCEL_TOKEN)\b'; then
  block "command appears to print a known secret environment variable"
fi

exit 0
