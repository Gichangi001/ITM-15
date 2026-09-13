"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { canManageContent } from "@/lib/auth/roles";
import { getCurrentRoles, getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/admin/audit";

const uploadMediaAssetSchema = z.object({
  assetType: z.enum(["PHOTO", "VIDEO", "AUDIO"]),
  caption: z.string().trim().optional(),
  tags: z.string().trim().optional(),
});

export type UploadMediaAssetState = { error?: string } | null;

/**
 * Product Guide §12.4 (Admin Media Library): "Admins must be able to
 * upload and manage: historical photographs, country images, event
 * photos, Walumo/product screenshots, Wally illustrations/models,
 * backgrounds, audio tracks, short video clips... tagged by country, year,
 * event, people, theme and usage type." Free-form comma-separated tags
 * satisfy the tagging requirement without a rigid taxonomy Product Guide
 * doesn't itself define columns for.
 *
 * Game Master/Super Admin only (`canManageContent`) — same capability as
 * mission/day content management, since this is the same "content
 * curation" job the Product Guide groups under admin content management.
 *
 * The file itself is uploaded to the public `admin-media` bucket via the
 * service-role client from this server action — never a client-facing
 * storage INSERT policy — so there is nothing for a non-admin to exploit
 * even if they discovered the bucket name.
 */
export async function uploadMediaAsset(
  _prevState: UploadMediaAssetState,
  formData: FormData,
): Promise<UploadMediaAssetState> {
  const actor = await getCurrentUser();
  if (!actor) redirect("/login");

  const roles = await getCurrentRoles();
  if (!canManageContent(roles)) {
    return { error: "You are not authorized to manage media." };
  }

  const parsed = uploadMediaAssetSchema.safeParse({
    assetType: formData.get("assetType"),
    caption: formData.get("caption") || undefined,
    tags: formData.get("tags") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file to upload." };
  }

  const { assetType, caption, tags } = parsed.data;
  const admin = createAdminClient();

  const ext = file.name.split(".").pop() || "bin";
  const path = `${assetType.toLowerCase()}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await admin.storage
    .from("admin-media")
    .upload(path, file, { contentType: file.type || undefined, upsert: false });

  if (uploadError) {
    return { error: "Upload failed. Try a smaller file or a different format." };
  }

  const tagList = (tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const { data: asset, error: insertError } = await admin
    .from("media_assets")
    .insert({
      asset_type: assetType,
      storage_path: path,
      caption: caption || null,
      tags: tagList,
      uploaded_by: actor.id,
    })
    .select("id")
    .single();

  if (insertError || !asset) {
    // Compensating rollback — don't leave an orphaned storage object behind
    // if the metadata row fails, same pattern as account creation's
    // orphaned-auth-user rollback.
    await admin.storage.from("admin-media").remove([path]);
    return { error: "Could not save the media record. Try again." };
  }

  await logAdminActivity(admin, {
    actorId: actor.id,
    action: "media_asset_uploaded",
    targetType: "media_asset",
    targetId: asset.id,
    metadata: { asset_type: assetType, tags: tagList },
  });

  revalidatePath("/admin/media");
  redirect("/admin/media?success=1");
}

/**
 * Featuring is a distinct, audited action from uploading — Product Guide
 * §17.3's "Feature Photo" quick action targets exactly this flag, once a
 * real admin surface exists to flip it (this page is that surface for
 * general media; `submissions.status = 'APPROVED'` already governs
 * challenge-evidence gallery visibility separately).
 */
export async function toggleMediaFeatured(formData: FormData) {
  const actor = await getCurrentUser();
  if (!actor) redirect("/login");

  const roles = await getCurrentRoles();
  if (!canManageContent(roles)) {
    redirect("/admin/media?error=not_authorized");
  }

  const assetId = formData.get("assetId");
  const featured = formData.get("featured") === "true";

  if (typeof assetId !== "string") {
    redirect("/admin/media?error=invalid_input");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("media_assets").update({ is_featured: !featured }).eq("id", assetId);
  if (error) {
    redirect("/admin/media?error=update_failed");
  }

  await logAdminActivity(admin, {
    actorId: actor.id,
    action: "media_asset_featured_toggled",
    targetType: "media_asset",
    targetId: assetId,
    metadata: { new_featured: !featured },
  });

  revalidatePath("/admin/media");
  redirect("/admin/media?success=1");
}
