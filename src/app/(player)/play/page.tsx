import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/session";
import { signOut } from "@/app/logout/actions";
import { createClient } from "@/lib/supabase/server";
import { PlayerTransition } from "@/components/story/founder/PlayerTransition";
import { JourneyPattern } from "@/components/JourneyPattern";
import { getJourneyStopForDay, JOURNEY_STOPS } from "@/content/journey";

export const metadata: Metadata = {
  title: "Play — ITM@15",
};

export const dynamic = "force-dynamic";

const SHELL_LINKS = [
  {
    href: "/passport",
    label: "Passport",
    blurb: "Your country stamps, collected from real activity.",
  },
  {
    href: "/leaderboards",
    label: "Leaderboard",
    blurb: "See where you and your country stand.",
  },
  {
    href: "/gallery",
    label: "Gallery",
    blurb: "Approved photos from the campaign.",
  },
  {
    href: "/achievements",
    label: "Achievements",
    blurb: "Badges earned along the way.",
  },
] as const;

type LiveMission = {
  id: string;
  title: string;
  description: string | null;
  basePoints: number;
  unityPoints: number;
  dayNumber: number;
  dayTitle: string;
};

/**
 * Experience Transformation Slice 1 (2026-09-16) — this page previously
 * always rendered a static "the mission engine isn't built yet" shell,
 * regardless of real game state. That was accurate when originally
 * written (Phase 4, before Phases 6+ existed) but has been stale since
 * the campaign went live with real seeded missions for all 7 days
 * (docs/PROJECT_STATE.md's "Campaign gone live" section) — the single
 * biggest concrete cause of the "feels like an exam" feedback: a player's
 * actual home screen showed them nothing to do.
 *
 * Finds the player's next real, uncompleted, LIVE mission (lowest day
 * number first) and makes it the one dominant primary action on the
 * screen (brief §9/§20) instead of a wall of equally-weighted nav links.
 * Never invents a mission, a day theme, or a "today" that doesn't
 * actually exist — if nothing is LIVE yet, or everything LIVE is already
 * completed, that is shown honestly.
 */
