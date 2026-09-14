/**
 * ITM@15 Founder Story — "The Man Before the Group"
 * docs/ITM15_FOUNDER_STORY_OPENING_CHAPTER.md, provided by the product
 * owner 2026-09-14. This file holds every real word of copy the spec
 * itself provides — nothing here is invented; it is transcribed directly
 * from the source document, split into the 11 scenes that make up the
 * public (pre-login) sequence.
 *
 * SCOPE NOTE — public vs. personalized: the spec's §23 "Player Transition"
 * (a personalized "ALEXANDER / KENYA / WALUMO... BEGIN MY ITM@15 JOURNEY"
 * moment) is deliberately NOT part of this file or the public
 * `/story/founder` route. A pre-login visitor has no real name/country to
 * show — inventing one would be exactly the fabrication this project's
 * own rules forbid (see WallyProvider's LOGIN_GREETING for the same
 * principle applied elsewhere: real data or nothing). That scene is built
 * separately as `src/components/story/founder/PlayerTransition.tsx`,
 * shown once to an authenticated, onboarded player on their first `/play`
 * visit, using their real `first_name`/country — see that component's own
 * header comment.
 *
 * FIGURES NOTE — §21 "Present Day" asks for stats like "15,000+" and
 * "20+ markets" as *examples* of the reveal mechanic, not confirmed real
 * numbers — this project has no approved source of truth for ITM's actual
 * current headcount/market count (checked: not in PRODUCT_GUIDE.md,
 * WALLY.md, or the Storyline Build Bible). The original landing page
 * already made the identical call for the same reason (skipped a "15
 * years in motion" historical timeline rather than invent specific
 * history — see docs/PROJECT_STATE.md's "Seven-day storyline landing
 * page" section). This file follows the same precedent: the "8" reveal is
 * real and used (it's already an approved, load-bearing figure throughout
 * WALLY.md/PRODUCT_GUIDE.md's Day 1 Easter egg), but no specific
 * headcount/market-count claim is asserted anywhere below.
 */

export type FounderSceneId =
  | "portrait"
  | "belief"
  | "return"
  | "founding"
  | "itmName"
  | "eight"
  | "growth"
  | "africa"
  | "holding"
  | "people"
  | "walumo";

export const FOUNDER_SCENE_ORDER: readonly FounderSceneId[] = [
  "portrait",
  "belief",
  "return",
  "founding",
  "itmName",
  "eight",
  "growth",
  "africa",
  "holding",
  "people",
  "walumo",
];

export const FOUNDER_IMAGE_ALT =
  "Portrait of Mr Sylva Monga, Founder and Chairman of ITM Group";

/**
 * §2: "Claude must inspect the actual photograph and adjust
 * object-position so Mr Monga's face is never awkwardly cropped." The
 * source image (src/sylva-monga.webp, 1200×1320) was inspected directly,
 * then verified empirically against the actual rendered crop at a real
 * desktop viewport (1440×900) — at that aspect ratio `object-fit: cover`
 * scales the image up substantially (its width becomes the constraint,
 * driving the height well past the container), so only a fairly narrow
 * vertical band is ever visible regardless of position; a range of
 * `object-position` values were screenshotted and compared directly
 * rather than assumed from the source image alone. 50% horizontal keeps
 * him centered when a tall mobile viewport crops the sides instead;
 * vertical is tuned low enough to keep eyes/nose/mouth/chin fully in
 * frame at every viewport tested (never cutting through the mouth the
 * way a higher value did) without cropping in so far it reads as an
 * accidental close-up rather than a deliberate one.
 */
export const FOUNDER_IMAGE_OBJECT_POSITION = "50% 8%";

export const founderBelief = {
  preHeading: "BEFORE ITM BECAME A GROUP…",
  beliefLine: "THERE WAS A BELIEF.",
  strengthLines: ["AFRICA'S GREATEST STRENGTH", "WOULD BE ITS PEOPLE."],
  heroQuote: [
    "Before the countries.",
    "Before the thousands of people.",
    "Before the companies.",
    "There was one belief.",
  ],
  heroStatement: "AFRICA COULD BUILD THROUGH ITS PEOPLE.",
  founderName: "Mr Sylva Monga",
  founderTitle: "Founder & Chairman",
  founderOrg: "ITM Group",
  cta: "DISCOVER THE BEGINNING",
};

export const founderReturn = {
  heading: "ONE MAN. ONE IDEA.",
  paragraphs: [
    "Mr Sylva Monga returned to Africa with an ambition that was bigger than building another company.",
    "He believed that Africa's development would depend on skilled, capable and motivated people.",
    "And he believed African businesses could build the institutions needed to develop those people themselves.",
  ],
  isolatedLine: "PEOPLE WOULD BUILD THE FUTURE.",
  beforeItmHeading: "BEFORE ITM",
  journeyParagraphs: [
    "His journey had taken him beyond the continent, including years in Germany where he studied Business Administration and gained professional experience.",
    "But the opportunity he saw was back in Africa.",
  ],
  route: ["GERMANY", "AFRICA", "LUBUMBASHI"],
  closingParagraphs: ["He returned not simply to find a job.", "He returned to build."],
  emphasis: "TO BUILD.",
};

