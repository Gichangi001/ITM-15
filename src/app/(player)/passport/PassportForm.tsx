"use client";

import { useActionState } from "react";
import { updatePassportCard, type UpdatePassportState } from "./actions";

const initialState: UpdatePassportState = null;

const fieldClass =
  "rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo";
const labelClass = "text-xs font-semibold tracking-wide text-muted uppercase";

export function PassportForm({
  phone,
  locationText,
  companyText,
}: {
  phone: string | null;
  locationText: string | null;
  companyText: string | null;
}) {
  const [state, formAction, isPending] = useActionState(updatePassportCard, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className={labelClass}>
          Phone (optional)
        </label>
        <input id="phone" name="phone" type="tel" defaultValue={phone ?? ""} className={fieldClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="locationText" className={labelClass}>
          Location (optional)
        </label>
        <input
          id="locationText"
          name="locationText"
          type="text"
          placeholder="e.g. Nairobi office"
          defaultValue={locationText ?? ""}
          className={fieldClass}
        />
        <p className="text-xs text-muted">
          Typed by you — never your live location.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="companyText" className={labelClass}>
          Entity / Company (optional)
        </label>
        <input
          id="companyText"
          name="companyText"
          type="text"
          defaultValue={companyText ?? ""}
          className={fieldClass}
        />
      </div>

      {state?.error ? (
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p role="status" className="text-sm text-walumo">
          Saved.
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className="btn-primary mt-2 self-start">
        {isPending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
