"use client";

import { useActionState } from "react";
import { allocateGoldenCard, type AllocateGoldenCardState } from "./actions";

const initialState: AllocateGoldenCardState = null;

type Player = { id: string; email: string; full_name: string | null };
type Day = { id: string; day_number: number; title: string };

export function AllocateGoldenCardForm({ players, days }: { players: Player[]; days: Day[] }) {
  const [state, formAction, isPending] = useActionState(allocateGoldenCard, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border border-white/10 bg-white/5 p-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="gameDayId" className="text-xs font-semibold tracking-wide text-muted uppercase">
          Day
        </label>
        <select
          id="gameDayId"
          name="gameDayId"
          required
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
        >
          <option value="">Select a day</option>
          {days.map((day) => (
            // day.title is already "Day N — Title" (real game_days.title) -
            // prefixing another "Day N —" here would duplicate it, the same
            // bug found live in /play's hero card (2026-09-17).
            <option key={day.id} value={day.id}>
              {day.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="carrierId" className="text-xs font-semibold tracking-wide text-muted uppercase">
          Carrier — who gets the golden card?
        </label>
        <select
          id="carrierId"
          name="carrierId"
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
        <label htmlFor="bonusPoints" className="text-xs font-semibold tracking-wide text-muted uppercase">
          Bonus points for whoever finds them
        </label>
        <input
          id="bonusPoints"
          name="bonusPoints"
          type="number"
          min={1}
          defaultValue={50}
          required
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
        />
        <p className="text-xs text-muted">The carrier also earns half this amount for being found.</p>
      </div>

      {state?.error ? (
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p role="status" className="itm-reward text-sm text-walumo">
          {state.success} — give this code to the carrier in person. They can also see it on their own /play page.
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className="btn-golden self-start">
        {isPending ? "Allocating…" : "🥚 Allocate golden card"}
      </button>
    </form>
  );
}
