"use client";

import { useActionState, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadEventPhoto, type UploadEventPhotoState } from "@/app/(player)/gallery/actions";

const initialState: UploadEventPhotoState = null;

/**
 * "Activate their cameras and take photos" (product owner, 2026-09-13),
 * implemented via `<input type="file" capture="environment">` rather than
 * a hand-rolled `getUserMedia()` viewfinder — on a real phone (iOS Safari,
 * Android Chrome), that attribute opens the native camera app directly,
 * which is more reliable than a custom in-page camera (no manual
 * permission-prompt handling, no video-stream lifecycle to clean up, no
 * browser-inconsistency surface) and gives players the camera UI they
 * already know. A plain file input alongside it covers "or choose an
 * existing photo" and desktop use, where `capture` has no native camera to
 * open anyway. Both feed the exact same upload path below.
 */
export function EventPhotoUploadForm({ playerId }: { playerId: string }) {
  const [state, formAction, isPending] = useActionState(uploadEventPhoto, initialState);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploadError(null);
    setUploadedPath(null);
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${playerId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("event-photos").upload(path, file, { upsert: false });
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
      <div className="rounded-lg border border-walumo/40 bg-walumo/10 p-4">
        <p className="text-sm text-ink">Photo submitted — it&apos;s with the moderators now.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-secondary mt-3"
        >
          Add another
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-xl border border-white/10 bg-surface p-4"
    >
      <input type="hidden" name="storagePath" value={uploadedPath ?? ""} />

      <div className="flex flex-wrap gap-3">
        <label className="btn-secondary cursor-pointer">
          📷 Take a photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="hidden"
          />
        </label>
        <label className="btn-secondary cursor-pointer">
          🖼 Choose from library
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="hidden"
          />
        </label>
      </div>

      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- a transient local object URL, not a servable asset
        <img src={previewUrl} alt="" className="max-h-60 rounded-lg object-contain" />
      ) : null}
      {isUploading ? <p className="text-xs text-muted">Uploading…</p> : null}
      {uploadedPath ? <p className="text-xs text-walumo">Photo ready to submit.</p> : null}
      {uploadError ? (
        <p role="alert" className="text-xs text-red-400">
          {uploadError}
        </p>
      ) : null}

      <input
        type="text"
        name="caption"
        placeholder="Caption (optional)"
        maxLength={200}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink outline-none focus-visible:border-walumo"
      />

      {state?.error ? (
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending || !uploadedPath}
        className="btn-primary self-start"
      >
        {isPending ? "Submitting…" : "Submit to gallery"}
      </button>
    </form>
  );
}
