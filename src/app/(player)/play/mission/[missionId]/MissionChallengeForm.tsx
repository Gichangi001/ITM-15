"use client";

import { useActionState, useState } from "react";
import { submitAnswer, type SubmitAnswerState } from "./actions";
import { createClient } from "@/lib/supabase/client";

type ChallengeOption = { id: string; label: string };

type Challenge = {
  id: string;
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "FREE_TEXT" | "PHOTO_UPLOAD";
  prompt: string;
  options: ChallengeOption[];
};

const initialState: SubmitAnswerState = null;

// Brief §3/§14: avoid "Submit" as a generic exam verb — say what the
// action actually does for this challenge type.
const SUBMIT_LABEL: Record<Challenge["type"], string> = {
  SINGLE_CHOICE: "Lock it in",
  MULTIPLE_CHOICE: "Lock it in",
  FREE_TEXT: "Send it",
  PHOTO_UPLOAD: "Send your photo",
};

export function MissionChallengeForm({ challenge, playerId }: { challenge: Challenge; playerId: string }) {
  const [state, formAction, isPending] = useActionState(submitAnswer, initialState);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${playerId}/${challenge.id}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("challenge-submissions").upload(path, file, {
        upsert: false,
      });
      if (error) {
        setUploadError("Upload failed. Try a smaller image (max 10MB, JPEG/PNG/WebP).");
        return;
      }
      setUploadedPath(path);
    } finally {
      setIsUploading(false);
    }
  }

  if (state?.success) {
    return (
      <div className="itm-reward flex flex-col gap-2 p-5">
        <p className="text-sm text-ink">{state.success.message}</p>
        {state.success.pointsAwarded ? (
          <p className="text-sm text-walumo">+{state.success.pointsAwarded} points</p>
        ) : null}
      </div>
    );
  }

  return (
    <form action={formAction} className={`flex flex-col gap-4 ${state?.error ? "itm-nudge" : ""}`}>
      <input type="hidden" name="challengeId" value={challenge.id} />

      {challenge.type === "SINGLE_CHOICE" || challenge.type === "MULTIPLE_CHOICE" ? (
        <div className="flex flex-col gap-2">
          {challenge.options.map((option) => (
            <label key={option.id} className="itm-choice text-sm text-ink">
              <input
                type={challenge.type === "SINGLE_CHOICE" ? "radio" : "checkbox"}
                name="selectedOptionIds"
                value={option.id}
                required={challenge.type === "SINGLE_CHOICE"}
              />
              <span className="itm-choice-check" aria-hidden>
                ✓
              </span>
              {option.label}
            </label>
          ))}
        </div>
      ) : null}

      {challenge.type === "FREE_TEXT" ? (
        <textarea
          name="answerText"
          rows={4}
          required
          placeholder="Tell us"
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
        />
      ) : null}

      {challenge.type === "PHOTO_UPLOAD" ? (
        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="text-sm text-muted"
          />
          {isUploading ? <p className="text-xs text-muted">Sending it over…</p> : null}
          {uploadedPath ? <p className="text-xs text-walumo">Got it — ready to go.</p> : null}
          {uploadError ? (
            <p role="alert" className="text-xs text-red-400">
              {uploadError}
            </p>
          ) : null}
          <input type="hidden" name="storagePath" value={uploadedPath ?? ""} />
        </div>
      ) : null}

      {state?.error ? (
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending || (challenge.type === "PHOTO_UPLOAD" && !uploadedPath)}
        className="btn-primary self-start"
      >
        {isPending ? "Sending…" : SUBMIT_LABEL[challenge.type]}
      </button>
    </form>
  );
}
