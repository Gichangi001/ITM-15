"use client";

import { useActionState, useState } from "react";
import { createMission, type CreateMissionState } from "./actions";
import { CHALLENGE_TYPES } from "@/lib/content/schemas";

const initialState: CreateMissionState = null;

const CHALLENGE_TYPE_LABELS: Record<(typeof CHALLENGE_TYPES)[number], string> = {
  SINGLE_CHOICE: "Single choice quiz",
  MULTIPLE_CHOICE: "Multiple choice quiz",
  FREE_TEXT: "Free text (moderator-reviewed)",
  PHOTO_UPLOAD: "Photo upload (moderator-reviewed)",
};

export function NewMissionForm() {
  const [state, formAction, isPending] = useActionState(createMission, initialState);
  const [challengeType, setChallengeType] = useState<(typeof CHALLENGE_TYPES)[number]>("SINGLE_CHOICE");
  const isChoiceType = challengeType === "SINGLE_CHOICE" || challengeType === "MULTIPLE_CHOICE";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="dayNumber" className="text-xs font-semibold tracking-wide text-muted uppercase">
          Day
        </label>
        <select
          id="dayNumber"
          name="dayNumber"
          defaultValue="1"
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
        >
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <option key={day} value={day}>
              Day {day}
            </option>
          ))}
        </select>
      </div>

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
        <label htmlFor="slug" className="text-xs font-semibold tracking-wide text-muted uppercase">
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          placeholder="find-a-friend"
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

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="basePoints" className="text-xs font-semibold tracking-wide text-muted uppercase">
            Base points
          </label>
          <input
            id="basePoints"
            name="basePoints"
            type="number"
            min={0}
            defaultValue={0}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="unityPoints" className="text-xs font-semibold tracking-wide text-muted uppercase">
            Unity points
          </label>
          <input
            id="unityPoints"
            name="unityPoints"
            type="number"
            min={0}
            defaultValue={0}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
          />
        </div>
      </div>

      <label htmlFor="isUnityChallenge" className="flex items-center gap-2 text-sm text-ink">
        <input
          id="isUnityChallenge"
          name="isUnityChallenge"
          type="checkbox"
          className="size-4 accent-(--color-walumo)"
        />
        Cross-country unity challenge (awards unity points on approval)
      </label>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="challengeType" className="text-xs font-semibold tracking-wide text-muted uppercase">
          Challenge type
        </label>
        <select
          id="challengeType"
          name="challengeType"
          value={challengeType}
          onChange={(e) => setChallengeType(e.target.value as (typeof CHALLENGE_TYPES)[number])}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
        >
          {CHALLENGE_TYPES.map((type) => (
            <option key={type} value={type}>
              {CHALLENGE_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="prompt" className="text-xs font-semibold tracking-wide text-muted uppercase">
          Prompt
        </label>
        <textarea
          id="prompt"
          name="prompt"
          rows={2}
          required
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
        />
      </div>

      {isChoiceType ? (
        <div className="flex flex-col gap-2 rounded-lg border border-white/10 p-4">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">
            Options — check the correct one(s)
          </p>
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="checkbox"
                name="optionCorrect"
                value={index}
                className="size-4 accent-(--color-walumo)"
              />
              <input
                type="text"
                name="optionLabel"
                placeholder={`Option ${index + 1}`}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink outline-none focus-visible:border-walumo"
              />
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="startsAt" className="text-xs font-semibold tracking-wide text-muted uppercase">
            Starts (optional)
          </label>
          <input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="endsAt" className="text-xs font-semibold tracking-wide text-muted uppercase">
            Ends (optional)
          </label>
          <input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="maxAttempts" className="text-xs font-semibold tracking-wide text-muted uppercase">
          Max attempts (optional)
        </label>
        <input
          id="maxAttempts"
          name="maxAttempts"
          type="number"
          min={1}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
        />
      </div>

      {state?.error ? (
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className="btn-primary mt-2">
        {isPending ? "Creating…" : "Create mission (draft)"}
      </button>
    </form>
  );
}
