"""Deletes a synthetic test mission by exact title, via PostgREST with the
service-role key. `challenges`/`challenge_options`/`submissions`/
`score_events` all ON DELETE CASCADE from `missions` (confirmed directly
against pg_constraint on the live project, 2026-09-17), so deleting the
mission row is sufficient - matching cleanup.py's identical reasoning for
why deleting the auth.users row alone is enough for a player account.
"""

import json
import urllib.parse
import urllib.request

from _lib.env import load_env_local


def delete_mission_by_title(title: str) -> int:
    """Returns the number of mission rows deleted (0 if none matched)."""
    env = load_env_local()
    base_url = env.get("SUPABASE_URL")
    service_key = env.get("SUPABASE_SECRET_KEY")
    if not base_url or not service_key:
        raise RuntimeError("SUPABASE_URL/SUPABASE_SECRET_KEY not found in .env.local")

    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Prefer": "return=representation",
    }
    encoded_title = urllib.parse.quote(title)
    req = urllib.request.Request(
        f"{base_url}/rest/v1/missions?title=eq.{encoded_title}",
        headers=headers,
        method="DELETE",
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        deleted = json.loads(resp.read())
    return len(deleted)
