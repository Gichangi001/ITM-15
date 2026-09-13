"use server";

import { redirect } from "next/navigation";
import { createMissionSchema } from "@/lib/content/schemas";
import { canManageContent } from "@/lib/auth/roles";
import { getCurrentRoles, getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export type CreateMissionState = { error?: string } | null;

/**
 * Product Guide §9.2/§26 Phase 6: admin mission creation. Game Master/Super
 * Admin only (Product Guide §4.4). Creates the mission in DRAFT status —
 * publishing (making it visible to players) is a separate, explicit action
 * (see src/app/admin/missions/actions.ts), matching §18.2's guided-builder
 * "Save Draft / Publish" split and §26 Phase 6's "Draft mission is
 * invisible to player" acceptance criterion.
 *
 * game_days are lazily created here rather than through a separate CRUD
 * page — Product Guide §8 fixes the structure to exactly Day 1-7 per
 * campaign; there's nothing to manage beyond "does day N exist for this
 * campaign yet."
 */
export async function createMission(
  _prevState: CreateMissionState,
  formData: FormData,
): Promise<CreateMissionState> {
  const actor = await getCurrentUser();
  if (!actor) redirect("/login");

  const roles = await getCurrentRoles();
  if (!canManageContent(roles)) {
    return { error: "You are not authorized to manage content." };
  }

  const optionLabels = formData.getAll("optionLabel").map((v) => String(v));
  const correctIndexes = new Set(formData.getAll("optionCorrect").map((v) => Number(v)));
  const options = optionLabels
    .map((label, index) => ({ label, isCorrect: correctIndexes.has(index) }))
    .filter((option) => option.label.trim().length > 0);

  const parsed = createMissionSchema.safeParse({
    dayNumber: formData.get("dayNumber"),
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    basePoints: formData.get("basePoints"),
    unityPoints: formData.get("unityPoints"),
    isUnityChallenge: formData.get("isUnityChallenge") === "on",
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    maxAttempts: formData.get("maxAttempts") || undefined,
    challengeType: formData.get("challengeType"),
    prompt: formData.get("prompt"),
    options: options.length > 0 ? options : undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { dayNumber } = parsed.data;

  const admin = createAdminClient();

  const { data: campaign } = await admin
    .from("campaigns")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!campaign) {
    return { error: "No campaign exists yet. Create one first." };
  }

  // Find or create the game_days row for this day number.
  const { data: existingDay } = await admin
    .from("game_days")
    .select("id")
    .eq("campaign_id", campaign.id)
    .eq("day_number", dayNumber)
    .maybeSingle();

  let gameDayId = existingDay?.id;
  if (!gameDayId) {
    const { data: newDay, error: dayError } = await admin
      .from("game_days")
      .insert({
        campaign_id: campaign.id,
        day_number: dayNumber,
        title: `Day ${dayNumber}`,
        status: "DRAFT",
        created_by: actor.id,
      })
      .select("id")
      .single();
    if (dayError || !newDay) {
      return { error: "Could not create the game day. Try again." };
    }
    gameDayId = newDay.id;
  }

  const { title, slug, description, basePoints, unityPoints, isUnityChallenge, startsAt, endsAt, maxAttempts, challengeType, prompt } =
    parsed.data;

  const { data: mission, error: missionError } = await admin
    .from("missions")
    .insert({
      game_day_id: gameDayId,
      title,
      slug,
      description: description || null,
      status: "DRAFT",
      base_points: basePoints,
      unity_points: unityPoints,
      is_unity_challenge: isUnityChallenge,
      starts_at: startsAt || null,
      ends_at: endsAt || null,
      max_attempts: maxAttempts ?? null,
      created_by: actor.id,
    })
    .select("id")
    .single();

  if (missionError || !mission) {
    if (missionError?.code === "23505") {
      return { error: "A mission with this slug already exists on this day." };
    }
    return { error: "Could not create the mission. Try again." };
  }

  const { data: challenge, error: challengeError } = await admin
    .from("challenges")
    .insert({
      mission_id: mission.id,
      type: challengeType,
      prompt,
      order_index: 0,
    })
    .select("id")
    .single();

  if (challengeError || !challenge) {
    await admin.from("missions").delete().eq("id", mission.id);
    return { error: "Could not create the challenge. Try again." };
  }

  if ((challengeType === "SINGLE_CHOICE" || challengeType === "MULTIPLE_CHOICE") && parsed.data.options) {
    const { error: optionsError } = await admin.from("challenge_options").insert(
      parsed.data.options.map((option, index) => ({
        challenge_id: challenge.id,
        label: option.label,
        is_correct: option.isCorrect,
        order_index: index,
      })),
    );
    if (optionsError) {
      await admin.from("missions").delete().eq("id", mission.id);
      return { error: "Could not create the answer options. Try again." };
    }
  }

  await admin.from("audit_logs").insert({
    actor_id: actor.id,
    action: "mission_created",
    target_type: "mission",
    target_id: mission.id,
    metadata: { title, day_number: dayNumber, challenge_type: challengeType },
  });

  redirect("/admin/missions");
}
