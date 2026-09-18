"use client";

import { useActionState } from "react";
import { claimGoldenCard, type ClaimGoldenCardState } from "@/app/(player)/play/goldenCardActions";

const initialState: ClaimGoldenCardState = null;

export function ClaimGoldenCardForm() {
  const [state, formAction, isPending] = useActionState(claimGoldenCard, initialState);

  return (
    <div className="itm-card flex flex-col gap-3 p-5">
      <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">🥚 Found someone with a golden card?</p>
      <p className="text-sm text-muted">
        Somewhere today, one person is quietly carrying the Chairman&apos;s Egg. Find them, get their code, and enter
        it here.
      </p>
      <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
        <input
          name="code"
          placeholder="Enter their code"
          required
          maxLength={12}
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 uppercase text-ink outline-none focus-visible:border-walumo"
        />
        <button type="submit" disabled={isPending} className="btn-golden">
          {isPending ? "Checking…" : "Claim it"}
        </button>
      </form>
      {state?.error ? (
        <p role="alert" className="itm-nudge text-sm text-red-400">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p role="status" className="itm-reward text-sm text-gold">
          {state.success}
        </p>
      ) : null}
    </div>
  );
}
