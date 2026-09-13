import type { Metadata } from "next";
import { ComingSoon } from "@/components/player/ComingSoon";

export const metadata: Metadata = { title: "Achievements — ITM@15" };

export default function AchievementsPage() {
  return (
    <ComingSoon
      title="Achievements"
      description="Badges earned from real, validated activity (Product Guide §17) — none exist yet, since no missions are live."
      phase="Product Guide Phase 17 — Achievements & Passport"
    />
  );
}
