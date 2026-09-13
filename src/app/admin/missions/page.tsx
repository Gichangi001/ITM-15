import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentRoles } from "@/lib/auth/session";
import { canManageContent } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateGameDayStatus, updateMissionStatus } from "./actions";

export const metadata: Metadata = { title: "Missions — ITM@15" };

const ERROR_MESSAGES: Record<string, string> = {
  not_authorized: "You are not authorized to manage content.",
  invalid_input: "That update didn't look right — nothing was changed.",
  update_failed: "Something went wrong saving that change. Try again.",
};

const STATUS_OPTIONS = ["DRAFT", "SCHEDULED", "LIVE", "PAUSED", "COMPLETED", "ARCHIVED"] as const;
const DAY_STATUS_OPTIONS = ["DRAFT", "SCHEDULED", "LIVE", "COMPLETED"] as const;

/**
 * Product Guide §26 Phase 6 acceptance: "Admin creates a mission without
 * code... Draft mission is invisible to player." Game Master/Super
 * Admin-only — see canManageContent. Reads via the service-role admin
 * client since an admin managing content needs to see every mission
 * regardless of status/audience, which the player-facing RLS policy
 * correctly refuses.
 */
export default async function MissionsPage({
  searchParams,
}: PageProps<"/admin/missions">) {
  const roles = await getCurrentRoles();
  if (!canManageContent(roles)) {
    redirect("/admin");
  }

  const params = await searchParams;
  const errorParam = typeof params.error === "string" ? params.error : undefined;
  const errorMessage = errorParam ? ERROR_MESSAGES[errorParam] : undefined;
  const succeeded = params.success === "1";

  const admin = createAdminClient();
  const [{ data: days }, { data: missions }, { data: challenges }] = await Promise.all([
    admin.from("game_days").select("id, day_number, title, status").order("day_number"),
    admin
      .from("missions")
      .select("id, game_day_id, title, status, base_points, unity_points")
      .order("created_at", { ascending: false }),
    admin.from("challenges").select("id, mission_id, type"),
  ]);

  const dayById = new Map((days ?? []).map((d) => [d.id, d]));
  const challengeByMission = new Map((challenges ?? []).map((c) => [c.mission_id, c]));

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 bg-bg px-6 py-16">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15 — Mission Control
        </p>
        <h1 className="text-3xl">Missions</h1>
        <p className="text-sm text-muted">
          Create missions and control their visibility. Players only ever see
          LIVE, PAUSED or COMPLETED missions.
        </p>
        <Link href="/admin/missions/new" className="btn-secondary self-start">
          New mission
        </Link>
      </div>

      {succeeded ? (
        <p role="status" className="text-sm text-walumo">
          Updated.
        </p>
      ) : null}
      {errorMessage ? (
        <p role="alert" className="text-sm text-red-400">
          {errorMessage}
        </p>
      ) : null}

      {/* A mission's own status is necessary but not sufficient — its
          containing day must also be LIVE/COMPLETED before a player can see
          anything inside it at all (players can read live or completed
          game days, Product Guide §26 Phase 6 acceptance applied one level
          up). Days are created lazily by the first mission added to them
          (see createMission), so only days with at least one mission
          appear here. */}
      {!days || days.length === 0 ? (
        <p className="text-sm text-muted">No days created yet — add a mission to create one.</p>
      ) : (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold tracking-[0.15em] text-muted uppercase">Days</h2>
          {days.map((day) => (
            <div
              key={day.id}
              className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-sm text-ink">
                Day {day.day_number} · {day.title}
              </p>
              <form action={updateGameDayStatus} className="flex items-center gap-2">
                <input type="hidden" name="gameDayId" value={day.id} />
                <select
                  name="status"
                  defaultValue={day.status}
                  className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-ink"
                >
                  {DAY_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
                  Save
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {!missions || missions.length === 0 ? (
        <p className="text-sm text-muted">No missions yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {missions.map((mission) => {
            const day = dayById.get(mission.game_day_id);
            const challenge = challengeByMission.get(mission.id);
            return (
              <div
                key={mission.id}
                className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm text-ink">{mission.title}</p>
                  <p className="text-xs text-muted">
                    Day {day?.day_number ?? "?"} · {challenge?.type ?? "no challenge"} ·{" "}
                    {mission.base_points} pts
                    {mission.unity_points > 0 ? ` + ${mission.unity_points} unity` : ""}
                  </p>
                </div>
                <form action={updateMissionStatus} className="flex items-center gap-2">
                  <input type="hidden" name="missionId" value={mission.id} />
                  <select
                    name="status"
                    defaultValue={mission.status}
                    className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-ink"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
                    Save
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
