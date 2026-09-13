"use client";

import { useActionState, useState } from "react";
import { completeOnboarding, type OnboardingState } from "./actions";

const initialState: OnboardingState = null;

type Country = { id: string; name: string; flag_emoji: string | null };
type Entity = { id: string; name: string; country_id: string };

const fieldClass =
  "rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo";
const labelClass = "text-xs font-semibold tracking-wide text-muted uppercase";

export function OnboardingForm({
  countries,
  entities,
}: {
  countries: Country[];
  entities: Entity[];
}) {
  const [state, formAction, isPending] = useActionState(completeOnboarding, initialState);
  const [countryId, setCountryId] = useState("");

  // Entities aren't nested under countries in the query (they're two flat
  // tables), so filter client-side once a country is picked — the dataset
  // is small (per-company, not per-employee) and this avoids a network
  // round trip on every country change.
  const availableEntities = entities.filter((entity) => entity.country_id === countryId);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fullName" className={labelClass}>
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          autoComplete="name"
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="countryId" className={labelClass}>
          Country
        </label>
        <select
          id="countryId"
          name="countryId"
          required
          value={countryId}
          onChange={(event) => setCountryId(event.target.value)}
          className={fieldClass}
        >
          <option value="" disabled>
            Select your country
          </option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.flag_emoji ? `${country.flag_emoji} ` : ""}
              {country.name}
            </option>
          ))}
        </select>
      </div>

      {/* Entity is "recommended," not required (Product Guide §5.4) — and
          the picker only makes sense once a country narrows the list, so it
          stays hidden until then rather than showing every entity from
          every country at once. */}
      {countryId && availableEntities.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="entityId" className={labelClass}>
            Entity / Company (optional)
          </label>
          <select id="entityId" name="entityId" defaultValue="" className={fieldClass}>
            <option value="">Not set</option>
            {availableEntities.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {state?.error ? (
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className="btn-primary mt-2">
        {isPending ? "Saving…" : "Enter ITM@15"}
      </button>
    </form>
  );
}
