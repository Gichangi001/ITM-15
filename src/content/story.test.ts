import { describe, expect, it } from "vitest";
import { STORY_DAYS } from "./story";

describe("STORY_DAYS", () => {
  it("has exactly seven days, numbered 1 through 7 in order", () => {
    expect(STORY_DAYS.map((d) => d.day)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("every day has a non-empty title and teaser", () => {
    for (const day of STORY_DAYS) {
      expect(day.title.length, `day ${day.day} title`).toBeGreaterThan(0);
      expect(day.teaser.length, `day ${day.day} teaser`).toBeGreaterThan(0);
    }
  });
});
