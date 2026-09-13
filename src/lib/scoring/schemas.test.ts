import { describe, expect, it } from "vitest";
import { awardBonusPointsSchema } from "./schemas";

const uuid = "11111111-1111-4111-8111-111111111111";

describe("awardBonusPointsSchema", () => {
  it("accepts a positive bonus with a reason", () => {
    const result = awardBonusPointsSchema.safeParse({
      playerId: uuid,
      points: 50,
      reason: "Best cross-country video",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a negative penalty", () => {
    const result = awardBonusPointsSchema.safeParse({
      playerId: uuid,
      points: -25,
      reason: "Duplicate submission",
    });
    expect(result.success).toBe(true);
  });

  it("rejects zero points", () => {
    const result = awardBonusPointsSchema.safeParse({ playerId: uuid, points: 0, reason: "x" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing reason", () => {
    const result = awardBonusPointsSchema.safeParse({ playerId: uuid, points: 10, reason: "" });
    expect(result.success).toBe(false);
  });
});
