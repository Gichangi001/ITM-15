import { describe, expect, it } from "vitest";
import { createGameDaySchema, createMissionSchema, moderateSubmissionSchema, submitAnswerSchema } from "./schemas";

const uuid = "11111111-1111-4111-8111-111111111111";

describe("createGameDaySchema", () => {
  it("accepts a valid day", () => {
    const result = createGameDaySchema.safeParse({
      campaignId: uuid,
      dayNumber: 3,
      title: "The Journey",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a day number outside 1-7", () => {
    expect(createGameDaySchema.safeParse({ campaignId: uuid, dayNumber: 8, title: "x" }).success).toBe(false);
    expect(createGameDaySchema.safeParse({ campaignId: uuid, dayNumber: 0, title: "x" }).success).toBe(false);
  });
});

describe("createMissionSchema", () => {
  const base = {
    dayNumber: 1,
    title: "Find a friend",
    slug: "find-a-friend",
    basePoints: 100,
    unityPoints: 0,
    challengeType: "FREE_TEXT" as const,
    prompt: "Describe who you met.",
  };

  it("accepts a valid FREE_TEXT mission with no options", () => {
    const result = createMissionSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("rejects an invalid slug", () => {
    const result = createMissionSchema.safeParse({ ...base, slug: "Not A Slug!" });
    expect(result.success).toBe(false);
  });

  it("rejects a SINGLE_CHOICE mission with fewer than 2 options", () => {
    const result = createMissionSchema.safeParse({
      ...base,
      challengeType: "SINGLE_CHOICE",
      options: [{ label: "Only one", isCorrect: true }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a SINGLE_CHOICE mission with no correct option", () => {
    const result = createMissionSchema.safeParse({
      ...base,
      challengeType: "SINGLE_CHOICE",
      options: [
        { label: "A", isCorrect: false },
        { label: "B", isCorrect: false },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a SINGLE_CHOICE mission with 2+ options and one correct", () => {
    const result = createMissionSchema.safeParse({
      ...base,
      challengeType: "SINGLE_CHOICE",
      options: [
        { label: "A", isCorrect: true },
        { label: "B", isCorrect: false },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("submitAnswerSchema", () => {
  it("accepts a free-text answer", () => {
    const result = submitAnswerSchema.safeParse({ challengeId: uuid, answerText: "My answer" });
    expect(result.success).toBe(true);
  });

  it("accepts selected option ids", () => {
    const result = submitAnswerSchema.safeParse({ challengeId: uuid, selectedOptionIds: [uuid] });
    expect(result.success).toBe(true);
  });

  it("rejects a non-UUID challengeId", () => {
    const result = submitAnswerSchema.safeParse({ challengeId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });
});

describe("moderateSubmissionSchema", () => {
  it("accepts an approve decision", () => {
    const result = moderateSubmissionSchema.safeParse({ submissionId: uuid, decision: "APPROVE" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid decision", () => {
    const result = moderateSubmissionSchema.safeParse({ submissionId: uuid, decision: "MAYBE" });
    expect(result.success).toBe(false);
  });
});
