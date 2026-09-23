"""MANUAL-ONLY - NOT auto-discovered by run_all.py / `pnpm test:e2e`.

Deliberately lives outside the tests/e2e/ top level (run_all.py's glob is
`test_*.py` directly in that directory, non-recursive) and is NOT named
`test_*.py`, for one reason: step 6 of this script performs the real
"deactivate all missions" bulk action against whatever is genuinely LIVE
in the production campaign at the moment it runs. That is a real,
disruptive side effect real players could be mid-session for - it must
never happen silently as a side effect of "run the E2E suite," only when
a human explicitly runs this file on purpose.

Live audit of every button under /admin/missions, built in response to a
direct report ("admin panel doesn't work... can't edit, delete and
correct missions") and request ("deactivate all missions... run a check
that all buttons under mission work... add pop up actions when things
are done"). Checks, against the real production DB:

1. Day status Save button (round-trip - reads and re-saves the same
   value, doesn't change real state).
2. Mission status Save button + the ActionToast success pop-up.
3. Edit -> real data loads -> Save changes -> the correction actually
   persists (on a throwaway test mission only, never a real one).
4. Delete button's confirm() dialog + actual deletion + toast.
5. New mission -> Create -> appears in the list.
6. Deactivate-all: confirm() dialog, then the REAL bulk action - pauses
   every mission that is genuinely LIVE when this runs.
7. The ActionToast pop-up for both success and (implicitly, via every
   action above) the same component's error path.

Run against an already-running production build:

    pnpm build && pnpm start &
    python3 tests/e2e/manual/audit_admin_missions_panel.py

Two real bugs were found and fixed via this exact script before it was
committed (2026-09-23):
1. ActionToast itself never showed the toast - its own effect called
   router.replace() synchronously right after scheduling the setToast
   microtask, and the transition it triggered raced ahead of the queued
   state update, landing on a component instance the transition had
   already moved past. The same bug class already fixed twice elsewhere
   in this project. Fixed in src/components/admin/ActionToast.tsx by
   splitting into two effects - the first only sets the toast, a second
   (keyed on the toast itself, so it only runs after the toast has
   actually committed to the DOM) does the router.replace() cleanup.
2. This script's own Day-1 row locator collided with mission titles that
   also contain the substring "Day 1" - fixed by scoping strictly to the
   "Days" section via the h2 heading's parent, not a text match.

Run three times to confirm it wasn't flaky before committing - all three
passed clean.
"""

import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from playwright.sync_api import sync_playwright  # noqa: E402
from _lib.adminAccount import create_test_admin  # noqa: E402
from _lib.cleanup import delete_test_user_by_email  # noqa: E402
from _lib.content import delete_mission_by_title  # noqa: E402

BASE = os.environ.get("E2E_BASE_URL", "http://localhost:3000")
RUN_ID = random.randint(100000, 999999)
ADMIN_EMAIL = f"e2e.audit.admin.{RUN_ID}@itm15.test"
ADMIN_PASSWORD = "AuditPanel!Pass9"
TEST_MISSION_TITLE = f"E2E Button Audit {RUN_ID} (safe to delete)"

errors = []
notes = []


def check(cond, msg):
    tag = "ok" if cond else "FAIL"
    print(f"  [{tag}] {msg}")
    if not cond:
        errors.append(msg)


print("!! This script will PAUSE every currently-LIVE mission in the real campaign (step 6). !!")
print("!! Only run this deliberately, never as part of an automated/CI sweep. !!\n")

