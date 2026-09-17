"""Creates/deletes a synthetic GAME_MASTER admin test account directly
via the Supabase Admin REST API + a service-role PostgREST insert -
there's no self-serve way to become an admin in this app (by design;
Product Guide §4.5 - account creation is Super-Admin-only), so a
permanent E2E test that needs an admin session has to bootstrap one this
way rather than driving the real /admin/players/new form with a real
Super Admin's credentials.

Same "create via service role, verify, delete" convention as
cleanup.py's delete_test_user_by_email, and the same stdlib-only,
no-`requests`-dependency approach as the rest of _lib/.
"""

import json
import urllib.request

from _lib.env import load_env_local


def _admin_headers(service_key: str) -> dict:
    return {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
    }


def create_test_admin(email: str, password: str, full_name: str) -> str:
    """Creates a real auth.users + profiles + user_roles(GAME_MASTER) row
    set, matching what src/app/admin/players/new/actions.ts's server
    action does for a real admin-created account, minus must_change_password
    (set False here - this is a fully-provisioned test identity, not
    simulating the first-login flow, which is already covered by
    test_signup_onboarding_play.py). Returns the new user's id."""
    env = load_env_local()
    base_url = env.get("SUPABASE_URL")
    service_key = env.get("SUPABASE_SECRET_KEY")
    if not base_url or not service_key:
        raise RuntimeError("SUPABASE_URL/SUPABASE_SECRET_KEY not found in .env.local")

    headers = _admin_headers(service_key)

    create_req = urllib.request.Request(
        f"{base_url}/auth/v1/admin/users",
        headers=headers,
        method="POST",
        data=json.dumps({"email": email, "password": password, "email_confirm": True}).encode(),
    )
    with urllib.request.urlopen(create_req, timeout=15) as resp:
        user = json.loads(resp.read())
    user_id = user["id"]

    profile_req = urllib.request.Request(
        f"{base_url}/rest/v1/profiles",
        headers={**headers, "Prefer": "return=minimal"},
        method="POST",
        data=json.dumps(
            {
                "id": user_id,
                "email": email,
                "full_name": full_name,
                "first_name": full_name.split(" ")[0],
                "must_change_password": False,
                "onboarding_completed": True,
            }
        ).encode(),
    )
    with urllib.request.urlopen(profile_req, timeout=15):
        pass

    role_req = urllib.request.Request(
        f"{base_url}/rest/v1/user_roles",
        headers={**headers, "Prefer": "return=minimal"},
        method="POST",
        data=json.dumps({"user_id": user_id, "role": "GAME_MASTER"}).encode(),
    )
    with urllib.request.urlopen(role_req, timeout=15):
        pass

    return user_id
