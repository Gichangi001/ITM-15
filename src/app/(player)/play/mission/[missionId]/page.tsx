import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { MissionChallengeForm } from "./MissionChallengeForm";

export const metadata: Metadata = { title: "Mission — ITM@15" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Product Guide §7's player IA lists /play/mission/[missionId]. Reads via
 * the RLS-scoped server client (not the admin client) — a player should
 * only ever be able to fetch a mission/challenge they're actually eligible
 * for; the "players can read..." policies on missions/challenges/
 * challenge_options (supabase/migrations/20260913080000_...) are the real
 * gate here, not application logic. If a mission isn't visible to this
 * player, the query simply returns nothing and this renders the same
 * "not available" state as a nonexistent mission — never leaking whether
 * an ineligible mission exists at all.
 */
export default async function MissionPage({
  params,
}: {
  params: Promise<{ missionId: string }>;
}) {
  const { missionId } = await params;

  if (!UUID_RE.test(missionId)) {
    notFound();
  }

  const user = await getCurrentUser();
  if (!user) {
    notFound();
  }

  const supabase = await createClient();

  const { data: mission } = await supabase
    .from("missions")
    .select("id, title, description, status, base_points, unity_points")
    .eq("id", missionId)
    .maybeSingle();

  if (!mission) {
    return (
      <main className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-16 sm:px-6">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">Mission</p>
        <h1 className="text-3xl">Not available</h1>
        <p className="text-sm text-muted">
          This mission doesn&apos;t exist, isn&apos;t published yet, or isn&apos;t
          targeted at you.
        </p>
      </main>
    );
  }

  const { data: challenge } = await supabase
    .from("challenges")
    .select("id, type, prompt")
    .eq("mission_id", mission.id)
    .order("order_index")
    .limit(1)
    .maybeSingle();

  const { data: options } = challenge
    ? await supabase
        .from("challenge_options")
        .select("id, label")
        .eq("challenge_id", challenge.id)
        .order("order_index")
    : { data: [] };

  const { data: pastSubmissions } = challenge
    ? await supabase
        .from("submissions")
        .select("id, status, submitted_at")
        .eq("challenge_id", challenge.id)
        .eq("player_id", user.id)
        .order("submitted_at", { ascending: false })
    : { data: [] };

  const alreadyApproved = (pastSubmissions ?? []).some((s) => s.status === "APPROVED");
  const hasPendingSubmission = (pastSubmissions ?? []).some((s) => s.status === "PENDING");

  // The success confirmation a player sees right after answering correctly
  // (rendered client-side by MissionChallengeForm via useActionState) never
  // survives the Next.js refresh that `revalidatePath` triggers inside
  // `submitAnswer` — this Server Component immediately re-renders with
  // `alreadyApproved` now true, swapping the form (and its local success
  // state) out for the plain "already completed" branch before the player
  // can read it. Rather than fight that refresh, make the "already
  // completed" branch itself show the real points earned, computed
  // server-side from the authoritative `score_events` ledger (never from
  // what the client action believed it awarded) — this is also strictly
  // more correct than a one-shot confirmation, since it holds up on every
  // later visit/reload/back-navigation too, not just the instant after
  // submitting.
  let earnedPoints = 0;
  if (alreadyApproved) {
    const submissionIds = (pastSubmissions ?? []).map((s) => s.id);
    const { data: scoreEvents } = await supabase
      .from("score_events")
      .select("points, source_type, source_id")
      .eq("player_id", user.id)
      .or(
        `and(source_type.eq.MISSION,source_id.eq.${mission.id}),and(source_type.eq.SUBMISSION,source_id.in.(${submissionIds.length > 0 ? submissionIds.join(",") : "00000000-0000-0000-0000-000000000000"}))`,
      );
    earnedPoints = (scoreEvents ?? []).reduce((sum, e) => sum + e.points, 0);
  }

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">Mission</p>
        <h1 className="text-3xl">{mission.title}</h1>
        {mission.description ? <p className="text-sm text-muted">{mission.description}</p> : null}
        <p className="text-xs text-muted">
          {mission.base_points} points
          {mission.unity_points > 0 ? ` + ${mission.unity_points} unity points` : ""}
        </p>
      </div>

      {mission.status !== "LIVE" ? (
        <p className="text-sm text-muted">
          This mission isn&apos;t currently open for new submissions.
        </p>
      ) : !challenge ? (
        <p className="text-sm text-muted">This mission has no challenge configured yet.</p>
      ) : alreadyApproved ? (
        <p className="text-sm text-walumo">
          You&apos;ve already completed this mission. That counts.
          {earnedPoints > 0 ? ` +${earnedPoints} points earned.` : ""}
        </p>
      ) : hasPendingSubmission ? (
        <p className="text-sm text-muted">
          Your submission is with the moderators. Check back soon.
        </p>
      ) : (
        <>
          <p className="text-base text-ink">{challenge.prompt}</p>
          <MissionChallengeForm
            challenge={{
              id: challenge.id,
              type: challenge.type as "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "FREE_TEXT" | "PHOTO_UPLOAD",
              prompt: challenge.prompt,
              options: options ?? [],
            }}
            playerId={user.id}
          />
        </>
      )}
    </main>
  );
}