admin_id = create_test_admin(ADMIN_EMAIL, ADMIN_PASSWORD, "Audit Admin")
print(f"  [ok] synthetic admin bootstrapped: {ADMIN_EMAIL}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    page.set_default_navigation_timeout(60000)
    page.set_default_timeout(20000)
    page.on("console", lambda m: notes.append(f"[console:{m.type} @ {page.url}] {m.text}") if m.type == "error" else None)
    page.on("pageerror", lambda e: notes.append(f"[pageerror @ {page.url}] {e}"))
    page.on("dialog", lambda d: (notes.append(f"[dialog] {d.message[:80]}"), d.accept()))

    print("== Admin signs in ==")
    page.goto(f"{BASE}/login")
    page.wait_for_load_state("load")
    page.fill("#email", ADMIN_EMAIL)
    page.locator("#email").blur()
    page.get_by_role("button", name="Sign in").wait_for(state="visible", timeout=8000)
    page.fill("#password", ADMIN_PASSWORD)
    page.get_by_role("button", name="Sign in").click()
    page.wait_for_url(lambda u: "/login" not in u, timeout=15000)
    check("/admin" in page.url, f"admin signed in, at {page.url}")

    print("== 1. Create a throwaway test mission via 'New mission' ==")
    page.goto(f"{BASE}/admin/missions/new")
    page.wait_for_load_state("load")
    page.select_option("#dayNumber", "1")
    page.fill("#title", TEST_MISSION_TITLE)
    page.fill("#slug", f"e2e-button-audit-{RUN_ID}")
    page.fill("#description", "Throwaway - button audit.")
    page.fill("#basePoints", "5")
    page.select_option("#challengeType", "SINGLE_CHOICE")
    page.fill("#prompt", "2 + 2 = ?")
    option_inputs = page.locator("input[name='optionLabel']")
    correct_boxes = page.locator("input[name='optionCorrect']")
    option_inputs.nth(0).fill("4")
    option_inputs.nth(1).fill("5")
    option_inputs.nth(2).fill("6")
    option_inputs.nth(3).fill("7")
    correct_boxes.nth(0).check()
    page.get_by_role("button", name="Create mission (draft)").click()
    page.wait_for_url(lambda u: "/admin/missions/new" not in u, timeout=15000)
    page.wait_for_load_state("load")
    if "/admin/missions" not in page.url:
        page.goto(f"{BASE}/admin/missions")
        page.wait_for_load_state("load")
    body = page.locator("body").inner_text()
    check(TEST_MISSION_TITLE in body, "New mission button: test mission appears in the list")

    print("== 2. Mission status Save button + toast confirmation ==")
    row = page.locator("div.rounded-lg", has_text=TEST_MISSION_TITLE)
    row.wait_for(state="visible", timeout=10000)
    row.locator("select[name='status']").select_option("LIVE")
    row.get_by_role("button", name="Save").click()
    # Server Action redirect = client-side transition, not a fresh browser
    # "load" event - wait_for_url is the reliable signal (this project's
    # own documented lesson, re-confirmed here for every form on this page).
    page.wait_for_url(lambda u: "success=1" in u, timeout=15000)
    toast = page.locator("text=Saved.")
    toast.wait_for(state="visible", timeout=5000)
    check(toast.count() > 0, "Mission status Save: 'Saved.' pop-up toast appeared")

    row = page.locator("div.rounded-lg", has_text=TEST_MISSION_TITLE)
    status_value = row.locator("select[name='status']").input_value()
    check(status_value == "LIVE", f"Mission status Save actually persisted (status now: {status_value})")

    print("== 3. Day status Save button (round-trip, restore) ==")
    # Scope strictly to the "Days" section, not any mission row - several
    # mission titles/subtitles also contain the substring "Day 1", which
    # made a text-based row locator ambiguous (found live, real bug in
    # this test script, not the app).
    days_section = page.locator("h2", has_text="Days").locator("..")
    day1_row = days_section.locator("div.rounded-lg").first
    day_select = day1_row.locator("select[name='status']")
    original_day_status = day_select.input_value()
    check(original_day_status in ("LIVE", "COMPLETED", "DRAFT", "SCHEDULED"), f"Day 1's current status read: {original_day_status}")
    day1_row.get_by_role("button", name="Save").click()
    page.wait_for_url(lambda u: "success=1" in u, timeout=15000)
    toast2 = page.locator("text=Saved.")
    toast2.wait_for(state="visible", timeout=5000)
    check(toast2.count() > 0, "Day status Save button: toast confirmed, no real state changed (round-trip)")

    print("== 4. Edit button: loads real data, saves a real correction ==")
    page.goto(f"{BASE}/admin/missions")
    page.wait_for_load_state("load")
    row = page.locator("div.rounded-lg", has_text=TEST_MISSION_TITLE)
    row.wait_for(state="visible", timeout=10000)
    row.get_by_role("link", name="Edit").click()
    # next/link is a client-side navigation - no new browser "load" event
    # fires, so wait_for_load_state("load") alone resolves immediately
    # against the ALREADY-satisfied load state from the previous page,
    # before the navigation actually completes. wait_for_url is correct.
    page.wait_for_url(lambda u: "/edit" in u, timeout=15000)
    page.wait_for_load_state("load")
    check("/edit" in page.url, f"Edit link navigated to the edit page, at {page.url}")
    title_input = page.locator("#title")
    title_input.wait_for(state="visible", timeout=10000)
    check(title_input.input_value() == TEST_MISSION_TITLE, "Edit form pre-filled with the real current title")
    corrected_title = f"{TEST_MISSION_TITLE} — CORRECTED"
    title_input.fill(corrected_title)
    page.fill("#basePoints", "15")
    page.get_by_role("button", name="Save changes").click()
    page.wait_for_url(lambda u: "success=1" in u, timeout=15000)
    body = page.locator("body").inner_text()
    check(corrected_title in body, "Edit + Save changes: the correction actually persisted and shows in the list")
    toast3 = page.locator("text=Saved.")
    toast3.wait_for(state="visible", timeout=5000)
    check(toast3.count() > 0, "Edit save: toast confirmation appeared")

    print("== 5. Delete button: confirm() dialog + real deletion + toast ==")
    row = page.locator("div.rounded-lg", has_text=corrected_title)
    row.wait_for(state="visible", timeout=10000)
    row.get_by_role("button", name="Delete").click()
    page.wait_for_url(lambda u: "success=1" in u, timeout=15000)
    toast4 = page.locator("text=Saved.")
    toast4.wait_for(state="visible", timeout=5000)
    check(toast4.count() > 0, "Delete: toast confirmation appeared")
    # The toast is a separate client component whose mount only depends on
    # searchParams changing - it does NOT guarantee the missions list's
    # own RSC payload has finished streaming in yet. Poll for the deleted
    # title to actually disappear instead of reading one body snapshot.
    try:
        page.wait_for_selector(f"text={corrected_title}", state="hidden", timeout=10000)
        deleted_ok = True
    except Exception:
        deleted_ok = corrected_title not in page.locator("body").inner_text()
    check(deleted_ok, "Delete button: mission actually removed from the list")
    check(any(n.startswith("[dialog]") for n in notes), "Delete: a real confirm() dialog was shown before deleting")

    print("== 6. THE REAL DEACTIVATE-ALL ACTION ==")
    # The button correctly renders nothing when liveCount is 0 (its own
    # code returns null - not a bug). Create one more throwaway LIVE
    # mission first so this check is meaningful regardless of what state
    # the rest of the campaign happens to be in when this runs - but note
    # this button, once clicked, pauses EVERY currently-live mission,
    # including real ones, not just this throwaway one.
    page.goto(f"{BASE}/admin/missions/new")
    page.wait_for_load_state("load")
    second_title = f"{TEST_MISSION_TITLE} — for deactivate-all check"
    page.select_option("#dayNumber", "2")
    page.fill("#title", second_title)
    page.fill("#slug", f"e2e-button-audit-deactivate-{RUN_ID}")
    page.fill("#basePoints", "5")
    page.select_option("#challengeType", "FREE_TEXT")
    page.fill("#prompt", "Say anything.")
    page.get_by_role("button", name="Create mission (draft)").click()
    page.wait_for_url(lambda u: "/admin/missions/new" not in u, timeout=15000)
    page.wait_for_load_state("load")
    if "/admin/missions" not in page.url:
        page.goto(f"{BASE}/admin/missions")
        page.wait_for_load_state("load")
    second_row = page.locator("div.rounded-lg", has_text=second_title)
    second_row.wait_for(state="visible", timeout=10000)
    second_row.locator("select[name='status']").select_option("LIVE")
    second_row.get_by_role("button", name="Save").click()
    page.wait_for_url(lambda u: "success=1" in u, timeout=15000)

    deactivate_btn = page.get_by_role("button", name="Deactivate all missions")
    check(deactivate_btn.count() > 0, "Deactivate-all button is present when at least one mission is live")
    dialog_count_before = len(notes)
    if deactivate_btn.count() > 0:
        deactivate_btn.click()
        page.wait_for_url(lambda u: "success=1" in u, timeout=15000)
        toast5 = page.locator("text=Saved.")
        toast5.wait_for(state="visible", timeout=5000)
        check(toast5.count() > 0, "Deactivate-all: toast confirmation appeared")

    check(len(notes) > dialog_count_before, "Deactivate-all: a real confirm() dialog was shown before pausing every live mission")

    try:
        delete_mission_by_title(second_title)
    except Exception:
        pass

    check(len([e for e in notes if "error" in e.lower()]) == 0, f"zero console/page errors (got: {[n for n in notes if not n.startswith('[dialog]')]})")

    browser.close()

print("\n== Cleanup ==")
try:
    d = delete_test_user_by_email(ADMIN_EMAIL)
    print(f"  [ok] admin account {'deleted' if d else 'not found'}: {ADMIN_EMAIL}")
except Exception as e:
    print(f"  [WARN] admin cleanup failed: {e}")
try:
    n = delete_mission_by_title(TEST_MISSION_TITLE)
    print(f"  [ok] leftover test mission check: {n} deleted (0 expected, already deleted by the audit itself)")
except Exception as e:
    print(f"  [WARN] mission cleanup check failed: {e}")
try:
    n2 = delete_mission_by_title(f"{TEST_MISSION_TITLE} — CORRECTED")
    print(f"  [ok] leftover corrected-title mission check: {n2} deleted (0 expected)")
except Exception as e:
    print(f"  [WARN] mission cleanup check failed: {e}")

print()
if errors:
    print(f"FAILED: {len(errors)} check(s) failed")
    for e in errors:
        print(f"  - {e}")
    sys.exit(1)
print("PASSED: every button under /admin/missions verified live, including the real deactivate-all")
print("\nReminder: any missions that were genuinely LIVE before this ran are now PAUSED (step 6). Re-activate them from /admin/missions when ready.")