export default async function PlayPage() {
  const [profile, user] = await Promise.all([getCurrentProfile(), getCurrentUser()]);
  const greetingName = profile?.first_name || profile?.email;

  const supabase = await createClient();

  let countryName: string | null = null;
  if (profile?.country_id) {
    const { data: country } = await supabase
      .from("countries")
      .select("name")
      .eq("id", profile.country_id)
      .maybeSingle();
    countryName = country?.name ?? null;
  }

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextMission: LiveMission | null = null;
  let allCaughtUp = false;
  let reachedFinale = false;

  if (campaign && user) {
    const { data: days } = await supabase
      .from("game_days")
      .select("id, day_number, title")
      .eq("campaign_id", campaign.id)
      .eq("status", "LIVE")
      .order("day_number");

    const dayById = new Map((days ?? []).map((d) => [d.id, d]));
    const dayIds = (days ?? []).map((d) => d.id);

    const { data: missions } =
      dayIds.length > 0
        ? await supabase
            .from("missions")
            .select("id, title, description, base_points, unity_points, game_day_id")
            .in("game_day_id", dayIds)
            .eq("status", "LIVE")
        : { data: [] };

    const missionIds = (missions ?? []).map((m) => m.id);
    const { data: challenges } =
      missionIds.length > 0
        ? await supabase.from("challenges").select("id, mission_id").in("mission_id", missionIds)
        : { data: [] };

    const challengeIds = (challenges ?? []).map((c) => c.id);
    const { data: approvedSubmissions } =
      challengeIds.length > 0
        ? await supabase
            .from("submissions")
            .select("challenge_id")
            .eq("player_id", user.id)
            .eq("status", "APPROVED")
            .in("challenge_id", challengeIds)
        : { data: [] };

    const approvedChallengeIds = new Set((approvedSubmissions ?? []).map((s) => s.challenge_id));
    const missionIdToChallengeIds = new Map<string, string[]>();
    for (const c of challenges ?? []) {
      const list = missionIdToChallengeIds.get(c.mission_id) ?? [];
      list.push(c.id);
      missionIdToChallengeIds.set(c.mission_id, list);
    }

    const sortedMissions = [...(missions ?? [])].sort((a, b) => {
      const dayA = dayById.get(a.game_day_id)?.day_number ?? 0;
      const dayB = dayById.get(b.game_day_id)?.day_number ?? 0;
      return dayA - dayB;
    });

    const firstIncomplete = sortedMissions.find((m) => {
      const challengeIdsForMission = missionIdToChallengeIds.get(m.id) ?? [];
      // A mission with no challenge configured yet can't be "completed" —
      // treat it as not actionable rather than silently skipping it.
      return challengeIdsForMission.length === 0 || !challengeIdsForMission.some((id) => approvedChallengeIds.has(id));
    });

    if (firstIncomplete) {
      const day = dayById.get(firstIncomplete.game_day_id);
      nextMission = {
        id: firstIncomplete.id,
        title: firstIncomplete.title,
        description: firstIncomplete.description,
        basePoints: firstIncomplete.base_points,
        unityPoints: firstIncomplete.unity_points,
        dayNumber: day?.day_number ?? 0,
        dayTitle: day?.title ?? "",
      };
    } else if (sortedMissions.length > 0) {
      allCaughtUp = true;

      // Kinshasa finale (brief §7): only shown once the player has a real,
      // server-verified APPROVED submission for every Day 7 mission that's
      // actually LIVE — never just "nothing else is open right now," which
      // could be true on Day 2 if Days 3-7 simply haven't published yet.
      // No fabricated "you finished the journey" moment.
      const day7Missions = sortedMissions.filter((m) => dayById.get(m.game_day_id)?.day_number === 7);
      reachedFinale =
        day7Missions.length > 0 &&
        day7Missions.every((m) => (missionIdToChallengeIds.get(m.id) ?? []).some((id) => approvedChallengeIds.has(id)));
    }
  }

  const kinshasa = JOURNEY_STOPS.find((s) => s.themeKey === "journey_kinshasa");

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-10 sm:px-6">
      {profile?.first_name ? (
        <PlayerTransition firstName={profile.first_name} countryName={countryName} />
      ) : null}

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15 — Wally Takeover
        </p>
        <h1 className="text-3xl">Hi, {greetingName}.</h1>
      </div>

      {nextMission ? (
        <Link
          href={`/play/mission/${nextMission.id}`}
          className="itm-card itm-hero-card itm-card--interactive relative flex flex-col gap-3 overflow-hidden p-7 text-walumo"
        >
          <JourneyPattern />
          <div className="relative flex flex-col gap-3 text-ink">
            <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
              Day {nextMission.dayNumber} · {nextMission.dayTitle}
              {(() => {
                const stop = getJourneyStopForDay(nextMission.dayNumber);
                return stop ? ` · ${stop.countryFlag} ${stop.countryName} — ${stop.tagline}` : "";
              })()}
            </p>
            <h2 className="text-2xl font-semibold">{nextMission.title}</h2>
            {nextMission.description ? (
              <p className="max-w-md text-sm text-muted">{nextMission.description}</p>
            ) : null}
            <p className="mt-2 text-sm font-medium text-ink">
              Continue the journey →
              <span className="ml-2 text-xs font-normal text-muted">
                {nextMission.basePoints} pts
                {nextMission.unityPoints > 0 ? ` + ${nextMission.unityPoints} unity` : ""}
              </span>
            </p>
          </div>
        </Link>
      ) : reachedFinale && kinshasa ? (
        <div className="itm-card itm-hero-card itm-hero-card--gold relative flex flex-col gap-2 overflow-hidden p-7 text-gold">
          <JourneyPattern />
          <div className="relative flex flex-col gap-2 text-ink">
            <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">
              {kinshasa.countryFlag} {kinshasa.countryName}
            </p>
            <h2 className="text-2xl font-semibold">{kinshasa.tagline}</h2>
            <p className="max-w-md text-sm text-muted">
              You&apos;ve completed every chapter of the journey. Fifteen years, seven days, one
              story — thank you for being part of it.
            </p>
          </div>
        </div>
      ) : allCaughtUp ? (
        <div className="itm-card flex flex-col gap-2 p-7">
          <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
            All caught up
          </p>
          <p className="text-sm text-muted">
            You&apos;ve completed everything that&apos;s open right now. The next chapter is on its
            way — check back soon.
          </p>
        </div>
      ) : (
        <div className="itm-card flex flex-col gap-2 p-7">
          <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
            Nothing open yet
          </p>
          <p className="text-sm text-muted">
            The next chapter hasn&apos;t started. In the meantime, the{" "}
            <a href="/preview" className="text-walumo underline underline-offset-4">
              narrative walkthrough
            </a>{" "}
            previews the whole story arc.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SHELL_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="itm-card itm-card--interactive flex flex-col gap-1 p-5">
            <p className="font-semibold">{link.label}</p>
            <p className="mt-1 text-sm text-muted">{link.blurb}</p>
          </Link>
        ))}
      </div>

      <form action={signOut}>
        <button type="submit" className="btn-secondary self-start">
          Sign out
        </button>
      </form>
    </main>
  );
}
