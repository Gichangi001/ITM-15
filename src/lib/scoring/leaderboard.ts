import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Phase 8 (Product Guide §10.3) leaderboard aggregation. Reads via the
 * service-role admin client — a leaderboard is inherently a cross-player
 * view, which the RLS "own row" policy on score_events correctly refuses
 * to a plain authenticated client. This is the ONLY sanctioned way to see
 * anyone else's score events: pre-aggregated totals through this function,
 * never raw per-event access to another player's ledger.
 */

export type PlayerLeaderboardEntry = {
  playerId: string;
  displayName: string;
  countryName: string | null;
  countryFlag: string | null;
  points: number;
};

export type CountryLeaderboardEntry = {
  countryId: string;
  countryName: string;
  countryFlag: string | null;
  points: number;
};

export async function getPlayerLeaderboard(limit = 50): Promise<PlayerLeaderboardEntry[]> {
  const admin = createAdminClient();

  const { data: events } = await admin
    .from("score_events")
    .select("player_id, points")
    .not("player_id", "is", null);

  const totals = new Map<string, number>();
  for (const event of events ?? []) {
    if (!event.player_id) continue;
    totals.set(event.player_id, (totals.get(event.player_id) ?? 0) + event.points);
  }

  const playerIds = [...totals.keys()];
  if (playerIds.length === 0) return [];

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name, email, country_id")
    .in("id", playerIds);

  const countryIds = [...new Set((profiles ?? []).map((p) => p.country_id).filter(Boolean))] as string[];
  const { data: countries } =
    countryIds.length > 0
      ? await admin.from("countries").select("id, name, flag_emoji").in("id", countryIds)
      : { data: [] as { id: string; name: string; flag_emoji: string | null }[] };
  const countryById = new Map((countries ?? []).map((c) => [c.id, c]));

  const entries: PlayerLeaderboardEntry[] = (profiles ?? []).map((profile) => {
    const country = profile.country_id ? countryById.get(profile.country_id) : undefined;
    return {
      playerId: profile.id,
      displayName: profile.full_name || profile.email,
      countryName: country?.name ?? null,
      countryFlag: country?.flag_emoji ?? null,
      points: totals.get(profile.id) ?? 0,
    };
  });

  return entries.sort((a, b) => b.points - a.points).slice(0, limit);
}

export async function getCountryLeaderboard(): Promise<CountryLeaderboardEntry[]> {
  const admin = createAdminClient();

  // Two sources of country points: score_events awarded directly to a
  // country (country_id set, player_id null — e.g. a country-wide bonus),
  // and every player's own points rolled up by their profile's country.
  const [{ data: directEvents }, { data: playerEvents }, { data: profiles }, { data: countries }] =
    await Promise.all([
      admin.from("score_events").select("country_id, points").not("country_id", "is", null),
      admin.from("score_events").select("player_id, points").not("player_id", "is", null),
      admin.from("profiles").select("id, country_id"),
      admin.from("countries").select("id, name, flag_emoji"),
    ]);

  const countryById = new Map((countries ?? []).map((c) => [c.id, c]));
  const countryOfPlayer = new Map((profiles ?? []).map((p) => [p.id, p.country_id]));

  const totals = new Map<string, number>();

  for (const event of directEvents ?? []) {
    if (!event.country_id) continue;
    totals.set(event.country_id, (totals.get(event.country_id) ?? 0) + event.points);
  }

  for (const event of playerEvents ?? []) {
    if (!event.player_id) continue;
    const countryId = countryOfPlayer.get(event.player_id);
    if (!countryId) continue;
    totals.set(countryId, (totals.get(countryId) ?? 0) + event.points);
  }

  const entries: CountryLeaderboardEntry[] = [...totals.entries()]
    .map(([countryId, points]) => {
      const country = countryById.get(countryId);
      return {
        countryId,
        countryName: country?.name ?? "Unknown",
        countryFlag: country?.flag_emoji ?? null,
        points,
      };
    })
    .sort((a, b) => b.points - a.points);

  return entries;
}
