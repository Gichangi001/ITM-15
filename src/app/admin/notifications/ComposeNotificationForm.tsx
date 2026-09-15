"use client";

import { useActionState, useState } from "react";
import { composeNotification, type ComposeNotificationState } from "./actions";

const initialState: ComposeNotificationState = null;

type Country = { id: string; name: string; flag_emoji: string | null };
type Entity = { id: string; name: string };
type AudienceType = "GLOBAL" | "COUNTRY" | "ENTITY" | "PLAYER";

const selectClass =
  "rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo";
const labelClass = "text-xs font-semibold tracking-wide text-muted uppercase";

export function ComposeNotificationForm({ countries, entities }: { countries: Country[]; entities: Entity[] }) {
  const [state, formAction, isPending] = useActionState(composeNotification, initialState);
  const [audienceType, setAudienceType] = useState<AudienceType>("GLOBAL");
  const [confirmed, setConfirmed] = useState(false);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        // Product Guide §16.3's confirmation-before-mass-send rule, same
        // pattern as WallyTriggerForm's GLOBAL confirm — required only for
        // the audience that reaches the whole campaign at once.
        if (audienceType === "GLOBAL" && !confirmed) {
          event.preventDefault();
          setConfirmed(window.confirm("Send this notification to every active player?"));
        }
      }}
      className="flex flex-col gap-4 rounded-lg border border-white/10 bg-white/5 p-5"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="audienceType" className={labelClass}>
          Audience
        </label>
        <select
          id="audienceType"
          name="audienceType"
          value={audienceType}
          onChange={(event) => {
            setAudienceType(event.target.value as AudienceType);
            setConfirmed(false);
          }}
          className={selectClass}
        >
          <option value="GLOBAL">Everyone</option>
          <option value="COUNTRY">Country</option>
          <option value="ENTITY">Entity</option>
          <option value="PLAYER">One player</option>
        </select>
      </div>

      {audienceType === "COUNTRY" ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="countryId" className={labelClass}>
            Country
          </label>
          <select id="countryId" name="countryId" required defaultValue="" className={selectClass}>
            <option value="" disabled>
              Select a country
            </option>
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.flag_emoji ? `${country.flag_emoji} ` : ""}
                {country.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {audienceType === "ENTITY" ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="entityId" className={labelClass}>
            Entity
          </label>
          <select id="entityId" name="entityId" required defaultValue="" className={selectClass}>
            <option value="" disabled>
              Select an entity
            </option>
            {entities.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {audienceType === "PLAYER" ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="playerEmail" className={labelClass}>
            Player email
          </label>
          <input id="playerEmail" name="playerEmail" type="email" required className={selectClass} />
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className={labelClass}>
          Title
        </label>
        <input id="title" name="title" type="text" required maxLength={120} className={selectClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className={labelClass}>
          Message
        </label>
        <textarea id="message" name="message" required maxLength={500} rows={3} className={selectClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="severity" className={labelClass}>
          Severity
        </label>
        <select id="severity" name="severity" defaultValue="INFO" className={selectClass}>
          <option value="INFO">Info</option>
          <option value="CELEBRATION">Celebration</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ctaLabel" className={labelClass}>
            CTA label (optional)
          </label>
          <input id="ctaLabel" name="ctaLabel" type="text" maxLength={60} className={selectClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ctaHref" className={labelClass}>
            CTA link (optional)
          </label>
          <input id="ctaHref" name="ctaHref" type="text" maxLength={300} placeholder="/play" className={selectClass} />
        </div>
      </div>

      {state?.error ? (
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p role="status" className="text-sm text-walumo">
          {state.success}
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className="btn-primary self-start">
        {isPending ? "Sending…" : "Send now"}
      </button>
    </form>
  );
}
