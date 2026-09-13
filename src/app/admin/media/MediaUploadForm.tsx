"use client";

import { useActionState } from "react";
import { uploadMediaAsset, type UploadMediaAssetState } from "./actions";

const initialState: UploadMediaAssetState = null;

export function MediaUploadForm() {
  const [state, formAction, isPending] = useActionState(uploadMediaAsset, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="file" className="text-xs font-semibold tracking-wide text-muted uppercase">
          File
        </label>
        <input
          id="file"
          name="file"
          type="file"
          required
          accept="image/jpeg,image/png,image/webp,video/mp4,audio/mpeg,audio/wav"
          className="text-sm text-muted"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="assetType" className="text-xs font-semibold tracking-wide text-muted uppercase">
          Type
        </label>
        <select
          id="assetType"
          name="assetType"
          defaultValue="PHOTO"
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
        >
          <option value="PHOTO">Photo</option>
          <option value="VIDEO">Video</option>
          <option value="AUDIO">Audio</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="caption" className="text-xs font-semibold tracking-wide text-muted uppercase">
          Caption (optional)
        </label>
        <input
          id="caption"
          name="caption"
          type="text"
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="tags" className="text-xs font-semibold tracking-wide text-muted uppercase">
          Tags (comma-separated — country, year, event, theme...)
        </label>
        <input
          id="tags"
          name="tags"
          type="text"
          placeholder="kenya, 2019, day5, origin"
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-ink outline-none focus-visible:border-walumo"
        />
      </div>

      {state?.error ? (
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className="btn-primary mt-2">
        {isPending ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}
