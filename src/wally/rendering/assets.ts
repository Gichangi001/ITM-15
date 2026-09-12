/**
 * Wally 2D/Lite image asset registry — W0 scope per docs/WALLY.md §37
 * ("placeholder Wally asset registry", "no heavy 3D yet").
 *
 * SOURCE: `MASCOTTE.zip` (provided by the user, 2026-09-12) — 8 pre-rendered,
 * transparent-background poses of the Walumo brand mascot. Optimized from
 * the originals (500KB-1.3MB PNGs, up to 1536px) down to ~35-55KB WebP each
 * capped at 700px on the long edge, using `sharp` — see git history around
 * this file's introduction for the one-off conversion script.
 *
 * INTERIM STORAGE NOTE: these live in `public/wally/` (served directly by
 * Next.js) rather than the Supabase Storage `wally-assets` bucket the
 * Product Guide §12.1 calls for, because no live ITM@15 Supabase project is
 * reachable from this session yet (see docs/PROJECT_STATE.md). Treat
 * `public/wally/` as a placeholder location — migrate these into Storage
 * and drop them from the Next.js bundle output once Phase 1 unblocks and
 * the `wally_assets` table (see `supabase/migrations/`) can actually be
 * queried instead of hard-coded here.
 *
 * SPEC RECONCILIATION NEEDED — flagged, not resolved: docs/WALLY.md §3.1/§20
 * describes Wally as an explorer/traveller character with day-by-day
 * costume changes (backpack, camera, medal, hoodie, festival gear). The
 * actual production art in MASCOTTE.zip is a single, consistent
 * Walumo-branded professional character (white polo/shirt + tie, "WALUMO"
 * logo) in situational poses (leaning on/sleeping against a giant clock,
 * holding a stop sign, investigating with a magnifying glass) — no costume
 * variation, and a punctuality/time theme rather than an
 * explorer/travel-through-ITM's-history theme. This registry uses the real
 * art as-is rather than guessing which spec detail should win. Do not
 * silently build the Day 1-7 skin system against this registry as if it
 * satisfies WALLY.md §20 — it doesn't yet. Surface this to the product
 * owner before Phase 13 (Wally 2D behaviour prototype) starts.
 */

export type WallyPoseKey =
  | "normal"
  | "open-arms"
  | "stop"
  | "investigate"
  | "lean-clock"
  | "tired-sitting"
  | "sleeping"
  | "dance-pose";

export interface WallyPoseAsset {
  /** Public path, servable directly by Next.js. */
  src: `/wally/${string}.webp`;
  /** Natural width/height after optimization, for layout stability. */
  width: number;
  height: number;
  /** What the pose actually shows — for whoever wires this into events next. */
  description: string;
  /**
   * Tentative mapping to docs/WALLY.md §5's event catalogue / §11's
   * animation library. Tentative because these are static poses, not
   * rigged animation clips — treat as "closest available placeholder for
   * this event," not a literal fulfillment of the animation spec.
   */
  suggestedFor: string[];
}

export const WALLY_POSES: Record<WallyPoseKey, WallyPoseAsset> = {
  normal: {
    src: "/wally/normal.webp",
    width: 700,
    height: 700,
    description: "Neutral head-and-shoulders portrait, smiling.",
    suggestedFor: ["idle_primary", "LOGIN_GREETING", "avatar/header use"],
  },
  "open-arms": {
    src: "/wally/open-arms.webp",
    width: 700,
    height: 700,
    description: "Full body, arms spread wide in welcome.",
    suggestedFor: ["wave", "FIRST_LOGIN_WELCOME", "ONBOARDING_COMPLETE"],
  },
  stop: {
    src: "/wally/stop.webp",
    width: 700,
    height: 700,
    description: "Holding a STOP sign, pointing with the other hand.",
    suggestedFor: ["point_right", "WRONG_ANSWER", "GAME_PAUSED"],
  },
  investigate: {
    src: "/wally/investigate.webp",
    width: 700,
    height: 700,
    description: "Mid-stride, holding a magnifying glass, searching.",
    suggestedFor: ["walk", "think", "MISSION_AVAILABLE", "GOLDEN_WALLY_HINT"],
  },
  "lean-clock": {
    src: "/wally/lean-clock.webp",
    width: 509,
    height: 701,
    description: "Standing, arms crossed, leaning against a large clock.",
    suggestedFor: ["proud", "idle_secondary", "countdown/timer UI"],
  },
  "tired-sitting": {
    src: "/wally/tired-sitting.webp",
    width: 700,
    height: 467,
    description: "Sitting, visibly tired, leaning against a clock.",
    suggestedFor: ["PLAYER_INACTIVE", "AMBIENT_IDLE (low-energy variant)"],
  },
  sleeping: {
    src: "/wally/sleeping.webp",
    width: 700,
    height: 467,
    description: "Lying down asleep in front of a clock.",
    suggestedFor: ["sleep", "GAME_PAUSED (extended)", "empty states"],
  },
  "dance-pose": {
    src: "/wally/dance-pose.webp",
    width: 482,
    height: 700,
    description: "Dynamic side-profile pose, one arm raised.",
    suggestedFor: ["dance", "celebrate_big", "MISSION_COMPLETED"],
  },
};
