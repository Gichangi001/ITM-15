"""E2E: instant sign-in -> onboarding -> the DRC arrival cinematic ->
/play home -> a tour of every player-shell route.

Run against a already-running server (production build strongly
recommended — `pnpm build && pnpm start` starts in ~150ms; `pnpm dev`'s
per-route cold-compile under Turbopack can take 30s+ per first visit and
caused real flakiness when this suite was first written):

    pnpm build && pnpm start &
    python3 tests/e2e/test_signup_onboarding_play.py

Or via the webapp-testing skill's server helper, which manages the
server lifecycle for you:

    python3 ~/.claude/skills/webapp-testing/scripts/with_server.py \
      --server "pnpm start" --port 3000 -- \
      python3 tests/e2e/test_signup_onboarding_play.py

No pytest/requests dependency — plain assertions, stdlib only, matching
this project's existing "don't add a dependency for this" convention.
Exits non-zero on any failure so it's CI-usable as-is.

This is the first committed E2E test in this project's history (a
long-disclosed gap — every prior phase's verification lived in
throwaway scratchpad scripts). Written 2026-09-17 after finally trying
the webapp-testing skill, which found two real bugs in the Experience
Transformation redesign that ten prior sessions of code review missed
(see the two asserts below marked "regression" — they exist specifically
because both bugs were real and shipped before being caught here).
"""

import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from playwright.sync_api import sync_playwright  # noqa: E402
from _lib.cleanup import delete_test_user_by_email  # noqa: E402

BASE_URL = os.environ.get("E2E_BASE_URL", "http://localhost:3000")
TEST_EMAIL = f"e2e.signup.{random.randint(100000, 999999)}@itm15.test"

failures: list[str] = []


def check(condition: bool, message: str) -> None:
    if condition:
        print(f"  [ok] {message}")
    else:
        print(f"  [FAIL] {message}")
        failures.append(message)


def run() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        page.set_default_navigation_timeout(60000)
        page.set_default_timeout(20000)

        console_errors: list[str] = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: console_errors.append(f"pageerror: {exc}"))

        try:
            print("== Homepage ==")
            page.goto(f"{BASE_URL}/")
            page.wait_for_load_state("load")
            check("ITM@15" in page.title(), f"homepage title contains ITM@15 (got: {page.title()!r})")

            print("== Instant sign-in ==")
            page.goto(f"{BASE_URL}/login")
            page.wait_for_load_state("load")
            page.fill("#email", TEST_EMAIL)
            page.locator("#email").blur()
            enter_btn = page.get_by_role("button", name="Enter ITM@15")
            enter_btn.wait_for(state="visible", timeout=8000)
            enter_btn.click()
            page.wait_for_url(lambda url: "/login" not in url, timeout=20000)
            check("/onboarding" in page.url, f"instant sign-in reaches /onboarding (got: {page.url})")

            print("== Onboarding ==")
            page.fill("#fullName", "E2E Test")
            page.select_option("#countryIsoCode", value="KE")
            page.get_by_role("button", name="Enter ITM@15").click()
            page.wait_for_url(lambda url: "/onboarding" not in url, timeout=20000)
            check("/play" in page.url, f"onboarding completion reaches /play (got: {page.url})")

            print("== DRC arrival cinematic ==")
            dialog = page.locator('[role="dialog"]')
            try:
                dialog.wait_for(state="visible", timeout=5000)
            except Exception:
                pass
            check(dialog.count() > 0, "arrival cinematic dialog is present")
            if dialog.count() > 0:
                bg = dialog.evaluate("el => getComputedStyle(el).backgroundColor")
                # regression: the dialog previously used bg-bg/98 (98% opacity),
                # which let the page behind it visibly "ghost" through over a
                # busy background once this became a 10+ second cinematic
                # instead of a 1-second dismiss. Must be fully opaque (alpha 1
                # or no alpha channel at all).
                is_opaque = bg.startswith("rgb(") or bg.endswith(", 1)") or ", 1)" in bg
                check(is_opaque, f"regression: arrival cinematic background is fully opaque (got: {bg})")

            page.wait_for_timeout(11000)  # let the full beat sequence play out
            skip_or_cta = page.locator("button.btn-golden")
            if skip_or_cta.count() > 0:
                skip_or_cta.click()
                page.wait_for_timeout(500)

            print("== /play home ==")
            page.goto(f"{BASE_URL}/play")
            page.wait_for_load_state("load")
            hero_text = page.locator("main").inner_text()
            # `text-transform: uppercase` means inner_text() returns "DAY 1",
            # not "Day 1" — compare case-insensitively rather than assuming
            # the source-code casing survives rendering.
            hero_text_upper = hero_text.upper()
            if "DAY 1" not in hero_text_upper:
                print(f"  [debug] /play main text was: {hero_text[:500]!r}")
            check("DAY 1" in hero_text_upper, "play home shows a Day 1 mission card")
            # regression: the hero card used to render "Day 1 · Day 1 — Origin"
            # because the mission's own dayTitle already includes "Day N".
            check("DAY 1 · DAY 1" not in hero_text_upper, "regression: no duplicated 'Day 1 · Day 1' in the hero card")

            print("== Player shell tour ==")
            for path in [
                "/play/day/1",
                "/leaderboards",
                "/achievements",
                "/passport",
                "/gallery",
                "/notifications",
                "/profile",
            ]:
                page.goto(f"{BASE_URL}{path}")
                page.wait_for_load_state("load")
                body_text = page.locator("body").inner_text()
                check("Application error" not in body_text and "500" not in page.title(), f"{path} renders without an error boundary")

            check(len(console_errors) == 0, f"zero console/page errors across the whole flow (got: {console_errors})")

        finally:
            browser.close()
            print("== Cleanup ==")
            try:
                deleted = delete_test_user_by_email(TEST_EMAIL)
                print(f"  [ok] test account {'deleted' if deleted else 'not found (nothing to clean up)'}: {TEST_EMAIL}")
            except Exception as exc:
                print(f"  [WARN] cleanup failed, a synthetic test account may remain: {exc}")
                failures.append(f"cleanup failed for {TEST_EMAIL}: {exc}")


if __name__ == "__main__":
    run()
    print()
    if failures:
        print(f"FAILED: {len(failures)} check(s) failed")
        for f in failures:
            print(f"  - {f}")
        sys.exit(1)
    print("PASSED: all checks green")
