import type { Metadata } from "next";
import { FounderStory } from "@/components/story/founder/FounderStory";

export const metadata: Metadata = {
  title: "ITM@15 — The Man Before the Group",
  description:
    "Before the countries, before the thousands of people — there was one belief. The story of Mr Sylva Monga and the eight people who started ITM.",
};

/**
 * docs/ITM15_FOUNDER_STORY_OPENING_CHAPTER.md — public, pre-login. Linked
 * from the homepage's own "Enter the story" flow (src/app/page.tsx).
 */
export default function FounderStoryPage() {
  return <FounderStory />;
}
