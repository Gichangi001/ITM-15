import { z } from "zod";

/**
 * Phase 6 (Content Engine, Product Guide §9) validation schemas. One
 * challenge per mission for this slice — see the migration header comment
 * on why (`supabase/migrations/20260913080000_content_submission_scoring_voting.sql`).
 */

export const CHALLENGE_TYPES = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "FREE_TEXT", "PHOTO_UPLOAD"] as const;
export type ChallengeType = (typeof CHALLENGE_TYPES)[number];

export const createGameDaySchema = z.object({
  campaignId: z.string().uuid(),
  dayNumber: z.coerce.number().int().min(1).max(7),
  title: z.string().trim().min(1, "Title is required"),
  theme: z.string().trim().optional(),
});

export type CreateGameDayInput = z.infer<typeof createGameDaySchema>;

/**
 * A single option, for SINGLE_CHOICE/MULTIPLE_CHOICE challenges. At least
 * one option must be marked correct for the auto-grader (Phase 7/8) to
 * have anything to check against — enforced by a `.refine` on the parent
 * mission schema below, not here, since it needs to see the whole list.
 */
const challengeOptionSchema = z.object({
  label: z.string().trim().min(1, "Option text is required"),
  isCorrect: z.boolean().default(false),
});

export const createMissionSchema = z
  .object({
    // Not a gameDayId (UUID) — the admin picks a day NUMBER (1-7, Product
    // Guide §8's fixed structure), and the server action resolves/creates
    // the actual game_days row from it, since it may not exist yet.
    dayNumber: z.coerce.number().int().min(1).max(7),
    title: z.string().trim().min(1, "Title is required"),
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required")
      .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
    description: z.string().trim().optional(),
    basePoints: z.coerce.number().int().min(0).default(0),
    unityPoints: z.coerce.number().int().min(0).default(0),
    isUnityChallenge: z.boolean().default(false),
    startsAt: z.string().trim().optional(),
    endsAt: z.string().trim().optional(),
    maxAttempts: z.coerce.number().int().min(1).optional(),
    challengeType: z.enum(CHALLENGE_TYPES),
    prompt: z.string().trim().min(1, "Prompt is required"),
    options: z.array(challengeOptionSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.challengeType !== "SINGLE_CHOICE" && data.challengeType !== "MULTIPLE_CHOICE") {
        return true;
      }
      return (data.options?.length ?? 0) >= 2;
    },
    { message: "Choice challenges need at least 2 options", path: ["options"] },
  )
  .refine(
    (data) => {
      if (data.challengeType !== "SINGLE_CHOICE" && data.challengeType !== "MULTIPLE_CHOICE") {
        return true;
      }
      return (data.options ?? []).some((option) => option.isCorrect);
    },
    { message: "At least one option must be marked correct", path: ["options"] },
  );

export type CreateMissionInput = z.infer<typeof createMissionSchema>;

export const submitAnswerSchema = z.object({
  challengeId: z.string().uuid(),
  answerText: z.string().trim().optional(),
  selectedOptionIds: z.array(z.string().uuid()).optional(),
});

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;

export const moderateSubmissionSchema = z.object({
  submissionId: z.string().uuid(),
  decision: z.enum(["APPROVE", "REJECT"]),
  note: z.string().trim().optional(),
});

export type ModerateSubmissionInput = z.infer<typeof moderateSubmissionSchema>;
