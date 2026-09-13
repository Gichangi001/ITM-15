import { z } from "zod";

/**
 * Phase 8 (Authoritative Scoring, Product Guide §10.2) — admin bonus-point
 * award. A required reason (Product Guide §10.2: "Required reason") makes
 * every discretionary award traceable in score_events.reason and the
 * audit_logs entry the action also writes.
 */
export const awardBonusPointsSchema = z.object({
  playerId: z.string().uuid(),
  points: z.coerce.number().int().refine((n) => n !== 0, "Points can't be zero"),
  reason: z.string().trim().min(1, "A reason is required"),
});

export type AwardBonusPointsInput = z.infer<typeof awardBonusPointsSchema>;
