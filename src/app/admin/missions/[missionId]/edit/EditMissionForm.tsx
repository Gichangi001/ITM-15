"use client";

import Link from "next/link";
import { updateMissionContent } from "../../actions";

type Mission = {
  id: string;
  title: string;
  description: string | null;
  base_points: number;
  unity_points: number;
  is_unity_challenge: boolean;
};

type Challenge = { id: string; type: string; prompt: string } | null;
type Option = { id: string; label: string; is_correct: boolean };

const CHALLENGE_TYPE_LABELS: Record<string, string> = {
  SINGLE_CHOICE: "Single choice quiz",
  MULTIPLE_CHOICE: "Multiple choice quiz",
  FREE_TEXT: "Free text (moderator-reviewed)",
  PHOTO_UPLOAD: "Photo upload (moderator-reviewed)",
};

export function EditMissionForm({
  mission,
  challenge,
  options,
  submissionCount,
}: {
  mission: Mission;
  challenge: Challenge;
  options: Option[];
  submissionCount: number;
}) {
  const isChoiceType = challenge?.type === "SINGLE_CHOICE" || challenge?.type === "MULTIPLE_CHOICE";

  return (
    <form action={updateMissionContent} className="flex flex-col gap-4">
      <input type="hidden" name="missionId" value={mission.id} />

      {submissionCount > 0 ? (
        <p className="itm-nudge rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-muted">
          {submissionCount} player{submissionCount === 1 ? " has" : "s have"} already submitted to this mission.
          Editing the prompt or options won&apos;t change their existing answers.
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-xs font-semibold tracking-wide text-muted uppercase">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={mission.title}
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
          defaultValue={mission.description ?? ""}
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
            defaultValue={mission.base_points}
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
            defaultValue={mission.unity_points}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
          />
        </div>
      </div>

      <label htmlFor="isUnityChallenge" className="flex items-center gap-2 text-sm text-ink">
        <input
          id="isUnityChallenge"
          name="isUnityChallenge"
          type="checkbox"
          defaultChecked={mission.is_unity_challenge}
          className="size-4 accent-(--color-walumo)"
        />
        Cross-country unity challenge (awards unity points on approval)
      </label>

      {challenge ? (
        <>
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">
              Challenge type — {CHALLENGE_TYPE_LABELS[challenge.type] ?? challenge.type}
            </p>
            <p className="text-xs text-muted">Not editable here — changing the challenge type after it may have real submissions isn&apos;t supported yet.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="prompt" className="text-xs font-semibold tracking-wide text-muted uppercase">
              Prompt
            </label>
            <textarea
              id="prompt"
              name="prompt"
              rows={2}
              defaultValue={challenge.prompt}
              required
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
            />
          </div>

          {isChoiceType && options.length > 0 ? (
            <div className="flex flex-col gap-2 rounded-lg border border-white/10 p-4">
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                Options — check the correct one(s)
              </p>
              {options.map((option) => (
                <div key={option.id} className="flex items-center gap-2">
                  <input type="hidden" name="optionId" value={option.id} />
                  <input
                    type="checkbox"
                    name="optionCorrect"
                    value={option.id}
                    defaultChecked={option.is_correct}
                    className="size-4 accent-(--color-walumo)"
                  />
                  <input
                    type="text"
                    name="optionLabel"
                    defaultValue={option.label}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink outline-none focus-visible:border-walumo"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <p className="text-sm text-muted">This mission has no challenge configured yet.</p>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary">
          Save changes
        </button>
        <Link href="/admin/missions" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
