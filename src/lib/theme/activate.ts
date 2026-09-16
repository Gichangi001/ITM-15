import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";
import { broadcast } from "@/lib/realtime/broadcast";
import { logAdminActivity } from "@/lib/admin/audit";

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Shared activation logic (Product Guide §19.2: deactivate the previous
 * theme, activate the new one, audit log, broadcast `theme.changed`) —
 * extracted from `src/app/admin/themes/actions.ts`'s `activateTheme` so
 * Experience Transformation Slice 2's auto-activation-on-day-publish
 * (`updateGameDayStatus`, src/app/admin/missions/actions.ts) can reuse the
 * exact same, already-correct sequence instead of a second copy that could
 * drift from it. Takes an actor id rather than requiring a request
 * context, since the day-publish call site already has one from its own
 * auth check.
 */
export async function activateThemeById(
  admin: AdminClient,
  themeId: string,
  actorId: string,
): Promise<{ ok: true; name: string } | { ok: false; reason: "not_found" | "update_failed" }> {
  const { data: theme } = await admin.from("themes").select("id, name").eq("id", themeId).maybeSingle();
  if (!theme) {
    return { ok: false, reason: "not_found" };
  }

  const { error: deactivateError } = await admin.from("themes").update({ is_active: false }).eq("is_active", true);
  if (deactivateError) {
    return { ok: false, reason: "update_failed" };
  }

  const { error: activateError } = await admin.from("themes").update({ is_active: true }).eq("id", themeId);
  if (activateError) {
    return { ok: false, reason: "update_failed" };
  }

  await logAdminActivity(admin, {
    actorId,
    action: "theme_activated",
    targetType: "theme",
    targetId: themeId,
    metadata: { name: theme.name },
  });

  await broadcast("theme", "theme.changed");

  return { ok: true, name: theme.name };
}

/**
 * Looks a theme up by its `key` (the journey stops in src/content/journey.ts
 * reference themes this way, since that content module is the source of
 * truth for which key belongs to which day) and activates it if found.
 * Silently does nothing if no matching theme row exists — a day without a
 * seeded journey theme yet (or a day number outside the 7-stop journey)
 * should not block publishing, and there is nothing to audit-log for a
 * change that didn't happen.
 */
export async function activateThemeByKey(admin: AdminClient, key: string, actorId: string) {
  const { data: theme } = await admin.from("themes").select("id").eq("key", key).maybeSingle();
  if (!theme) return;
  await activateThemeById(admin, theme.id, actorId);
}
