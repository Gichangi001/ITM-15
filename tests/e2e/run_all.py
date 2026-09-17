"""Runs every E2E test file in this directory in sequence, against a
server that's already running at E2E_BASE_URL (default
http://localhost:3000). Exits non-zero if any test fails.

Typical use — production build (fast, recommended):

    pnpm build && pnpm start &
    python3 tests/e2e/run_all.py

Or let the webapp-testing skill manage the server lifecycle for you:

    python3 ~/.claude/skills/webapp-testing/scripts/with_server.py \
      --server "pnpm start" --port 3000 -- \
      python3 tests/e2e/run_all.py
"""

import glob
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

TEST_FILES = sorted(
    f
    for f in glob.glob(os.path.join(HERE, "test_*.py"))
)


def main() -> int:
    if not TEST_FILES:
        print("No test_*.py files found in tests/e2e/")
        return 1

    overall_ok = True
    for test_file in TEST_FILES:
        name = os.path.relpath(test_file, HERE)
        print(f"\n{'=' * 60}\nRunning {name}\n{'=' * 60}")
        result = subprocess.run([sys.executable, test_file], cwd=HERE)
        if result.returncode != 0:
            overall_ok = False
            print(f"\n>>> {name} FAILED (exit {result.returncode})")
        else:
            print(f"\n>>> {name} passed")

    print(f"\n{'=' * 60}")
    if overall_ok:
        print("ALL E2E TESTS PASSED")
        return 0
    print("SOME E2E TESTS FAILED — see above")
    return 1


if __name__ == "__main__":
    sys.exit(main())
