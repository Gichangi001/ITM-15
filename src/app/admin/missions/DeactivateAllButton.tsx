"use client";

import { deactivateAllMissions } from "./actions";

/**
 * Direct request 2026-09-18: "deactivate all missions." Pauses every
 * currently LIVE mission across all 7 days in one audited action -
 * real players may be mid-session right now, so this needs the same
 * explicit confirmation as any other campaign-wide action (matching
 * WallyTriggerForm's global-send confirm()).
 */
export function DeactivateAllButton({ liveCount }: { liveCount: number }) {
  if (liveCount === 0) {
    return null;
  }
  return (
    <form
      action={deactivateAllMissions}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `Pause all ${liveCount} currently live mission${liveCount === 1 ? "" : "s"}? Players won't be able to submit to them until you reactivate each one.`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="btn-secondary self-start text-red-400">
        ⏸ Deactivate all missions ({liveCount} live)
      </button>
    </form>
  );
}
