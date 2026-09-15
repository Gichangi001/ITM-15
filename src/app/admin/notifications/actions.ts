"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { composeNotificationSchema } from "@/lib/notifications/schemas";
import { canSendNotifications } from "@/lib/auth/roles";
import { getCurrentRoles, getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/admin/audit";
import { broadcast } from "@/lib/realtime/broadcast";

export type ComposeNotificationState = { error?: string; success?: string } | null;

/**
 * Product Guide §15.2 (Live on-screen notifications) — the composer half
 * of Phase 12 that was previously blocked on migration-apply tool access
 * (see docs/PROJECT_STATE.md's "Phase 12 — Admin notifications (blocked)").
 * That migration (`20260913100000_admin_notifications.sql`) is confirmed
 * applied live (re-verified via `mcp__claude_ai_Supabase__list_tables`
 * against the real `ysjjgzakswaohmnaowmv` project before writing this),
 * so this closes the phase's real remaining gap rather than the
 * automated day/mission-status fan-out that already existed.
 *
 * `admin_notifications` records the composed intent (what was sent, to
 * whom, by whom — the `/admin/notifications` history list); `notifications`
 * is fanned out to one real row per targeted player, matching the exact
 * pattern `notifyAllActivePlayers` (src/lib/notifications/create.ts)
 * already established for system-generated notifications. The recipient
 * set is always resolved server-side from the real `profiles` table —
 * never a client-supplied list or count.
 */
export async function composeNotification(
  _prevState: ComposeNotificationState,
  formData: FormData,
): Promise<ComposeNotificationState> {
  const actor = await getCurrentUser();
  if (!actor) redirect("/login");

  const roles = await getCurrentRoles();
  if (!canSendNotifications(roles)) {
    return { error: "You are not authorized to send notifications." };
  }

  const parsed = composeNotificationSchema.safeParse({
    audienceType: formData.get("audienceType"),
    countryId: formData.get("countryId") ?? "",
    entityId: formData.get("entityId") ?? "",
    playerEmail: formData.get("playerEmail") ?? "",
    title: formData.get("title"),
    message: formData.get("message"),
    severity: formData.get("severity"),
    ctaLabel: formData.get("ctaLabel") ?? "",
    ctaHref: formData.get("ctaHref") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { audienceType, countryId, entityId, playerEmail, title, message, severity, ctaLabel, ctaHref } =
    parsed.data;
  const admin = createAdminClient();

  let recipientsQuery = admin.from("profiles").select("id, email").eq("status", "ACTIVE");
  let audienceId: string | null = null;

  if (audienceType === "COUNTRY") {
    audienceId = countryId || null;
    recipientsQuery = recipientsQuery.eq("country_id", audienceId ?? "");
  } else if (audienceType === "ENTITY") {
    audienceId = entityId || null;
    recipientsQuery = recipientsQuery.eq("entity_id", audienceId ?? "");
  } else if (audienceType === "PLAYER") {
    recipientsQuery = recipientsQuery.eq("email", playerEmail ?? "");
  }

  const { data: recipients } = await recipientsQuery;

  if (!recipients || recipients.length === 0) {
    return { error: "No matching active players found for that audience." };
  }

  if (audienceType === "PLAYER") {
    audienceId = recipients[0].id;
  }

  const { data: notification, error: insertError } = await admin
    .from("admin_notifications")
    .insert({
      audience_type: audienceType,
      audience_id: audienceId,
      title,
      message,
      severity,
      cta_label: ctaLabel || null,
      cta_href: ctaHref || null,
      sent_at: new Date().toISOString(),
      recipient_count: recipients.length,
      created_by: actor.id,
    })
    .select("id")
    .single();

  if (insertError || !notification) {
    return { error: "Could not send the notification. Try again." };
  }

  const rows = recipients.map((recipient) => ({
    player_id: recipient.id,
    title,
    message,
    severity,
    cta_label: ctaLabel || null,
    cta_href: ctaHref || null,
    source_type: "ADMIN_MESSAGE" as const,
    source_id: notification.id,
  }));

  const { error: fanoutError } = await admin.from("notifications").insert(rows);
  if (fanoutError) {
    return { error: "Notification saved but delivery to players failed. Try again." };
  }

  await logAdminActivity(admin, {
    actorId: actor.id,
    action: "notification_sent",
    targetType: "admin_notification",
    targetId: notification.id,
    metadata: { audienceType, recipientCount: recipients.length, title },
  });

  // Live "no reload needed" delivery, matching this project's established
  // "bare ping, client always refetches" pattern (src/lib/realtime/
  // broadcast.ts) — but only for the two audiences with an existing,
  // working channel: GLOBAL rides "game:global" (owned by
  // PresenceHeartbeat, which now also refreshes on this event) and PLAYER
  // rides "player:{id}" (owned by WallyProvider, same treatment). COUNTRY/
  // ENTITY sends still land for real in the recipient's `/notifications`
  // inbox on next load — this project has no country/entity realtime
  // channel yet, the same disclosed gap already recorded for Wally's own
  // COUNTRY/ENTITY targeting.
  if (audienceType === "GLOBAL") {
    await broadcast("game:global", "notification.created");
  } else if (audienceType === "PLAYER" && audienceId) {
    await broadcast(`player:${audienceId}`, "notification.created");
  }

  revalidatePath("/admin/notifications");
  return { success: `Sent to ${recipients.length} player${recipients.length === 1 ? "" : "s"}.` };
}
