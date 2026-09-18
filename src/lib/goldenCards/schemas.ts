import { z } from "zod";

/**
 * "Chairman's Egg" golden cards — admin allocates one to a real player for
 * a real day; other players find that player in person and enter the code
 * they're given to claim a real bonus. See the golden_cards migration's
 * own header comment for the full design rationale.
 */
export const allocateGoldenCardSchema = z.object({
  gameDayId: z.string().uuid(),
  carrierId: z.string().uuid(),
  bonusPoints: z.coerce.number().int().min(1, "Bonus points must be at least 1").max(1000, "That's a lot of points — double check it"),
});

export type AllocateGoldenCardInput = z.infer<typeof allocateGoldenCardSchema>;

export const claimGoldenCardSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Enter the code they gave you")
    .transform((v) => v.toUpperCase().replace(/[^A-Z0-9]/g, "")),
});

export type ClaimGoldenCardInput = z.infer<typeof claimGoldenCardSchema>;
