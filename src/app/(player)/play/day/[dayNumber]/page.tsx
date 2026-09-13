import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LiveRefresh } from "@/components/realtime/LiveRefresh";

export const metadata: Metadata = { title: "Day — ITM@15" };

const LIVE_EVENTS = ["mission.updated", "day.updated"] as const;

/**
 * Product Guide §7's player IA lists /play/day/[dayNumber]. Reads via the
 * RLS-scoped client — a day/its missions only show up here if the
 * "players can read live or completed game days"/"...missions targeted at
 * them" policies actually allow it (supabase/migrations/
 * 20260913080000_...), the same real gate the mission page relies on.
 */
export default async function DayPage({
  params,
}: {
  params: Promise<{ dayNumber: string }>;
}) {
  const { dayNumber: dayNumberParam } = await params;
  const dayNumber = Number(dayNumberParam);

  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 7) {
    notFound();
  }

  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: day } = campaign
    ? await supabase
        .from("game_days")
        .select("id, title, theme")
        .eq("campaign_id", campaign.id)
        .eq("day_number", dayNumber)
        .maybeSingle()
    : { data: null };

  if (!day) {
    return (
      <main className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-16 sm:px-6">
        {/* Phase 11: this exact page live-refreshes the moment an admin
            publishes the day/mission this bug (see updateGameDayStatus's
            header comment) was originally found through — no reload
            needed to see it become real. */}
        <LiveRefresh topic={`game:day:${dayNumber}`} events={LIVE_EVENTS} />
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">Day {dayNumber}</p>
        <h1 className="text-3xl">Not published yet</h1>
        <p className="text-sm text-muted">
          Day {dayNumber}&apos;s story and missions haven&apos;t been published. Curious
          what Day {dayNumber} will feel like? The{" "}
          <a href="/preview" className="text-walumo underline underline-offset-4">
            narrative walkthrough
          </a>{" "}
          previews the whole story arc.
        </p>
      </main>
    );
  }

  const { data: missions } = await supabase
    .from("missions")
    .select("id, title, description, base_points, unity_points, status")
    .eq("game_day_id", day.id)
    .order("created_at");

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-16 sm:px-6">
      <LiveRefresh topic={`game:day:${dayNumber}`} events={LIVE_EVENTS} />
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">Day {dayNumber}</p>
        <h1 className="text-3xl">{day.title}</h1>
        {day.theme ? <p className="text-sm text-muted">{day.theme}</p> : null}
      </div>

      {!missions || missions.length === 0 ? (
        <p className="text-sm text-muted">No missions published for this day yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {missions.map((mission) => (
            <Link
              key={mission.id}
              href={`/play/mission/${mission.id}`}
              className="flex flex-col gap-1 rounded-xl border border-white/10 bg-surface p-5 transition hover:border-walumo/40"
            >
              <p className="font-semibold text-ink">{mission.title}</p>
              {mission.description ? (
                <p className="text-sm text-muted">{mission.description}</p>
              ) : null}
              <p className="text-xs text-muted">
                {mission.base_points} points
                {mission.unity_points > 0 ? ` + ${mission.unity_points} unity` : ""}
                {mission.status === "COMPLETED" ? " · completed" : ""}
                {mission.status === "PAUSED" ? " · paused" : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
