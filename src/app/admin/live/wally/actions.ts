"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { canTriggerWally } from "@/lib/auth/roles";
import { getCurrentRoles, getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/admin/audit";
import { broadcast } from "@/lib/realtime/broadcast";

const publishWallyEventSchema = z
  .object({
    audienceType: z.enum(["GLOBAL", "PLAYER"]),
    playerEmail: z.string().email().optional().or(z.literal("")),
    message: z.string().trim().min(1).max(220),
    animationKey: z.string().min(1).max(60),
    priority: z.enum(["P1_LIVE_EVENT", "P2_PLAYER_RESULT", "P3_GUIDANCE"]),
  })
  .refine((data) => data.audienceType !== "PLAYER" || (data.playerEmail && data.playerEmail.length > 0), {
    message: "A player email is required when targeting a specific player.",
    path: ["playerEmail"],
  });

/**
 * docs/WALLY.md §16 (Admin Mission Control — Wally Control Room), §34
 * (server operation `publishWallyEvent`). Scope for this first slice
 * (Phase 13 W1/W2 per WALLY.md §37): GLOBAL or a single named PLAYER only
 * — COUNTRY/ENTITY/SQUAD targeting is deferred exactly where
 * `wally_events`'s own RLS policy comment already defers it (needs a
 * profiles/squad_members join the migration didn't add yet), and
 * scheduling (`starts_at`) is skipped — every event here publishes
 * immediately, matching the same "no scheduling infrastructure exists"
 * disclosure already made for Phase 12's notification composer.
 *
 * §16.3: "For global messages, use a confirmation step" — enforced
 * client-side in WallyTriggerForm (a plain `window.confirm`), not
 * duplicated here; this action is still the real authorization/audit
 * boundary regardless of what the client did or didn't confirm.
 */
export async function publishWallyEvent(formData: FormData) {
  const roles = await getCurrentRoles();
  if (!canTriggerWally(roles)) {
    redirect("/admin/live/wally?error=not_authorized");
  }

  const parsed = publishWallyEventSchema.safeParse({
    audienceType: formData.get("audienceType"),
    playerEmail: formData.get("playerEmail") ?? "",
    message: formData.get("message"),
    animationKey: formData.get("animationKey"),
    priority: formData.get("priority"),
  });

  if (!parsed.success) {
    redirect("/admin/live/wally?error=invalid_input");
  }

  const { audienceType, playerEmail, message, animationKey, priority } = parsed.data;
  const actor = await getCurrentUser();
  const admin = createAdminClient();

  const { data: campaign } = await admin
    .from("campaigns")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!campaign) {
    redirect("/admin/live/wally?error=no_campaign");
  }

  let audienceId: string | null = null;
  let targetLabel = "everyone";

  if (audienceType === "PLAYER") {
    // The schema's .refine() already guarantees playerEmail is non-empty
    // whenever audienceType is PLAYER, but TypeScript can't see across
    // that refinement — this redirect is unreachable in practice, purely
    // to narrow the type.
    if (!playerEmail) {
      redirect("/admin/live/wally?error=invalid_input");
    }

    const { data: targetProfile } = await admin
      .from("profiles")
      .select("id, email")
      .eq("email", playerEmail)
      .maybeSingle();

    if (!targetProfile) {
      redirect("/admin/live/wally?error=player_not_found");
    }

    audienceId = targetProfile.id;
    targetLabel = targetProfile.email;
  }

  const { data: event, error: insertError } = await admin
    .from("wally_events")
    .insert({
      campaign_id: campaign.id,
      event_type: "ADMIN_MESSAGE",
      audience_type: audienceType,
      audience_id: audienceId,
      priority,
      animation_key: animationKey,
      // Plain text only — React escapes this on render (no
      // dangerouslySetInnerHTML anywhere in the Wally components), so no
      // extra sanitization is needed beyond the length cap already
      // enforced by the schema. WALLY.md §9: "dialogueOverride from admin
      // must be sanitized and treated as plain text" — that's exactly
      // what plain-text rendering already guarantees here.
      dialogue_override: message,
      status: "PUBLISHED",
      published_at: new Date().toISOString(),
      created_by: actor?.id ?? null,
    })
    .select("id")
    .single();

  if (insertError || !event) {
    redirect("/admin/live/wally?error=update_failed");
  }

  if (actor) {
    await logAdminActivity(admin, {
      actorId: actor.id,
      action: "wally_event_published",
      targetType: "wally_event",
      targetId: event.id,
      metadata: { audienceType, target: targetLabel, message },
    });
  }

  // Bare ping only, per runbook §21 — the actual dialogue is never in the
  // broadcast payload. A receiving client always refetches the real,
  // RLS-scoped `wally_events` row for itself; even a client that somehow
  // subscribed to another player's `player:{id}` topic (channel names
  // aren't secret) would refetch under its *own* auth.uid() and find
  // nothing new, since the RLS policy on wally_events restricts
  // PLAYER-targeted rows to `audience_id = auth.uid()`. Same disclosed
  // "public topic name, RLS-gated content" pattern already used for
  // game:day:{id} and poll:{id} elsewhere in this project.
  const topic = audienceType === "GLOBAL" ? "game:global" : `player:${audienceId}`;
  await broadcast(topic, "wally.triggered");

  redirect("/admin/live/wally?success=1");
}
