"use client";

import { deleteMission } from "./actions";

/**
 * Deleting a mission cascades to its challenge/options/submissions
 * (confirmed via pg_constraint - all ON DELETE CASCADE) - a real
 * player's photo/answer can be destroyed by this, not just draft
 * content. The confirm() dialog is the one place that cost gets spelled
 * out before it's irreversible, same pattern as WallyTriggerForm's
 * global-send confirmation.
 */
export function DeleteMissionButton({ missionId, title, submissionCount }: { missionId: string; title: string; submissionCount: number }) {
  return (
    <form
      action={deleteMission}
      onSubmit={(e) => {
        const warning =
          submissionCount > 0
            ? `Delete "${title}"? This will also permanently delete ${submissionCount} real player submission${submissionCount === 1 ? "" : "s"} for it. This cannot be undone.`
            : `Delete "${title}"? This cannot be undone.`;
        if (!window.confirm(warning)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="missionId" value={missionId} />
      <button type="submit" className="btn-secondary px-3 py-1.5 text-xs text-red-400">
        Delete
      </button>
    </form>
  );
}
