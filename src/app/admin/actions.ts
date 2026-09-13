"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canControlGameState } from "@/lib/auth/roles";
import { getCurrentRoles, getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/admin/audit";
import { broadcast } from "@/lib/realtime/broadcast";

/**
 * Product Guide §17.3 "Pause Game" / runbook §33 ("ability to pause
 * campaign"). Deliberately not a decorative toggle: pausing genuinely
 * blocks new mission answers and votes server-side (see the campaign-status
 * check added to `submitAnswer` and `castVote`), not just a cosmetic label
 * on the dashboard — the Storyline Build Bible §39 rule against buttons
 * that don't connect to real state applies here as much as anywhere else.
 *
 * Acts on the single most-recently-created campaign row, same lookup
 * pattern already used by `createMission` — this project has exactly one
 * real campaign at a time (Product Guide's DB model doesn't describe
 * multi-campaign concurrency, and nothing else in the app assumes it
 * either).
 */
export async function setCampaignStatus(formData: FormData) {
  const actor = await getCurrentUser();
  if (!actor) redirect("/login");

  const roles = await getCurrentRoles();
  if (!canControlGameState(roles)) {
    redirect("/admin?error=not_authorized");
  }

  const status = formData.get("status");
  if (status !== "ACTIVE" && status !== "PAUSED") {
    redirect("/admin?error=invalid_input");
  }

  const admin = createAdminClient();
  const { data: campaign } = await admin
    .from("campaigns")
    .select("id, name, status")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!campaign) {
    redirect("/admin?error=no_campaign");
  }

  const { error } = await admin.from("campaigns").update({ status }).eq("id", campaign.id);
  if (error) {
    redirect("/admin?error=update_failed");
  }

  await logAdminActivity(admin, {
    actorId: actor.id,
    action: status === "PAUSED" ? "game_paused" : "game_resumed",
    targetType: "campaign",
    targetId: campaign.id,
    metadata: { previous_status: campaign.status, new_status: status },
  });

  // Every connected player sees the paused/resumed banner immediately, and
  // the submission/vote gates below take effect on their very next
  // server-side check regardless of whether this broadcast is ever
  // received — the broadcast is a UX convenience, not the enforcement.
  await broadcast("game:global", status === "PAUSED" ? "game.paused" : "game.resumed");

  revalidatePath("/admin");
  redirect("/admin?success=1");
}
