"use server";

import { redirect } from "next/navigation";
import { createPollSchema } from "@/lib/voting/schemas";
import { canManageVoting } from "@/lib/auth/roles";
import { getCurrentRoles, getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export type CreatePollState = { error?: string } | null;

/**
 * Product Guide §11.1/§26 Phase 9: admin poll creation. Created as DRAFT —
 * opening voting is a separate, explicit, audited action (see
 * src/app/admin/voting/actions.ts), same draft/publish split as missions.
 */
export async function createPoll(
  _prevState: CreatePollState,
  formData: FormData,
): Promise<CreatePollState> {
  const actor = await getCurrentUser();
  if (!actor) redirect("/login");

  const roles = await getCurrentRoles();
  if (!canManageVoting(roles)) {
    return { error: "You are not authorized to manage voting." };
  }

  const optionLabels = formData.getAll("optionLabel").map((v) => String(v)).filter((v) => v.trim());

  const parsed = createPollSchema.safeParse({
    campaignId: formData.get("campaignId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    selfVoteAllowed: formData.get("selfVoteAllowed") === "on",
    reasonRequired: formData.get("reasonRequired") === "on",
    resultsVisibility: formData.get("resultsVisibility") || "ADMIN_REVEAL",
    optionLabels,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { campaignId, title, description, selfVoteAllowed, reasonRequired, resultsVisibility, optionLabels: labels } =
    parsed.data;

  const admin = createAdminClient();

  const { data: poll, error: pollError } = await admin
    .from("polls")
    .insert({
      campaign_id: campaignId,
      title,
      description: description || null,
      self_vote_allowed: selfVoteAllowed,
      reason_required: reasonRequired,
      results_visibility: resultsVisibility,
      status: "DRAFT",
      created_by: actor.id,
    })
    .select("id")
    .single();

  if (pollError || !poll) {
    return { error: "Could not create the poll. Try again." };
  }

  const { error: optionsError } = await admin.from("poll_options").insert(
    labels.map((label, index) => ({
      poll_id: poll.id,
      label,
      order_index: index,
    })),
  );

  if (optionsError) {
    await admin.from("polls").delete().eq("id", poll.id);
    return { error: "Could not create the poll options. Try again." };
  }

  await admin.from("audit_logs").insert({
    actor_id: actor.id,
    action: "poll_created",
    target_type: "poll",
    target_id: poll.id,
    metadata: { title, option_count: labels.length },
  });

  redirect("/admin/voting");
}
