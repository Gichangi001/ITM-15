"use client";

import { useActionState } from "react";
import { createPoll, type CreatePollState } from "./actions";

const initialState: CreatePollState = null;

export function NewPollForm({ campaignId }: { campaignId: string }) {
  const [state, formAction, isPending] = useActionState(createPoll, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="campaignId" value={campaignId} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-xs font-semibold tracking-wide text-muted uppercase">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-xs font-semibold tracking-wide text-muted uppercase">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
        />
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-white/10 p-4">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">Options</p>
        {[0, 1, 2, 3].map((index) => (
          <input
            key={index}
            type="text"
            name="optionLabel"
            placeholder={`Option ${index + 1}`}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink outline-none focus-visible:border-walumo"
          />
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" name="selfVoteAllowed" className="size-4 accent-(--color-walumo)" />
        Allow self-voting
      </label>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" name="reasonRequired" className="size-4 accent-(--color-walumo)" />
        Require a reason with each vote
      </label>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="resultsVisibility" className="text-xs font-semibold tracking-wide text-muted uppercase">
          Results visibility
        </label>
        <select
          id="resultsVisibility"
          name="resultsVisibility"
          defaultValue="ADMIN_REVEAL"
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
        >
          <option value="LIVE">Live — visible while voting is open</option>
          <option value="AFTER_VOTE">After voting — visible once a player has voted</option>
          <option value="ADMIN_REVEAL">Admin reveal — hidden until an admin reveals</option>
          <option value="NEVER">Never public</option>
        </select>
      </div>

      {state?.error ? (
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className="btn-primary mt-2">
        {isPending ? "Creating…" : "Create poll (draft)"}
      </button>
    </form>
  );
}