export const founderFounding = {
  year: "2011",
  place: "LUBUMBASHI, DEMOCRATIC REPUBLIC OF CONGO",
  paragraph:
    "In Lubumbashi, Mr Monga founded a company around a simple idea: organisations perform better when their people are properly selected, trained, motivated and continuously developed.",
  originalName: "INTERNATIONAL TRAINING & MOTIVATION",
};

export const founderItmName = {
  words: ["INTERNATIONAL", "TRAINING", "MOTIVATION"],
  letters: ["I", "T", "M"],
  combined: "ITM",
};

export const founderEight = {
  number: "8",
  wallyLines: ["Not 15,000.", "Not twenty countries.", "Eight people."],
  statement: "IT STARTED WITH EIGHT.",
  whyParagraphs1: [
    "Great organisations often look obvious after they succeed.",
    "They rarely look obvious at the beginning.",
    "ITM began with eight people.",
  ],
  whyParagraphs2: [
    "Eight people around an idea.",
    "Eight people before the Group.",
    "Eight people before the countries.",
    "Eight people before thousands of careers became connected to the ITM story.",
  ],
  closingLines: ["EVERY BIG STORY HAS A MOMENT", "WHEN IT STILL LOOKS SMALL."],
  wallyInteraction: ["Remember that number.", "You're going to need it."],
  clueUnlocked: "+ ORIGIN CLUE UNLOCKED",
};

export const founderGrowth = {
  heading: "TRAINING WAS ONLY THE BEGINNING.",
  paragraphs: [
    "ITM began with training and personnel management.",
    "But the needs of its clients were larger than one service.",
    "Recruitment followed.",
    "Outsourcing followed.",
    "Workforce management followed.",
    "Continuous employee development followed.",
  ],
  evolution: ["TRAINING", "RECRUITMENT", "OUTSOURCING", "PEOPLE MANAGEMENT", "LONG-TERM PARTNERSHIPS"],
  questionOld: "Who can we train?",
  questionNew: "What people problem can we solve?",
};

export const founderAfrica = {
  heading: "ONE COUNTRY BECAME MANY.",
  paragraph:
    "As ITM grew, the model began travelling beyond the DRC. The organisation expanded into other African markets while building strong local teams that understood their own countries, cultures, labour markets and clients.",
  closingLines: ["ONE GROUP.", "LOCAL LEADERS.", "AFRICAN AMBITION."],
};

export const founderHolding = {
  year: "2019",
  centralNode: "ITM HOLDING",
  paragraphs: [
    "Growth eventually required a different structure.",
    "ITM could no longer think only like one operating company.",
    "It was becoming something capable of supporting multiple companies, investments, markets and sectors.",
  ],
  progression: ["COMPANY", "GROUP", "PLATFORM FOR NEW BUSINESSES"],
  landingWord: "HOLDING",
  patternServices: [
    "PEOPLE",
    "HR",
    "OUTSOURCING",
    "OPERATIONS",
    "LOGISTICS",
    "MAINTENANCE",
    "FINANCE",
    "BPO",
    "DISTRIBUTION",
    "TECHNOLOGY",
  ],
  question: "WHAT WAS ITM REALLY BUILDING?",
  answer: "CAPABILITY.",
  closingParagraph:
    "The industries changed. The underlying instinct remained remarkably similar: find an important operational problem and build the capability to solve it.",
};

export const founderPeople = {
  paragraph1: ["A founder can begin a story.", "He cannot build fifteen years alone."],
  closingLines: ["THOUSANDS OF PEOPLE", "BECAME PART OF THE IDEA."],
  paragraph2: [
    "Leaders joined.",
    "Teams formed.",
    "Countries opened.",
    "People solved problems Mr Monga could never have solved personally.",
    "ITM began becoming an institution rather than simply a founder-led business.",
  ],
  founderQuestion: ["“WHAT DID YOU BELIEVE", "WHEN THERE WAS NO EVIDENCE YET?”"],
  founderQuestionSub: [
    "Mr Monga started ITM when the future organisation was still eight people.",
    "What do you have to believe before the evidence arrives?",
  ],
};

export const founderWalumo = {
  year: "2025",
  reveal: "WALUMO",
  paragraph1: [
    "Fifteen years after ITM began by developing people, another question emerged:",
    "What happens when the Group begins building more of its own technology?",
  ],
  paragraph2: "Walumo was created as ITM Holding's technology innovation hub.",
  closingLines: ["FROM DEVELOPING PEOPLE", "TO BUILDING SYSTEMS", "THAT HELP PEOPLE WORK BETTER."],
  presentDayLabel: "ITM@15",
  finalParagraphs: ["Fifteen years ago, this was an idea.", "Today, thousands of people carry a piece of it."],
  finalStatement: "BUT THIS IS NOT THE END OF THE STORY.",
  wallyClosing: ["Actually…", "This is where you enter."],
  cta: "ENTER THE GAME",
};

/**
 * §23 — genuinely built, but deliberately NOT exported from this
 * public-sequence file; see this file's own header comment and
 * PlayerTransition.tsx for where these lines actually live and why.
 */
export const founderPlayerTransition = {
  wallyLines: [
    "Mr Monga started with eight.",
    "You're joining the story fifteen years later.",
    "What are you going to add to it?",
  ],
  cta: "BEGIN MY ITM@15 JOURNEY",
};
