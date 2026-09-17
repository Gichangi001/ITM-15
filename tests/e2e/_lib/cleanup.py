"""Deletes a synthetic test account created during an E2E run, via
Supabase's Admin REST API — this project's own convention throughout its
history ("create via service role, verify, delete"). Deleting the
auth.users row is sufficient: every real player-owned table
(profiles/user_roles/passport_cards/score_events/submissions/votes/
player_achievements/notifications/wally_event_receipts) has an ON DELETE
CASCADE foreign key back to it; admin-authored-content tables that
reference a user (missions.created_by, audit_logs.actor_id, etc.) are
ON DELETE SET NULL, so deletion never fails because a test account
happened to touch something else. Confirmed by querying pg_constraint
directly against the live project before relying on this (2026-09-17).

Uses only the standard library (urllib) — no `requests` dependency,
matching this project's existing "don't add a dependency for this"
convention (see _lib/env.py).
"""

import json
import urllib.request

from _lib.env import load_env_local


def delete_test_user_by_email(email: str) -> bool:
    """Returns True if a matching user was found and deleted, False if not
    found (not an error — the account may not have been created, e.g. if
    the test failed before signup). Raises on any other failure so a
    broken cleanup is never silently swallowed."""
    env = load_env_local()
    base_url = env.get("SUPABASE_URL")
    service_key = env.get("SUPABASE_SECRET_KEY")
    if not base_url or not service_key:
        raise RuntimeError("SUPABASE_URL/SUPABASE_SECRET_KEY not found in .env.local — cannot clean up test account")

    headers = {"apikey": service_key, "Authorization": f"Bearer {service_key}"}

    # Supabase's admin list endpoint doesn't filter by exact email via a
    # query param reliably across versions — fetch and filter client-side
    # instead of trusting an undocumented filter param.
    list_req = urllib.request.Request(f"{base_url}/auth/v1/admin/users", headers=headers)
    with urllib.request.urlopen(list_req, timeout=15) as resp:
        body = json.loads(resp.read())
    users = body.get("users", body) if isinstance(body, dict) else body
    match = next((u for u in users if u.get("email") == email), None)
    if not match:
        return False

    del_req = urllib.request.Request(
        f"{base_url}/auth/v1/admin/users/{match['id']}", headers=headers, method="DELETE"
    )
    with urllib.request.urlopen(del_req, timeout=15):
        pass
    return True
