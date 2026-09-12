import type { WallyPoseKey } from "@/wally/rendering/assets";

/**
 * Narrative walkthrough content — Day 0 through Day 7.
 *
 * THIS IS PREVIEW CONTENT, NOT THE LIVE GAME. Every quote below is taken
 * directly from docs/ITM15_STORYLINE_EXPERIENCE_BUILD_BIBLE.md (the
 * document's own starter dialogue / scene direction, §8-19) — it is not
 * fabricated. But the "mission" descriptions are flavor text describing
 * what a day's mission is *about*, not a real, playable challenge: no
 * backend exists yet for missions, scoring, submissions, or the Wally
 * behaviour engine (see docs/PROJECT_AUDIT_CHECKLIST.md — Phases 2-13 are
 * all Pending). Do not extend this file to simulate scoring, accounts, or
 * anything that reads as functional gameplay rather than narrative preview
 * — see the Bible's own §39 "do not implement a fake demo" rule and the
 * Product Guide's server-authority rules. If a real mission engine is ever
 * built, this file's role becomes historical reference for tone, not a
 * data source.
 *
 * The synthetic name/country/squad ("Alexander" / Kenya / Squad Ubuntu)
 * come directly from the Bible's own examples (§10, §13) — not real
 * employee data.
 */

export interface WalkthroughSlide {
  day: number; // 0-7
  dayLabel: string;
  title: string;
  wallyPose: WallyPoseKey;
  wallyQuote: string;
  moment?: {
    heading: string;
    body: string;
  };
  nightClose?: string;
  letter?: string; // the I-B-E-L-O-N-G letter revealed this day, if any
}

export const WALKTHROUGH_SLIDES: WalkthroughSlide[] = [
  {
    day: 0,
    dayLabel: "Day 0",
    title: "Welcome, Alexander",
    wallyPose: "open-arms",
    wallyQuote: "You are not winning this alone. That's the point.",
    moment: {
      heading: "Squad Ubuntu",
      body:
        "Kenya confirmed. Country rank: unranked. Your ITM Passport opens — seven locked chapter seals, and one mystery slot, blank for now.",
    },
    nightClose: undefined,
  },
  {
    day: 1,
    dayLabel: "Day 1 — Origin",
    title: "The Eight",
    wallyPose: "investigate",
    wallyQuote: "Everyone loves the big number. I prefer the first one.",
    moment: {
      heading: "Reconstruct the beginning",
      body:
        "2011. Lubumbashi. Eight people. Your squad holds different fragments of the story — trade them, and the timeline assembles.",
    },
    nightClose:
      "Today you found where the story started. Tomorrow you lose home-field advantage.",
    letter: "I",
  },
  {
    day: 2,
    dayLabel: "Day 2 — One ITM, Many Cultures",
    title: "The Passport Hunt",
    wallyPose: "dance-pose",
    wallyQuote: "Today, your own country is the one place you can't hide.",
    moment: {
      heading: "Meet someone from Senegal",
      body:
        "Ask them what Teranga means to them. One sentence, one stamp — your passport gets a little richer.",
    },
    nightClose: "Two letters. Twenty conversations. Still think this is a quiz?",
    letter: "B",
  },
  {
    day: 3,
    dayLabel: "Day 3 — The Journey",
    title: "Memory Vault",
    wallyPose: "sleeping",
    wallyQuote: "A meeting ends. A memory doesn't. Let's see what survived.",
    moment: {
      heading: "Guess the memory",
      body:
        "Nairobi. Dar es Salaam. Lusaka. Abidjan. An old photo, half its story hidden — where was this, really?",
    },
    nightClose:
      "We crossed countries. Tomorrow we stop looking at places and look at people.",
    letter: "E",
  },
  {
    day: 4,
    dayLabel: "Day 4 — The People",
    title: "Give Them Their Flowers",
    wallyPose: "normal",
    wallyQuote: "Companies remember numbers. People remember people.",
    moment: {
      heading: "Find the invisible work",
      body:
        "Someone whose work helps yours, but you rarely speak to. A short conversation. One thing about them others may not see.",
    },
    nightClose: "Tomorrow, history stops looking backward.",
    letter: "L",
  },
  {
    day: 5,
    dayLabel: "Day 5 — Walumo",
    title: "The Builders Enter",
    wallyPose: "stop",
    wallyQuote:
      "ITM spent years solving problems with people. What happens when we start building the technology too?",
    moment: {
      heading: "Three requests. Two countries. One approval missing.",
      body: "Fix the operation. That's why KaziPro exists — not the slide, the problem.",
    },
    nightClose:
      "You've seen what we can build. Tomorrow I remove the easiest way to win.",
    letter: "O",
  },
  {
    day: 6,
    dayLabel: "Day 6 — The Alliance",
    title: "You Cannot Win Alone",
    wallyPose: "lean-clock",
    wallyQuote: "Today, being brilliant alone is almost useless.",
    moment: {
      heading: "The map is dark",
      body:
        "Every active country must complete one action within 30 minutes to relight it. Watch it happen, live, together.",
    },
    nightClose:
      "Six days. Six letters. Tomorrow you find out what you were really collecting.",
    letter: "N",
  },
  {
    day: 7,
    dayLabel: "Day 7 — Legacy",
    title: "Write the Next 15",
    wallyPose: "tired-sitting",
    wallyQuote: "You thought this was a game about points. It wasn't.",
    moment: {
      heading: "Seal your time capsule",
      body:
        "What should ITM never lose? What must it become better at? What do you want to contribute to the next chapter?",
    },
    nightClose: "That was the mission.",
    letter: "G",
  },
];

export const FINAL_REVEAL_LETTERS = ["I", "B", "E", "L", "O", "N", "G"];
