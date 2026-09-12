import { describe, expect, it } from "vitest";
import { WALLY_POSES } from "./assets";

describe("WALLY_POSES", () => {
  it("has exactly the 8 poses sourced from MASCOTTE.zip", () => {
    expect(Object.keys(WALLY_POSES)).toHaveLength(8);
  });

  it("every pose has a public webp path and positive dimensions", () => {
    for (const [key, pose] of Object.entries(WALLY_POSES)) {
      expect(pose.src, key).toMatch(/^\/wally\/.+\.webp$/);
      expect(pose.width, key).toBeGreaterThan(0);
      expect(pose.height, key).toBeGreaterThan(0);
      expect(pose.suggestedFor.length, key).toBeGreaterThan(0);
    }
  });
});
