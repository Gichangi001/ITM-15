"""E2E: the Phase 21 "Day Zero" rehearsal (Product Guide §26 Phase 21,
docs/WALLY.md §44's identical "Meet Another Country" scenario) - the one
continuous, permanent version of the scenario this project's own
PROJECT_STATE.md had disclosed, every prior session, as "only run
per-phase in isolation, never as one continuous rehearsal."

Full loop, two independent browser sessions (admin + player, matching
this project's established two-tab realtime-verification pattern):
  1. A synthetic GAME_MASTER admin (bootstrapped directly via the Admin
     API - see _lib/adminAccount.py, there's no self-serve path to an
     admin role) creates and publishes a real cross-country PHOTO_UPLOAD
     mission on Day 1.
  2. A synthetic player signs up (instant-join), onboards, finds the
     mission, uploads a real photo -> PENDING.
  3. The admin approves it in a separate, already-authenticated session.
  4. The real score ledger reflects it (50 base + 100 unity = 150pts) on
     the public leaderboard.
  5. The player's own achievements page shows a real unlocked badge.
  6. Zero console/page errors throughout.

Run against an already-running production build (see README.md for why
`pnpm build && pnpm start`, not `pnpm dev`):

    pnpm build && pnpm start &
    python3 tests/e2e/test_day_zero_rehearsal.py

Rate-limit note: this test calls instant-join once (Phase 20's
src/lib/security/rateLimit.ts throttles it to 8/10min per client IP).
Running this suite back-to-back many times in a few minutes from the
same machine can trip that limiter - a real, disclosed local-dev-only
gap (rateLimit.ts's own header comment: no x-forwarded-for in local dev
means every request shares one identifier). Not an issue in normal CI
cadence or production (Vercel always sets the header).
"""

import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from playwright.sync_api import sync_playwright  # noqa: E402
from _lib.adminAccount import create_test_admin  # noqa: E402
from _lib.cleanup import delete_test_user_by_email  # noqa: E402
from _lib.content import delete_mission_by_title  # noqa: E402

BASE = os.environ.get("E2E_BASE_URL", "http://localhost:3000")
RUN_ID = random.randint(100000, 999999)
ADMIN_EMAIL = f"e2e.dz.admin.{RUN_ID}@itm15.test"
ADMIN_PASSWORD = "DayZeroRehearsal!Test9"
PLAYER_EMAIL = f"e2e.dz.player.{RUN_ID}@itm15.test"
MISSION_TITLE = f"E2E Day Zero Rehearsal {RUN_ID} (safe to delete)"
PHOTO_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_lib", "test-photo.png")

errors = []
notes = []


def check(cond, msg):
    tag = "ok" if cond else "FAIL"
    print(f"  [{tag}] {msg}")
    if not cond:
        errors.append(msg)


def make_test_photo(path: str) -> None:
    """A minimal, valid 4x4 PNG - no Pillow dependency, matching this
    project's stdlib-only convention for the E2E suite."""
    import struct
    import zlib

    width, height, color = 4, 4, (90, 140, 220)

    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data))

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
    raw = b"".join(b"\x00" + bytes(color) * width for _ in range(height))
    idat = chunk(b"IDAT", zlib.compress(raw))
    iend = chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(sig + ihdr + idat + iend)


admin_id = None
try:
    admin_id = create_test_admin(ADMIN_EMAIL, ADMIN_PASSWORD, "Rehearsal Admin")
    print(f"  [ok] synthetic admin bootstrapped: {ADMIN_EMAIL}")
except Exception as e:
    print(f"  [FAIL] could not bootstrap admin account: {e}")
    sys.exit(1)

