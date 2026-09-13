import { describe, expect, it } from "vitest";
import { deriveFirstName } from "./profile";

describe("deriveFirstName", () => {
  it("returns the first token of a full name", () => {
    expect(deriveFirstName("Amina Kenya")).toBe("Amina");
  });

  it("collapses extra internal whitespace", () => {
    expect(deriveFirstName("  Jean   DRC  ")).toBe("Jean");
  });

  it("returns the whole string when there is only one name", () => {
    expect(deriveFirstName("Cher")).toBe("Cher");
  });
});
