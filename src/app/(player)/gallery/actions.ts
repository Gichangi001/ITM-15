"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { broadcast } from "@/lib/realtime/broadcast";

const uploadEventPhotoSchema = z.object({
  storagePath: z.string().min(1),
  caption: z.string().trim().max(200).optional().or(z.literal("")),
});

export type UploadEventPhotoState = { error?: string; success?: boolean } | null;

/**
 * Product owner's explicit 2026-09-13 direction: "allow people to
 * activate their cameras and take photos... upload photos of the event,
 * the more the better." Distinct from a mission `submissions` row — this
 * is a free-form contribution, not tied to any one challenge — but held
 * to the exact same rule (Product Guide §26 Phase 10): "unapproved media
 * never appears on public/event surfaces." Every upload starts PENDING;
 * only `/admin/gallery-moderation`'s server action (service role) can
 * move it to APPROVED, the same two-step trust boundary every other
 * player-submitted photo in this app already goes through.
 *
 * The storage path itself is re-validated here, not just trusted from the
 * client — same defense-in-depth pattern as
 * play/mission/[missionId]/actions.ts's PHOTO_UPLOAD branch: the bucket's
 * own RLS policy already restricts uploads to the uploader's own
 * uid-prefixed folder, but a client could still call this action directly
 * with an arbitrary path string, so it's checked again here.
 */
export async function uploadEventPhoto(
  _prevState: UploadEventPhotoState,
  formData: FormData,
): Promise<UploadEventPhotoState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You need to be signed in." };
  }

  const parsed = uploadEventPhotoSchema.safeParse({
    storagePath: formData.get("storagePath"),
    caption: formData.get("caption") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission" };
  }

  const { storagePath, caption } = parsed.data;

  if (!storagePath.startsWith(`${user.id}/`)) {
    return { error: "Invalid upload path." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("event_photos").insert({
    player_id: user.id,
    storage_path: storagePath,
    caption: caption || null,
    status: "PENDING",
  });

  if (error) {
    return { error: "Could not save your photo. Try again." };
  }

  // Bare ping, per runbook §21 — admin's moderation queue refetches for
  // itself, same pattern as submission.pending for mission evidence.
  await broadcast("admin:mission-control", "event_photo.pending");

  revalidatePath("/gallery");
  return { success: true };
}
