"use client";

import { useActionState } from "react";
import { castVote, type CastVoteState } from "./actions";

const initialState: CastVoteState = null;

type Option = { id: string; label: string };

export function VoteForm({ pollId, options, reasonRequired }: { pollId: string; options: Option[]; reasonRequired: boolean }) {
  const [state, formAction, isPending] = useActionState(castVote, initialState);

  if (state?.success) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-walumo/40 bg-walumo/10 p-5">
        <p className="text-sm text-ink">Thanks — your vote is in.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="pollId" value={pollId} />

      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <label
            key={option.id}
            className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-ink"
          >
            <input type="radio" name="optionId" value={option.id} required className="size-4 accent-(--color-walumo)" />
            {option.label}
          </label>
        ))}
      </div>

      {reasonRequired ? (
        <textarea
          name="reason"
          rows={2}
          required
          placeholder="Why? (required)"
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
        />
      ) : null}

      {state?.error ? (
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className="btn-primary self-start">
        {isPending ? "Casting…" : "Cast vote"}
      </button>
    </form>
  );
}
