/**
 * docs/WALLY.md §6 — priority/interruption rules for the Wally event
 * queue. Deterministic, pure logic (runbook §18.1 explicitly lists "Wally
 * event priority" as unit-testable business logic) — no realtime/DOM/React
 * dependency here, so it's exercised directly by `priority.test.ts` rather
 * than only through a live browser test.
 *
 * Scope for this first slice (Phase 13 W1/W2): a single active Wally
 * "slot" per client, not the full multi-item queue §6 eventually implies.
 * `shouldInterrupt` decides whether an incoming event replaces whatever is
 * currently showing; anything it doesn't replace is simply dropped rather
 * than queued — a real, disclosed scope boundary (see WallyProvider), not
 * an oversight. Ambient/ombient-queueing behaviour is deferred to a later
 * Wally slice once there's more than one event source to actually queue.
 */

export type WallyPriority =
  | "P0_CRITICAL"
  | "P1_LIVE_EVENT"
  | "P2_PLAYER_RESULT"
  | "P3_GUIDANCE"
  | "P4_AMBIENT";

/** Index position doubles as rank — lower index = higher priority. */
const PRIORITY_ORDER: readonly WallyPriority[] = [
  "P0_CRITICAL",
  "P1_LIVE_EVENT",
  "P2_PLAYER_RESULT",
  "P3_GUIDANCE",
  "P4_AMBIENT",
];

function rank(priority: WallyPriority): number {
  return PRIORITY_ORDER.indexOf(priority);
}

export interface WallyQueueItem {
  priority: WallyPriority;
  /** WALLY.md §6.1: "certain confirmed result celebrations" may be marked non-interruptible. */
  interruptible: boolean;
}

/**
 * WALLY.md §6.1's rules, condensed to a single pairwise decision:
 * - Nothing showing → always show the incoming event.
 * - P0 can interrupt anything.
 * - A strictly higher-priority incoming event can interrupt a current one
 *   that allows interruption.
 * - Equal or lower priority never interrupts — it queues/drops instead
 *   (this slice drops; see the file header).
 * - A non-interruptible current event blocks everything except P0.
 */
export function shouldInterrupt(
  current: WallyQueueItem | null,
  incoming: WallyQueueItem,
): boolean {
  if (!current) return true;
  if (incoming.priority === "P0_CRITICAL") return true;
  if (!current.interruptible) return false;
  return rank(incoming.priority) < rank(current.priority);
}
