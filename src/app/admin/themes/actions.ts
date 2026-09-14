"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canManageThemes } from "@/lib/auth/roles";
import { getCurrentRoles, getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/admin/audit";
import { broadcast } from "@/lib/realtime/broadcast";

/**
 * Product Guide §19.2: "Admin clicks Activate Theme. System: 1. Saves
 * active theme. 2. Creates audit event. 3. Broadcasts theme.changed.
 * 4. Connected clients transition without full refresh." Deactivating
 * the previous theme and activating the new one happen as two updates —
 * `themes_only_one_active_idx` (a unique partial index on `is_active`) is
 * the real backstop if this ever needs to become a single transactional
 * RPC; two admins racing to activate different themes at once is a
 * vanishingly unlikely, low-stakes event scale doesn't need to protect
 * further against.
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
  const { data: theme } = await admin.from("themes").select("id, name").eq("id", themeId).maybeSingle();
  if (!theme) {
    redirect("/admin/themes?error=not_found");
  }

  const { error: deactivateError } = await admin.from("themes").update({ is_active: false }).eq("is_active", true);
  if (deactivateError) {
    redirect("/admin/themes?error=update_failed");
  }

  const { error: activateError } = await admin.from("themes").update({ is_active: true }).eq("id", themeId);
  if (activateError) {
    redirect("/admin/themes?error=update_failed");
  }

  await logAdminActivity(admin, {
    actorId: actor.id,
    action: "theme_activated",
    targetType: "theme",
    targetId: themeId,
    metadata: { name: theme.name },
  });

  // Product Guide §19.2 step 3 — every connected client (player or admin,
  // authenticated or not, since the landing page needs this too)
  // re-fetches the active theme and re-applies its tokens without a full
  // page reload. See src/components/ThemeProvider.tsx.
  await broadcast("theme", "theme.changed");

  revalidatePath("/admin/themes");
  redirect("/admin/themes?success=1");
}
