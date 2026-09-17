"""Minimal .env.local reader — no python-dotenv dependency, matching this
project's "don't add a dependency for something this small" convention.
Only used for E2E test cleanup (reading SUPABASE_URL/SUPABASE_SECRET_KEY to
delete synthetic test accounts after a run) — never printed, never
committed, never sent anywhere but the Supabase Admin API it's meant for.
"""

import os
from typing import Optional, Dict


def load_env_local(path: Optional[str] = None) -> Dict[str, str]:
    if path is None:
        here = os.path.dirname(os.path.abspath(__file__))
        path = os.path.join(here, "..", "..", "..", ".env.local")
    values: dict[str, str] = {}
    try:
        with open(path, "r") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, value = line.partition("=")
                values[key.strip()] = value.strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    return values
