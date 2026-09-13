import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentRoles } from "@/lib/auth/session";
import { canAwardBonusPoints } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlayerLeaderboard } from "@/lib/scoring/leaderboard";
import { AwardPointsForm } from "./AwardPointsForm";

export const metadata: Metadata = { title: "Scoring — ITM@15" };

export default async function ScoringPage() {
  const roles = await getCurrentRoles();
  if (!canAwardBonusPoints(roles)) {
    redirect("/admin");
  }

  const admin = createAdminClient();
  const [{ data: players }, leaderboard] = await Promise.all([
    admin.from("profiles").select("id, email, full_name").eq("status", "ACTIVE").order("email"),
    getPlayerLeaderboard(20),
  ]);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 bg-bg px-6 py-16">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15 — Mission Control
        </p>
        <h1 className="text-3xl">Scoring</h1>
        <p className="text-sm text-muted">
          Every award writes a real, traceable score event and an audit log
          entry.
        </p>
      </div>

      <AwardPointsForm players={players ?? []} />

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold tracking-[0.15em] text-muted uppercase">
          Leaderboard (top 20)
        </h2>
        {leaderboard.length === 0 ? (
          <p className="text-sm text-muted">No points awarded yet.</p>
        ) : (
          <ol className="flex flex-col divide-y divide-white/5 rounded-xl border border-white/10 bg-surface">
            {leaderboard.map((entry, index) => (
              <li key={entry.playerId} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <span className="text-ink">
                  {index + 1}. {entry.displayName}
                  {entry.countryFlag ? ` ${entry.countryFlag}` : ""}
                </span>
                <span className="text-muted">{entry.points} pts</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
