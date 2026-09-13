import type { Metadata } from "next";
import { ComingSoon } from "@/components/player/ComingSoon";

export const metadata: Metadata = { title: "Leaderboards — ITM@15" };

export default function LeaderboardsPage() {
  return (
    <ComingSoon
      title="Leaderboards"
      description="Individual, squad and country standings, built from a server-authoritative score ledger (Product Guide §10) — no scores exist yet, since no missions are live."
      phase="Product Guide Phase 8 — Authoritative Scoring & Leaderboards"
    />
  );
}
