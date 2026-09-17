"""E2E: unauthenticated public-page smoke test — the homepage cold-open
(including the DRC line, Experience Transformation Slice 3/9) and the
/login page. No account creation, nothing to clean up.

Run the same way as test_signup_onboarding_play.py (see that file's
header for the exact commands).
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from playwright.sync_api import sync_playwright  # noqa: E402

BASE_URL = os.environ.get("E2E_BASE_URL", "http://localhost:3000")

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
            print("== Homepage cold-open ==")
            page.goto(f"{BASE_URL}/")
            page.wait_for_load_state("load")
            page.wait_for_timeout(9000)  # let the full staged reveal finish (~8.2s)
            body_text = page.locator("body").inner_text()
            check("KINSHASA" in body_text.upper() and "DRC" in body_text.upper(), "homepage cold-open shows the DRC line")
            check("ENTER THE STORY" in body_text.upper(), "homepage cold-open CTA is present")

            print("== Login page ==")
            page.goto(f"{BASE_URL}/login")
            page.wait_for_load_state("load")
            check(page.locator("#email").count() > 0, "login page has an email input")

            print("== Mobile viewport ==")
            page.set_viewport_size({"width": 390, "height": 844})
            page.goto(f"{BASE_URL}/")
            page.wait_for_load_state("load")
            page.wait_for_timeout(9000)
            overflow = page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
            check(not overflow, "homepage has no horizontal overflow at 390px width")

            check(len(console_errors) == 0, f"zero console/page errors (got: {console_errors})")
        finally:
            browser.close()


if __name__ == "__main__":
    run()
    print()
    if failures:
        print(f"FAILED: {len(failures)} check(s) failed")
        for f in failures:
            print(f"  - {f}")
        sys.exit(1)
    print("PASSED: all checks green")
