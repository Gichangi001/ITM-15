"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canManageThemes } from "@/lib/auth/roles";
import { getCurrentRoles, getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { activateThemeById } from "@/lib/theme/activate";

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
