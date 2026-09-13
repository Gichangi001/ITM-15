"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { canModerateSubmissions } from "@/lib/auth/roles";
import { getCurrentRoles, getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/admin/audit";
import { broadcast } from "@/lib/realtime/broadcast";

const moderateEventPhotoSchema = z.object({
  eventPhotoId: z.string().uuid(),
  decision: z.enum(["APPROVE", "REJECT"]),
});

/**
 * Same moderation discipline as src/app/admin/submissions/actions.ts's
 * moderateSubmission, applied to free-form gallery contributions
 * (event_photos) instead of mission-tied submissions — kept as its own
 * action/page rather than folded into /admin/submissions to keep this
 * slice isolated (see this table's own migration header for the product
 * direction this implements). Uses `canModerateSubmissions` — the same
 * capability, not a new role tier, since this is the same kind of review
 * work.
 */
export async function moderateEventPhoto(formData: FormData) {
  const roles = await getCurrentRoles();
  if (!canModerateSubmissions(roles)) {
    redirect("/admin/gallery-moderation?error=not_authorized");
  }

  const parsed = moderateEventPhotoSchema.safeParse({
    eventPhotoId: formData.get("eventPhotoId"),
    decision: formData.get("decision"),
  });

  if (!parsed.success) {
    redirect("/admin/gallery-moderation?error=invalid_input");
  }

  const { eventPhotoId, decision } = parsed.data;
  const actor = await getCurrentUser();
  const admin = createAdminClient();

  const { data: photo } = await admin
    .from("event_photos")
    .select("id, status")
    .eq("id", eventPhotoId)
    .maybeSingle();

  if (!photo) {
    redirect("/admin/gallery-moderation?error=not_found");
  }
  if (photo.status !== "PENDING") {
    redirect("/admin/gallery-moderation?error=already_moderated");
  }

  const { error } = await admin
    .from("event_photos")
    .update({
      status: decision === "APPROVE" ? "APPROVED" : "REJECTED",
      moderated_by: actor?.id ?? null,
      moderated_at: new Date().toISOString(),
    })
    .eq("id", eventPhotoId)
    .eq("status", "PENDING");

  if (error) {
    redirect("/admin/gallery-moderation?error=update_failed");
  }

  if (actor) {
    await logAdminActivity(admin, {
      actorId: actor.id,
      action: decision === "APPROVE" ? "event_photo_approved" : "event_photo_rejected",
      targetType: "event_photo",
      targetId: eventPhotoId,
    });
  }

  if (decision === "APPROVE") {
    await broadcast("gallery", "event_photo.approved");
  }

  redirect("/admin/gallery-moderation?success=1");
}
