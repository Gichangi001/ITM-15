import { describe, expect, it } from "vitest";
import { composeNotificationSchema } from "./schemas";

const uuid = "11111111-1111-4111-8111-111111111111";

const base = {
  countryId: "",
  entityId: "",
  playerEmail: "",
  title: "Day 3 is live",
  message: "The journey continues — check your dashboard.",
  severity: "INFO" as const,
  ctaLabel: "",
  ctaHref: "",
};

describe("composeNotificationSchema", () => {
  it("accepts a GLOBAL send with no extra targeting fields", () => {
    const result = composeNotificationSchema.safeParse({ ...base, audienceType: "GLOBAL" });
    expect(result.success).toBe(true);
  });

  it("accepts a COUNTRY send with a countryId", () => {
    const result = composeNotificationSchema.safeParse({ ...base, audienceType: "COUNTRY", countryId: uuid });
    expect(result.success).toBe(true);
  });

  it("rejects a COUNTRY send with no countryId", () => {
    const result = composeNotificationSchema.safeParse({ ...base, audienceType: "COUNTRY" });
    expect(result.success).toBe(false);
  });

  it("accepts an ENTITY send with an entityId", () => {
    const result = composeNotificationSchema.safeParse({ ...base, audienceType: "ENTITY", entityId: uuid });
    expect(result.success).toBe(true);
  });

  it("rejects an ENTITY send with no entityId", () => {
    const result = composeNotificationSchema.safeParse({ ...base, audienceType: "ENTITY" });
    expect(result.success).toBe(false);
  });

  it("accepts a PLAYER send with a valid email", () => {
    const result = composeNotificationSchema.safeParse({
      ...base,
      audienceType: "PLAYER",
      playerEmail: "amina.kenya@itm15.test",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a PLAYER send with no email", () => {
    const result = composeNotificationSchema.safeParse({ ...base, audienceType: "PLAYER" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty title", () => {
    const result = composeNotificationSchema.safeParse({ ...base, audienceType: "GLOBAL", title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty message", () => {
    const result = composeNotificationSchema.safeParse({ ...base, audienceType: "GLOBAL", message: "" });
    expect(result.success).toBe(false);
  });

  it("accepts a CTA with both label and href", () => {
    const result = composeNotificationSchema.safeParse({
      ...base,
      audienceType: "GLOBAL",
      ctaLabel: "Play now",
      ctaHref: "/play",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a CTA label with no href", () => {
    const result = composeNotificationSchema.safeParse({ ...base, audienceType: "GLOBAL", ctaLabel: "Play now" });
    expect(result.success).toBe(false);
  });

  it("rejects a CTA href with no label", () => {
    const result = composeNotificationSchema.safeParse({ ...base, audienceType: "GLOBAL", ctaHref: "/play" });
    expect(result.success).toBe(false);
  });
});
