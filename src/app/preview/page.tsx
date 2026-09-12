import type { Metadata } from "next";
import { WalkthroughPreview } from "@/components/WalkthroughPreview";

export const metadata: Metadata = {
  title: "ITM@15 — Narrative Preview",
  description:
    "A scripted walkthrough of the seven-day ITM@15 story, Day 0 through the final reveal. Not the live game.",
};

export default function PreviewPage() {
  return <WalkthroughPreview />;
}
