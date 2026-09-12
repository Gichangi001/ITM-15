/**
 * The seven-day ITM@15 storyline, for the public landing page's story
 * section (docs/PRODUCT_GUIDE.md §6.2, "Teaser of seven locked chapters
 * without spoiling missions").
 *
 * Day titles and themes are taken directly from docs/PRODUCT_GUIDE.md §8.
 * The one-line copy below is new, written to evoke each day's *purpose*
 * without describing its actual mechanics (timeline reconstruction, clue
 * matching, nomination categories, etc.) — the Product Guide is explicit
 * that a public teaser must not spoil missions, so those details are
 * deliberately left out here even though they're documented in the guide.
 *
 * This is intentionally a static, hardcoded list for now. docs/PRODUCT_GUIDE.md
 * §2.1 requires game content to be database-driven once admins are expected
 * to edit it — that's the Content Engine, Phase 6. A public marketing teaser
 * for a fixed seven-day structure is reasonable to hardcode at this stage;
 * revisit if the day count/order themselves ever need to be admin-editable.
 *
 * Deliberately NOT included: the hidden per-day letter from docs/WALLY.md
 * §21 (I-B-E-L-O-N-G). Displaying it here — even out of order — would
 * spoil the mechanic that spec explicitly protects ("Do not reveal the
 * final phrase early").
 */

export interface StoryDay {
  day: number;
  title: string;
  theme: string;
  teaser: string;
}

export const STORY_DAYS: StoryDay[] = [
  {
    day: 1,
    title: "Origin",
    theme: "ITM's founding story and historical discovery",
    teaser:
      "Where it all began — uncover how eight people became one ITM.",
  },
  {
    day: 2,
    title: "One ITM, Many Cultures",
    theme: "Cross-country learning and social discovery",
    teaser:
      "Fifteen countries, one team — discover the cultures that built ITM.",
  },
  {
    day: 3,
    title: "The Journey",
    theme: "Annual review memories and travel history",
    teaser: "Every year left a mark — relive the journeys that shaped us.",
  },
  {
    day: 4,
    title: "The People",
    theme: "Recognition and appreciation",
    teaser: "Behind every milestone is a person. Today, we celebrate them.",
  },
  {
    day: 5,
    title: "Walumo",
    theme: "Meet the builders, and the products they've shipped",
    teaser: "Meet the builders — and the tools shaping ITM's future.",
  },
  {
    day: 6,
    title: "The Alliance",
    theme: "Collaboration across borders",
    teaser: "No country plays alone. Today, ITM comes together.",
  },
  {
    day: 7,
    title: "Legacy",
    theme: "An emotional close, and a pledge to what comes next",
    teaser:
      "Fifteen years are written. What happens next belongs to you.",
  },
];
