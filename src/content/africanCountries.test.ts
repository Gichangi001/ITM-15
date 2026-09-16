import { describe, expect, it } from "vitest";
import { AFRICAN_COUNTRIES } from "./africanCountries";

describe("AFRICAN_COUNTRIES", () => {
  it("has exactly 54 entries (the UN-member African states)", () => {
    expect(AFRICAN_COUNTRIES.length).toBe(54);
  });

  it("has no duplicate names", () => {
    const names = new Set(AFRICAN_COUNTRIES.map((c) => c.name));
    expect(names.size).toBe(AFRICAN_COUNTRIES.length);
  });

  it("has no duplicate flags", () => {
    const flags = new Set(AFRICAN_COUNTRIES.map((c) => c.flag));
    expect(flags.size).toBe(AFRICAN_COUNTRIES.length);
  });

  it("every entry has a non-empty name and a flag emoji", () => {
    for (const country of AFRICAN_COUNTRIES) {
      expect(country.name.length).toBeGreaterThan(0);
      expect(country.flag.length).toBeGreaterThan(0);
    }
  });

  it("includes DR Congo (the event destination)", () => {
    expect(AFRICAN_COUNTRIES.some((c) => c.name === "DR Congo" && c.flag === "🇨🇩")).toBe(true);
  });
});
