"use client";

import { useActionState } from "react";
import { awardBonusPoints, type AwardBonusPointsState } from "./actions";

const initialState: AwardBonusPointsState = null;

type Player = { id: string; email: string; full_name: string | null };

export function AwardPointsForm({ players }: { players: Player[] }) {
  const [state, formAction, isPending] = useActionState(awardBonusPoints, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border border-white/10 bg-white/5 p-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="playerId" className="text-xs font-semibold tracking-wide text-muted uppercase">
          Player
        </label>
        <select
          id="playerId"
          name="playerId"
          required
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
        >
          <option value="">Select a player</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.full_name || player.email}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="points" className="text-xs font-semibold tracking-wide text-muted uppercase">
          Points (negative for a penalty)
        </label>
        <input
          id="points"
          name="points"
          type="number"
          required
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reason" className="text-xs font-semibold tracking-wide text-muted uppercase">
          Reason (required)
        </label>
        <input
          id="reason"
          name="reason"
          type="text"
          required
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
        />
      </div>

      {state?.error ? (
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p role="status" className="text-sm text-walumo">
          Awarded.
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className="btn-primary self-start">
        {isPending ? "Awarding…" : "Award points"}
      </button>
    </form>
  );
}
