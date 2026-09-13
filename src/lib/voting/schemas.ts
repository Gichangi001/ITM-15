import { z } from "zod";

/**
 * Phase 9 (Voting & Nominations, Product Guide §11). Single-choice only in
 * this slice — see the migration header comment for why.
 */
export const createPollSchema = z
  .object({
    campaignId: z.string().uuid(),
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().optional(),
    selfVoteAllowed: z.boolean().default(false),
    reasonRequired: z.boolean().default(false),
    resultsVisibility: z.enum(["LIVE", "AFTER_VOTE", "ADMIN_REVEAL", "NEVER"]).default("ADMIN_REVEAL"),
    optionLabels: z.array(z.string().trim().min(1)).min(2, "At least 2 options are required"),
  });

export type CreatePollInput = z.infer<typeof createPollSchema>;

export const castVoteSchema = z.object({
  pollId: z.string().uuid(),
  optionId: z.string().uuid(),
  reason: z.string().trim().optional(),
});

export type CastVoteInput = z.infer<typeof castVoteSchema>;
