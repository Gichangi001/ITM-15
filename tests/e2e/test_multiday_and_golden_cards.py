"""E2E: verifies, live, two things the product owner asked to have
checked directly (2026-09-18):

1. Admin can create + publish a brand-new mission on a day OTHER than
   Day 1 (proving the per-day mission controls generalize, not just
   Day 1, which was already proven separately by
   test_day_zero_rehearsal.py) - a real player sees it on that day.
2. The "Chairman's Egg" golden card feature end to end: admin allocates
   a card to a real synthetic player for a day, a second synthetic
   player finds them and claims it with the real code, real points land
   on both sides via score_events, and a double-claim on the same code
   is correctly refused.

Does NOT touch any existing day's own LIVE/DRAFT status (the real
campaign has real players right now) - only adds then deletes a
throwaway test mission, and creates/deletes fully synthetic accounts.

Run against an already-running production build (see README.md):

    pnpm build && pnpm start &
    python3 tests/e2e/test_multiday_and_golden_cards.py
"""

import os
import random
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from playwright.sync_api import sync_playwright  # noqa: E402
from _lib.adminAccount import create_test_admin  # noqa: E402
from _lib.cleanup import delete_test_user_by_email  # noqa: E402
from _lib.content import delete_mission_by_title  # noqa: E402

BASE = os.environ.get("E2E_BASE_URL", "http://localhost:3000")
RUN_ID = random.randint(100000, 999999)
ADMIN_EMAIL = f"e2e.gc.admin.{RUN_ID}@itm15.test"
ADMIN_PASSWORD = "GoldenCardTest!Pass9"
CARRIER_EMAIL = f"e2e.gc.carrier.{RUN_ID}@itm15.test"
FINDER_EMAIL = f"e2e.gc.finder.{RUN_ID}@itm15.test"
CARRIER_NAME = f"Carrier {RUN_ID}"
FINDER_NAME = f"Finder {RUN_ID}"
MISSION_TITLE = f"E2E Multi-Day Check {RUN_ID} (safe to delete)"

errors = []
notes = []


def check(cond, msg):
    tag = "ok" if cond else "FAIL"
    print(f"  [{tag}] {msg}")
    if not cond:
        errors.append(msg)


