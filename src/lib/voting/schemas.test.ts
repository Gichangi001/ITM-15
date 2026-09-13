import { describe, expect, it } from "vitest";
import { castVoteSchema, createPollSchema } from "./schemas";

const uuid = "11111111-1111-4111-8111-111111111111";

describe("createPollSchema", () => {
  it("accepts a valid poll with 2+ options", () => {
    const result = createPollSchema.safeParse({
      campaignId: uuid,
      title: "Quiet Builder",
      optionLabels: ["Amina", "Jean"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a poll with fewer than 2 options", () => {
    const result = createPollSchema.safeParse({
      campaignId: uuid,
      title: "Quiet Builder",
      optionLabels: ["Amina"],
    });
    expect(result.success).toBe(false);
  });
});

describe("castVoteSchema", () => {
  it("accepts a valid vote", () => {
    const result = castVoteSchema.safeParse({ pollId: uuid, optionId: uuid });
    expect(result.success).toBe(true);
  });

  it("rejects a non-UUID pollId", () => {
    const result = castVoteSchema.safeParse({ pollId: "not-a-uuid", optionId: uuid });
    expect(result.success).toBe(false);
  });
});
