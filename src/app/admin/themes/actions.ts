"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canManageThemes } from "@/lib/auth/roles";
import { getCurrentRoles, getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { activateThemeById } from "@/lib/theme/activate";
import { logAdminActivity } from "@/lib/admin/audit";
import { broadcast } from "@/lib/realtime/broadcast";

/**
 * Product Guide §19.2: "Admin clicks Activate Theme. System: 1. Saves
 * active theme. 2. Creates audit event. 3. Broadcasts theme.changed.
 * 4. Connected clients transition without full refresh." The actual
 * deactivate/activate/audit/broadcast sequence lives in
 * src/lib/theme/activate.ts, shared with Experience Transformation Slice
 * 2's auto-activation-on-day-publish (updateGameDayStatus) so both paths
 * stay in sync by construction rather than by two copies agreeing.
 */
export async function activateTheme(formData: FormData) {
  const actor = await getCurrentUser();
  if (!actor) redirect("/login");

  const roles = await getCurrentRoles();
  if (!canManageThemes(roles)) {
    redirect("/admin/themes?error=not_authorized");
  }

  const themeId = formData.get("themeId");
  if (typeof themeId !== "string") {
    redirect("/admin/themes?error=invalid_input");
  }

  const admin = createAdminClient();
  const result = await activateThemeById(admin, themeId, actor.id);
  if (!result.ok) {
    redirect(`/admin/themes?error=${result.reason}`);
  }

  revalidatePath("/admin/themes");
  redirect("/admin/themes?success=1");
}

/**
 * Experience Transformation Slice 8 (brief §8: "admin can... Change
 * country copy"). Merges countryName/countryFlag/tagline into the theme's
 * existing `tokens` jsonb — same flexible-column pattern as every other
 * theme extension, not a new table. Every page that displays this content
 * (src/lib/theme/journeyContent.ts's consumers) reads it live from this
 * same row, so this edit form is a real control, not one that writes
 * somewhere nothing reads from.
 */
export async function updateThemeContent(formData: FormData) {
  const actor = await getCurrentUser();
  if (!actor) redirect("/login");

  const roles = await getCurrentRoles();
  if (!canManageThemes(roles)) {
    redirect("/admin/themes?error=not_authorized");
  }

  const themeId = formData.get("themeId");
  const countryName = formData.get("countryName");
  const countryFlag = formData.get("countryFlag");
  const tagline = formData.get("tagline");

  if (
    typeof themeId !== "string" ||
    typeof countryName !== "string" ||
    typeof countryFlag !== "string" ||
    typeof tagline !== "string" ||
    countryName.trim().length === 0 ||
    countryName.length > 60 ||
    countryFlag.length > 8 ||
    tagline.trim().length === 0 ||
    tagline.length > 120
  ) {
    redirect("/admin/themes?error=invalid_input");
  }

  const admin = createAdminClient();
  const { data: theme } = await admin.from("themes").select("id, name, tokens").eq("id", themeId).maybeSingle();
  if (!theme) {
    redirect("/admin/themes?error=not_found");
  }

  const existingTokens = (theme.tokens ?? {}) as Record<string, unknown>;
  const { error } = await admin
    .from("themes")
    .update({
      tokens: {
        ...existingTokens,
        countryName: countryName.trim(),
        countryFlag: countryFlag.trim(),
        tagline: tagline.trim(),
      },
    })
    .eq("id", themeId);

  if (error) {
    redirect("/admin/themes?error=update_failed");
  }

  await logAdminActivity(admin, {
    actorId: actor.id,
    action: "theme_content_updated",
    targetType: "theme",
    targetId: themeId,
    metadata: { name: theme.name, countryName: countryName.trim(), tagline: tagline.trim() },
  });

  // Only meaningful if this theme happens to be the active one right now,
  // but broadcasting unconditionally is harmless and matches this
  // project's existing "broadcast liberally, client refetches its own
  // relevant state" pattern rather than adding a branch to check first.
  await broadcast("theme", "theme.changed");

  revalidatePath("/admin/themes");
  revalidatePath("/play");
  revalidatePath("/play/day/[dayNumber]", "page");
  revalidatePath("/");
  redirect("/admin/themes?success=1");
}
