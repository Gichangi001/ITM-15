import { describe, expect, it } from "vitest";
import { WORLD_COUNTRIES, isoToFlagEmoji } from "./worldCountries";

describe("WORLD_COUNTRIES", () => {
  it("has no duplicate ISO codes", () => {
    const codes = WORLD_COUNTRIES.map((c) => c.isoCode);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("every ISO code is exactly two uppercase letters", () => {
    for (const country of WORLD_COUNTRIES) {
      expect(country.isoCode).toMatch(/^[A-Z]{2}$/);
    }
  });

  it("includes countries already seeded in the DB", () => {
    const names = WORLD_COUNTRIES.map((c) => c.name);
    expect(names).toContain("Kenya");
    expect(names).toContain("Senegal");
    expect(names).toContain("Benin");
    expect(names).toContain("Burundi");
    expect(names).toContain("DR Congo");
  });
});

describe("isoToFlagEmoji", () => {
  it("derives the correct flag for Kenya (KE)", () => {
    expect(isoToFlagEmoji("KE")).toBe("🇰🇪");
  });

  it("derives the correct flag for a lowercase input", () => {
    expect(isoToFlagEmoji("us")).toBe("🇺🇸");
  });

  it("derives distinct flags for distinct codes", () => {
    expect(isoToFlagEmoji("GB")).not.toBe(isoToFlagEmoji("DE"));
  });
});
