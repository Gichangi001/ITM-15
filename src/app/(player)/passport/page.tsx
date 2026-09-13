import type { Metadata } from "next";
import { ComingSoon } from "@/components/player/ComingSoon";

export const metadata: Metadata = { title: "Passport — ITM@15" };

export default function PassportPage() {
  return (
    <ComingSoon
      title="Passport"
      description="Your ITM Passport will collect a stamp for every country you connect with during the seven days, unlocked from real, moderator-approved activity (Product Guide §17) — never fabricated in advance."
      phase="Product Guide Phase 17 — Achievements & Passport"
    />
  );
}
