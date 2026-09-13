import { describe, expect, it } from "vitest";
import { selectDialogue, substituteVariables, type DialogueRow } from "./resolver";

function row(overrides: Partial<DialogueRow>): DialogueRow {
  return {
    key: "login.greeting",
    locale: "en",
    event_type: "LOGIN_GREETING",
    variant: null,
    text: "default text",
    weight: 100,
    is_active: true,
    ...overrides,
  };
}

describe("selectDialogue", () => {
  it("returns the exact locale+variant match when present", () => {
    const rows = [row({ variant: "a", text: "variant a" }), row({ variant: "b", text: "variant b" })];
    expect(selectDialogue(rows, { key: "login.greeting", locale: "en", variant: "b" })?.text).toBe(
      "variant b",
    );
  });

  it("falls back to the same locale's default (null) variant", () => {
    const rows = [row({ variant: null, text: "default" })];
    expect(selectDialogue(rows, { key: "login.greeting", locale: "en", variant: "missing" })?.text).toBe(
      "default",
    );
  });

  it("falls back to the fallback locale (en) when the requested locale has nothing", () => {
    const rows = [row({ locale: "en", variant: null, text: "english default" })];
    expect(selectDialogue(rows, { key: "login.greeting", locale: "fr", variant: "a" })?.text).toBe(
      "english default",
    );
  });

  it("returns null when no dialogue matches the key at all", () => {
    const rows = [row({ key: "other.key" })];
    expect(selectDialogue(rows, { key: "login.greeting" })).toBeNull();
  });

  it("ignores inactive rows", () => {
    const rows = [row({ is_active: false, text: "should not appear" })];
    expect(selectDialogue(rows, { key: "login.greeting" })).toBeNull();
  });

  it("picks the highest-weight row among equally-matching candidates, deterministically", () => {
    const rows = [
      row({ variant: null, text: "low", weight: 10 }),
      row({ variant: null, text: "high", weight: 200 }),
    ];
    expect(selectDialogue(rows, { key: "login.greeting" })?.text).toBe("high");
  });
});

describe("substituteVariables", () => {
  it("replaces every known token", () => {
    expect(substituteVariables("Hi {{first_name}}, +{{points}} pts", { first_name: "Amina", points: 10 })).toBe(
      "Hi Amina, +10 pts",
    );
  });

  it("returns null when a referenced variable is missing, rather than emitting raw {{...}}", () => {
    expect(substituteVariables("Hi {{first_name}}", {})).toBeNull();
  });

  it("returns null when a variable is explicitly null", () => {
    expect(substituteVariables("Hi {{first_name}}", { first_name: null })).toBeNull();
  });

  it("passes through text with no tokens unchanged", () => {
    expect(substituteVariables("No variables here.", {})).toBe("No variables here.");
  });
});