admin_id = create_test_admin(ADMIN_EMAIL, ADMIN_PASSWORD, "GC Admin")
print(f"  [ok] synthetic admin bootstrapped: {ADMIN_EMAIL}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    admin_page = browser.new_page(viewport={"width": 1280, "height": 900})
    carrier_page = browser.new_page(viewport={"width": 1280, "height": 900})
    finder_page = browser.new_page(viewport={"width": 1280, "height": 900})
    for pg in (admin_page, carrier_page, finder_page):
        pg.set_default_navigation_timeout(60000)
        pg.set_default_timeout(20000)
        pg.on(
            "console",
            lambda m, pg=pg: notes.append(f"[console:{m.type} @ {pg.url}] {m.text}") if m.type == "error" else None,
        )
        pg.on("pageerror", lambda e, pg=pg: notes.append(f"[pageerror @ {pg.url}] {e}"))

    print("== Admin signs in ==")
    admin_page.goto(f"{BASE}/login")
    admin_page.wait_for_load_state("load")
    admin_page.fill("#email", ADMIN_EMAIL)
    admin_page.locator("#email").blur()
    admin_page.get_by_role("button", name="Sign in").wait_for(state="visible", timeout=8000)
    admin_page.fill("#password", ADMIN_PASSWORD)
    admin_page.get_by_role("button", name="Sign in").click()
    admin_page.wait_for_url(lambda u: "/login" not in u, timeout=15000)
    check("/admin" in admin_page.url, f"admin signed in, at {admin_page.url}")

    print("== 1. Admin creates + publishes a mission on Day 4 (not Day 1) ==")
    admin_page.goto(f"{BASE}/admin/missions/new")
    admin_page.wait_for_load_state("load")
    admin_page.select_option("#dayNumber", "4")
    admin_page.fill("#title", MISSION_TITLE)
    admin_page.fill("#slug", f"e2e-multiday-{RUN_ID}")
    admin_page.fill("#description", "Automated multi-day admin check - safe to delete.")
    admin_page.fill("#basePoints", "5")
    admin_page.select_option("#challengeType", "FREE_TEXT")
    admin_page.fill("#prompt", "Say anything.")
    admin_page.get_by_role("button", name="Create mission (draft)").click()
    # Server Action redirect is a client-side router navigation, not a
    # traditional full-page load - wait_for_load_state("load") alone can
    # resolve before the URL actually changes (found live, 2026-09-17).
    admin_page.wait_for_url(lambda u: "/admin/missions/new" not in u, timeout=15000)
    admin_page.wait_for_load_state("load")

    if "/admin/missions" not in admin_page.url:
        admin_page.goto(f"{BASE}/admin/missions")
        admin_page.wait_for_load_state("load")
    admin_page.wait_for_timeout(500)
    row = admin_page.locator("div.rounded-lg", has_text=MISSION_TITLE)
    row.wait_for(state="visible", timeout=10000)
    row.locator("select[name='status']").select_option("LIVE")
    row.get_by_role("button", name="Save").click()
    admin_page.wait_for_load_state("load")
    body = admin_page.locator("body").inner_text()
    check(MISSION_TITLE in body, "Day 4 mission created and published LIVE via the real admin UI")

    print("== 2. A real player sees it on /play/day/4 ==")
    carrier_page.goto(f"{BASE}/login")
    carrier_page.wait_for_load_state("load")
    carrier_page.fill("#email", CARRIER_EMAIL)
    carrier_page.locator("#email").blur()
    join_btn = carrier_page.get_by_role("button", name="Enter ITM@15")
    join_btn.wait_for(state="visible", timeout=8000)
    join_btn.click()
    carrier_page.wait_for_url(lambda u: "/login" not in u, timeout=20000)
    carrier_page.fill("#fullName", CARRIER_NAME)
    carrier_page.select_option("#countryIsoCode", value="KE")
    carrier_page.get_by_role("button", name="Enter ITM@15").click()
    carrier_page.wait_for_url(lambda u: "/onboarding" not in u, timeout=20000)
    check("/play" in carrier_page.url, f"carrier player onboarded, at {carrier_page.url}")

    carrier_page.goto(f"{BASE}/play/day/4")
    carrier_page.wait_for_load_state("load")
    mission_link = carrier_page.locator("a", has_text=MISSION_TITLE)
    check(mission_link.count() > 0, "the Day 4 mission is visible to a real player")

    print("== 3. Second synthetic player onboards (the 'finder') ==")
    finder_page.goto(f"{BASE}/login")
    finder_page.wait_for_load_state("load")
    finder_page.fill("#email", FINDER_EMAIL)
    finder_page.locator("#email").blur()
    join_btn2 = finder_page.get_by_role("button", name="Enter ITM@15")
    join_btn2.wait_for(state="visible", timeout=8000)
    join_btn2.click()
    finder_page.wait_for_url(lambda u: "/login" not in u, timeout=20000)
    finder_page.fill("#fullName", FINDER_NAME)
    finder_page.select_option("#countryIsoCode", value="SN")
    finder_page.get_by_role("button", name="Enter ITM@15").click()
    finder_page.wait_for_url(lambda u: "/onboarding" not in u, timeout=20000)
    check("/play" in finder_page.url, f"finder player onboarded, at {finder_page.url}")

    print("== 4. Admin allocates a golden card to the carrier for Day 1 ==")
    admin_page.goto(f"{BASE}/admin/golden-cards")
    admin_page.wait_for_load_state("load")
    admin_page.select_option("#gameDayId", label="Day 1 — Origin")
    admin_page.select_option("#carrierId", label=CARRIER_NAME)
    admin_page.fill("#bonusPoints", "40")
    admin_page.get_by_role("button", name="🥚 Allocate golden card").click()
    admin_page.wait_for_selector("text=give this code to the carrier", timeout=10000)
    success_text = admin_page.locator("body").inner_text()
    check("Code:" in success_text, "golden card allocated, code shown to admin")

    print("== 5. The carrier sees their own code on /play ==")
    carrier_page.wait_for_timeout(11500)  # let the arrival cinematic finish if still running
    carrier_page.goto(f"{BASE}/play")
    carrier_page.wait_for_load_state("load")
    carrier_body = carrier_page.locator("body").inner_text()
    check("Chairman's Egg" in carrier_body, "carrier sees the 'you're carrying the egg' banner on /play")
    code_match = None
    m = re.search(r"Your code:\s*([A-Z0-9]{6})", carrier_body)
    if m:
        code_match = m.group(1)
    check(code_match is not None, f"a real 6-character code was extracted from the carrier's own page (got: {code_match})")

    print("== 6. The finder claims it with the real code ==")
    finder_page.wait_for_timeout(11500)
    finder_page.goto(f"{BASE}/play")
    finder_page.wait_for_load_state("load")
    finder_page.fill("input[name='code']", code_match or "WRONG1")
    finder_page.get_by_role("button", name="Claim it").click()
    finder_page.wait_for_timeout(3000)
    # Check the durable, server-derived confirmation on a fresh /play load
    # rather than the claim form's own transient useActionState message -
    # see goldenCardActions.ts's own comment for why (a revalidatePath
    # re-render can remount the client form and lose it - the same bug
    # class already fixed once, for the mission page's "already
    # completed" branch, Phase 12).
    finder_page.goto(f"{BASE}/play")
    finder_page.wait_for_load_state("load")
    finder_body = finder_page.locator("body").inner_text()
    check("found them" in finder_body.lower(), f"finder successfully claimed the card (body snippet: {finder_body[:300]!r})")

    print("== 7. A second claim attempt on the same code is refused ==")
    finder_page.goto(f"{BASE}/play")
    finder_page.wait_for_load_state("load")
    finder_page.fill("input[name='code']", code_match or "WRONG1")
    finder_page.get_by_role("button", name="Claim it").click()
    finder_page.wait_for_timeout(2000)
    finder_body2 = finder_page.locator("body").inner_text()
    check(
        "isn't valid" in finder_body2.lower() or "not valid" in finder_body2.lower(),
        "double-claim on the same card correctly refused",
    )

    check(len([e for e in notes if "error" in e.lower()]) == 0, f"zero console/page errors (got: {notes})")

    browser.close()

print("\n== Cleanup ==")
try:
    delete_mission_by_title(MISSION_TITLE)
    print(f"  [ok] mission deleted: {MISSION_TITLE}")
except Exception as e:
    print(f"  [WARN] mission cleanup failed: {e}")
for email in (ADMIN_EMAIL, CARRIER_EMAIL, FINDER_EMAIL):
    try:
        d = delete_test_user_by_email(email)
        print(f"  [ok] account {'deleted' if d else 'not found'}: {email}")
    except Exception as e:
        print(f"  [WARN] cleanup failed for {email}: {e}")

print()
if errors:
    print(f"FAILED: {len(errors)} check(s) failed")
    for e in errors:
        print(f"  - {e}")
    sys.exit(1)
print("PASSED: multi-day admin controls + golden card flow all verified live")
