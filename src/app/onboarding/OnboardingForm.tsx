"use client";

import { useActionState, useState } from "react";
import { completeOnboarding, type OnboardingState } from "./actions";
import { WORLD_COUNTRIES, isoToFlagEmoji } from "@/content/worldCountries";

const initialState: OnboardingState = null;

type ExistingCountry = { id: string; iso_code: string };
type Entity = { id: string; name: string; country_id: string };

const fieldClass =
  "rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo";
const labelClass = "text-xs font-semibold tracking-wide text-muted uppercase";

/**
 * Country is picked from the full world list (never limited to whatever an
 * admin pre-seeded — see src/content/worldCountries.ts and
 * src/app/onboarding/actions.ts's get-or-create). Entity has no such
 * external list, so it's a real choice: pick an existing one already
 * recorded under the chosen country, or type a new one.
 */
export function OnboardingForm({
  existingCountries,
  entities,
}: {
  existingCountries: ExistingCountry[];
  entities: Entity[];
}) {
  const [state, formAction, isPending] = useActionState(completeOnboarding, initialState);
  const [countryIsoCode, setCountryIsoCode] = useState("");
  const [addingNewEntity, setAddingNewEntity] = useState(false);

  const matchingCountryId = existingCountries.find((c) => c.iso_code === countryIsoCode)?.id;
  const availableEntities = matchingCountryId
    ? entities.filter((entity) => entity.country_id === matchingCountryId)
    : [];

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
        <label htmlFor="countryIsoCode" className={labelClass}>
          Country
        </label>
        <select
          id="countryIsoCode"
          name="countryIsoCode"
          required
          value={countryIsoCode}
          onChange={(event) => setCountryIsoCode(event.target.value)}
          className={fieldClass}
        >
          <option value="" disabled>
            Select your country
          </option>
          {WORLD_COUNTRIES.map((country) => (
            <option key={country.isoCode} value={country.isoCode}>
              {isoToFlagEmoji(country.isoCode)} {country.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted">
          Not listed under a country yet? Picking it here adds it — you don&apos;t need an
          admin to do that first.
        </p>
      </div>

      {/* Entity is "recommended," not required (Product Guide §5.4) — and
          the picker only makes sense once a country narrows the list, so it
          stays hidden until then rather than showing every entity from
          every country at once. */}
      {countryIsoCode ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="entityId" className={labelClass}>
            Entity / Company (optional)
          </label>

          {!addingNewEntity ? (
            <>
              <select id="entityId" name="entityId" defaultValue="" className={fieldClass}>
                <option value="">Not set</option>
                {availableEntities.map((entity) => (
                  <option key={entity.id} value={entity.id}>
                    {entity.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setAddingNewEntity(true)}
                className="self-start text-xs text-ink underline decoration-walumo decoration-2 underline-offset-4 transition hover:text-walumo"
              >
                {availableEntities.length > 0 ? "Don't see it? Add a new one" : "Add your entity/company"}
              </button>
            </>
          ) : (
            <>
              <input
                id="entityName"
                name="entityName"
                type="text"
                placeholder="Type your entity/company name"
                className={fieldClass}
              />
              {availableEntities.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setAddingNewEntity(false)}
                  className="self-start text-xs text-ink underline decoration-walumo decoration-2 underline-offset-4 transition hover:text-walumo"
                >
                  Choose from the existing list instead
                </button>
              ) : null}
            </>
          )}
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
