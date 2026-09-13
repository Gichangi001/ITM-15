import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Achievements — ITM@15" };

// This page reads no per-request data that would force dynamic rendering
// on its own (achievements/player_achievements are read via the
// RLS-scoped client keyed off the session cookie) — force it anyway so a
// newly awarded badge is never served from a stale prerender. Same lesson
// as leaderboards/gallery earlier in this project.
export const dynamic = "force-dynamic";

/**
 * Product Guide §17. Every badge shown here — locked or unlocked — is a
 * real row from `public.achievements`; whether a given one is unlocked
 * comes from `public.player_achievements`, which is never
 * client-writable (see `src/lib/achievements/award.ts` for the only path
 * that ever inserts into it). No fabricated progress bars or "coming
 * soon" badges beyond what's actually seeded.
 */
export default async function AchievementsPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const [{ data: achievements }, { data: unlocked }] = await Promise.all([
    supabase.from("achievements").select("id, key, title, description, icon").order("created_at"),
    user
      ? supabase.from("player_achievements").select("achievement_id, awarded_at").eq("player_id", user.id)
      : Promise.resolve({ data: [] as { achievement_id: string; awarded_at: string }[] }),
  ]);

  const unlockedByAchievementId = new Map((unlocked ?? []).map((row) => [row.achievement_id, row.awarded_at]));

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">ITM@15</p>
        <h1 className="text-3xl">Achievements</h1>
        <p className="text-sm text-muted">
          Earned from real, validated activity — a badge here always traces back to a real
          completed mission, an approved cross-country connection, or a real vote result.
        </p>
      </div>

      {!achievements || achievements.length === 0 ? (
        <p className="text-sm text-muted">No achievements defined yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {achievements.map((achievement) => {
            const awardedAt = unlockedByAchievementId.get(achievement.id);
            const isUnlocked = awardedAt !== undefined;
            return (
              <li
                key={achievement.id}
                className={`flex flex-col gap-2 rounded-xl border p-5 ${
                  isUnlocked
                    ? "border-walumo/40 bg-surface"
                    : "border-white/5 bg-white/[0.02] opacity-60"
                }`}
              >
                <span className="text-3xl" aria-hidden="true">
                  {achievement.icon}
                </span>
                <p className="text-lg font-semibold text-ink">{achievement.title}</p>
                <p className="text-sm text-muted">{achievement.description}</p>
                {isUnlocked ? (
                  <p className="mt-auto text-xs text-walumo">
                    Unlocked {new Date(awardedAt).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="mt-auto text-xs text-muted">Locked</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