if not os.path.exists(PHOTO_PATH):
    make_test_photo(PHOTO_PATH)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    admin_page = browser.new_page(viewport={"width": 1280, "height": 900})
    player_page = browser.new_page(viewport={"width": 1280, "height": 900})
    for pg in (admin_page, player_page):
        pg.set_default_navigation_timeout(60000)
        pg.set_default_timeout(20000)
        pg.on(
            "console",
            lambda m, pg=pg: notes.append(f"[console:{m.type} @ {pg.url}] {m.text}") if m.type == "error" else None,
        )
        pg.on("pageerror", lambda e, pg=pg: notes.append(f"[pageerror @ {pg.url}] {e}"))

    print("== 1. Admin signs in, creates + publishes a real cross-country mission ==")
    admin_page.goto(f"{BASE}/login")
    admin_page.wait_for_load_state("load")
    admin_page.fill("#email", ADMIN_EMAIL)
    admin_page.locator("#email").blur()
    admin_page.get_by_role("button", name="Sign in").wait_for(state="visible", timeout=8000)
    admin_page.fill("#password", ADMIN_PASSWORD)
    admin_page.get_by_role("button", name="Sign in").click()
    admin_page.wait_for_url(lambda u: "/login" not in u, timeout=15000)
    admin_page.wait_for_load_state("load")
    check("/admin" in admin_page.url, f"admin signed in, at {admin_page.url}")

    admin_page.goto(f"{BASE}/admin/missions/new")
    admin_page.wait_for_load_state("load")
    admin_page.select_option("#dayNumber", "1")
    admin_page.fill("#title", MISSION_TITLE)
    admin_page.fill("#slug", f"e2e-day-zero-{RUN_ID}")
    admin_page.fill("#description", "Automated Day Zero rehearsal mission - safe to delete.")
    admin_page.fill("#basePoints", "50")
    admin_page.fill("#unityPoints", "100")
    admin_page.check("#isUnityChallenge")
    admin_page.select_option("#challengeType", "PHOTO_UPLOAD")
    admin_page.fill("#prompt", "Upload a photo to complete the rehearsal.")
    admin_page.get_by_role("button", name="Create mission (draft)").click()
    # The create action redirects via next/navigation's redirect() inside a
    # Server Action - a client-side router navigation, not a traditional
    # full-page load, so wait_for_load_state("load") can resolve before the
    # URL actually changes. Wait for the real destination explicitly.
    admin_page.wait_for_url(lambda u: "/admin/missions/new" not in u, timeout=15000)
    admin_page.wait_for_load_state("load")
    check("/admin/missions" in admin_page.url, f"mission created, redirected to {admin_page.url}")

    if "/admin/missions" not in admin_page.url:
        admin_page.goto(f"{BASE}/admin/missions")
        admin_page.wait_for_load_state("load")
    admin_page.wait_for_timeout(500)
    row = admin_page.locator("div.rounded-lg", has_text=MISSION_TITLE)
    row.wait_for(state="visible", timeout=10000)
    check(row.count() == 1, f"exactly one matching mission row found (count={row.count()})")
    row.locator("select[name='status']").select_option("LIVE")
    row.get_by_role("button", name="Save").click()
    admin_page.wait_for_load_state("load")
    body = admin_page.locator("body").inner_text()
    check(MISSION_TITLE in body, "mission published LIVE and visible in the admin list")

    print("== 2. A real player signs up, onboards, finds and completes the mission ==")
    player_page.goto(f"{BASE}/login")
    player_page.wait_for_load_state("load")
    player_page.fill("#email", PLAYER_EMAIL)
    player_page.locator("#email").blur()
    join_btn = player_page.get_by_role("button", name="Enter ITM@15")
    join_btn.wait_for(state="visible", timeout=8000)
    join_btn.click()
    player_page.wait_for_url(lambda u: "/login" not in u, timeout=20000)
    player_page.fill("#fullName", "Day Zero Player")
    player_page.select_option("#countryIsoCode", value="SN")  # Senegal - cross-country from Kenya's Day 1 theme
    player_page.get_by_role("button", name="Enter ITM@15").click()
    player_page.wait_for_url(lambda u: "/onboarding" not in u, timeout=20000)
    check("/play" in player_page.url, f"player onboarded, at {player_page.url}")

    player_page.wait_for_timeout(11500)  # let the DRC arrival cinematic finish
    golden = player_page.locator("button.btn-golden")
    if golden.count() > 0:
        golden.click()
        player_page.wait_for_timeout(300)

    player_page.goto(f"{BASE}/play/day/1")
    player_page.wait_for_load_state("load")
    mission_link = player_page.locator("a", has_text=MISSION_TITLE)
    check(mission_link.count() > 0, "player can see the published mission on /play/day/1")
    mission_link.first.click()
    player_page.wait_for_load_state("load")

    player_page.set_input_files("input[type='file']", PHOTO_PATH)
    player_page.wait_for_selector("text=ready to go", timeout=10000)
    player_page.get_by_role("button", name="Send your photo").click()
    player_page.wait_for_selector("text=moderators", timeout=15000)
    body = player_page.locator("body").inner_text()
    check("moderators" in body.lower(), "submission accepted, pending moderation")

    print("== 3. Admin (separate, still-signed-in session) moderates the submission ==")
    admin_page.goto(f"{BASE}/admin/submissions")
    admin_page.wait_for_load_state("load")
    admin_page.wait_for_timeout(500)
    approve_btn = admin_page.get_by_role("button", name="Approve")
    initial_count = approve_btn.count()
    check(initial_count > 0, "a pending submission is visible in the moderation queue")
    if initial_count > 0:
        approve_btn.first.click()
        try:
            admin_page.wait_for_function(
                "Array.from(document.querySelectorAll('button')).filter(b => b.textContent.trim() === 'Approve').length < "
                + str(initial_count),
                timeout=15000,
            )
        except Exception:
            pass
        remaining = admin_page.get_by_role("button", name="Approve").count()
        check(remaining < initial_count, f"submission approved (pending count dropped from {initial_count} to {remaining})")

    print("== 4. Verify real score + leaderboard reflect it ==")
    # /leaderboards is a protected player route but visible to ANY signed-in
    # player - reuse the admin's own already-authenticated session rather
    # than signing anyone out.
    admin_page.goto(f"{BASE}/leaderboards")
    admin_page.wait_for_load_state("load")
    lb_text = admin_page.locator("body").inner_text()
    check("Day Zero Player" in lb_text, "the player appears on the public leaderboard")
    check("150" in lb_text, "leaderboard shows a 150pt total (50 base + 100 unity) somewhere on the page")

    print("== 5. Check achievements for this player (still on the player's own original session) ==")
    player_page.goto(f"{BASE}/achievements")
    player_page.wait_for_load_state("load")
    ach_text = player_page.locator("body").inner_text()
    check("Unlocked" in ach_text, "player has at least one real unlocked achievement")

    check(len([e for e in notes if "error" in e.lower()]) == 0, f"zero console/page errors (got: {notes})")

    browser.close()

print("\n== Cleanup ==")
try:
    delete_mission_by_title(MISSION_TITLE)
    print(f"  [ok] mission deleted: {MISSION_TITLE}")
except Exception as e:
    print(f"  [WARN] mission cleanup failed: {e}")
try:
    delete_test_user_by_email(PLAYER_EMAIL)
    print(f"  [ok] player account deleted: {PLAYER_EMAIL}")
except Exception as e:
    print(f"  [WARN] player cleanup failed: {e}")
try:
    delete_test_user_by_email(ADMIN_EMAIL)
    print(f"  [ok] admin account deleted: {ADMIN_EMAIL}")
except Exception as e:
    print(f"  [WARN] admin cleanup failed: {e}")
if os.path.exists(PHOTO_PATH):
    os.remove(PHOTO_PATH)

print()
if errors:
    print(f"FAILED: {len(errors)} check(s) failed")
    for e in errors:
        print(f"  - {e}")
    sys.exit(1)
print("PASSED: Day Zero rehearsal complete, all checks green")
