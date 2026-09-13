"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canManageContent } from "@/lib/auth/roles";
import { getCurrentRoles, getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/admin/audit";
import { broadcast } from "@/lib/realtime/broadcast";

const MISSION_STATUSES = ["DRAFT", "SCHEDULED", "LIVE", "PAUSED", "COMPLETED", "ARCHIVED"] as const;

/**
 * Publishing/pausing a mission is a distinct, audited action from creating
 * it (Product Guide §18.3: "If a live mission is edited... Record admin and
 * timestamp"; §24.5 admin actions are auditable). A plain server action
 * bound directly to each row's form, same pattern as
 * src/app/admin/players/actions.ts's updateUser.
 */
export async function updateMissionStatus(formData: FormData) {
  const actor = await getCurrentUser();
  if (!actor) redirect("/login");

  const roles = await getCurrentRoles();
  if (!canManageContent(roles)) {
    redirect("/admin/missions?error=not_authorized");
  }

  const missionId = formData.get("missionId");
  const status = formData.get("status");

  if (typeof missionId !== "string" || typeof status !== "string") {
    redirect("/admin/missions?error=invalid_input");
  }
  if (!MISSION_STATUSES.includes(status as (typeof MISSION_STATUSES)[number])) {
    redirect("/admin/missions?error=invalid_input");
  }

  const admin = createAdminClient();
  const { data: before } = await admin
    .from("missions")
    .select("status, title, game_days(day_number)")
    .eq("id", missionId)
    .maybeSingle();

  const { error } = await admin.from("missions").update({ status }).eq("id", missionId);
  if (error) {
    redirect("/admin/missions?error=update_failed");
  }

  await logAdminActivity(admin, {
    actorId: actor.id,
    action: "mission_status_changed",
    targetType: "mission",
    targetId: missionId,
    metadata: { title: before?.title, previous_status: before?.status, new_status: status },
  });

  // Phase 11: players on that day's page live-refresh instead of needing
  // to reload to see a newly-published (or paused) mission. The payload
  // carries no mission detail — the client's own refetch (RLS-scoped) is
  // what actually reveals or hides it, per the "broadcast is a ping, not
  // the data" rule in src/lib/realtime/broadcast.ts.
  const dayNumber = before?.game_days?.day_number;
  if (dayNumber) {
    await broadcast(`game:day:${dayNumber}`, "mission.updated");
  }

  revalidatePath("/admin/missions");
  redirect("/admin/missions?success=1");
}

const GAME_DAY_STATUSES = ["DRAFT", "SCHEDULED", "LIVE", "COMPLETED"] as const;

/**
 * Real gap found and fixed during a live end-to-end audit: `game_days` is
 * created as DRAFT (see createMission's "lazily created" comment) and, until
 * this action existed, NOTHING in the app ever changed it — no admin
 * control existed anywhere to publish a day. Since the player-facing RLS
 * policy on `game_days` (and, by extension, `missions`/`challenges`/
 * `challenge_options`, which all join through a day's/mission's own
 * visibility) requires status in ('LIVE', 'COMPLETED'), this meant a
 * mission could be set LIVE by an admin and still be permanently invisible
 * to every player — the day one level up was silently blocking it. Found by
 * actually running the full create-mission-then-answer-it loop as a real
 * player, not by reading the code — the same category of bug this project's
 * own precedent (Phase 2/3's live-testing catches) warns is easy to miss
 * with `pnpm verify` alone, since every layer typechecks and lints cleanly
 * in isolation.
 */
export async function updateGameDayStatus(formData: FormData) {
  const actor = await getCurrentUser();
  if (!actor) redirect("/login");

  const roles = await getCurrentRoles();
  if (!canManageContent(roles)) {
    redirect("/admin/missions?error=not_authorized");
  }

  const gameDayId = formData.get("gameDayId");
  const status = formData.get("status");

  if (typeof gameDayId !== "string" || typeof status !== "string") {
    redirect("/admin/missions?error=invalid_input");
  }
  if (!GAME_DAY_STATUSES.includes(status as (typeof GAME_DAY_STATUSES)[number])) {
    redirect("/admin/missions?error=invalid_input");
  }

  const admin = createAdminClient();
  const { data: before } = await admin
    .from("game_days")
    .select("status, day_number")
    .eq("id", gameDayId)
    .maybeSingle();

  const { error } = await admin.from("game_days").update({ status }).eq("id", gameDayId);
  if (error) {
    redirect("/admin/missions?error=update_failed");
  }

  await logAdminActivity(admin, {
    actorId: actor.id,
    action: "game_day_status_changed",
    targetType: "game_day",
    targetId: gameDayId,
    metadata: { day_number: before?.day_number, previous_status: before?.status, new_status: status },
  });

  if (before?.day_number) {
    await broadcast(`game:day:${before.day_number}`, "day.updated");
  }

  revalidatePath("/admin/missions");
  revalidatePath("/play/day/[dayNumber]", "page");
  redirect("/admin/missions?success=1");
}
