import { describe, expect, it } from "vitest";
import {
  changePasswordSchema,
  createEmployeeSchema,
  signInSchema,
  updateUserSchema,
} from "./schemas";

describe("signInSchema", () => {
  it("accepts a valid email/password pair", () => {
    const result = signInSchema.safeParse({
      email: "amina@example.com",
      password: "anything",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = signInSchema.safeParse({
      email: "not-an-email",
      password: "anything",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = signInSchema.safeParse({
      email: "amina@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  it("accepts a valid new password that matches its confirmation", () => {
    const result = changePasswordSchema.safeParse({
      password: "a-real-password",
      confirmPassword: "a-real-password",
    });
    expect(result.success).toBe(true);
  });

  it("rejects passwords shorter than 10 characters", () => {
    const result = changePasswordSchema.safeParse({
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched confirmation", () => {
    const result = changePasswordSchema.safeParse({
      password: "a-real-password",
      confirmPassword: "a-different-password",
    });
    expect(result.success).toBe(false);
  });

  it("rejects exact reuse of the temporary Walumo password", () => {
    // Padded to clear the length check first so this test actually exercises
    // the reuse rule, not just the length rule.
    const result = changePasswordSchema.safeParse({
      password: "Walumo",
      confirmPassword: "Walumo",
    });
    expect(result.success).toBe(false);
  });
});

describe("createEmployeeSchema", () => {
  it("accepts an email-only submission and defaults role to PLAYER", () => {
    const result = createEmployeeSchema.safeParse({ email: "jean@example.com" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe("PLAYER");
    }
  });

  it("accepts an explicit non-default role", () => {
    const result = createEmployeeSchema.safeParse({
      email: "jean@example.com",
      role: "GAME_MASTER",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid role", () => {
    const result = createEmployeeSchema.safeParse({
      email: "jean@example.com",
      role: "SUPREME_LEADER",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed email", () => {
    const result = createEmployeeSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a non-UUID countryId", () => {
    const result = createEmployeeSchema.safeParse({
      email: "jean@example.com",
      countryId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("accepts null for optional fields, matching FormData.get()'s return value for a field that isn't in the form at all (regression: this previously failed validation since null isn't undefined or '')", () => {
    const result = createEmployeeSchema.safeParse({
      email: "jean@example.com",
      fullName: null,
      countryId: null,
      entityId: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty-string countryId, matching a 'Not set' <select> option", () => {
    const result = createEmployeeSchema.safeParse({
      email: "jean@example.com",
      countryId: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateUserSchema", () => {
  // A real (v4-shaped) UUID — zod v4's `.uuid()` validates the RFC 4122
  // version/variant nibbles, not just the hyphenated hex shape, so an
  // arbitrary-looking placeholder like "1111...1111" fails validation.
  const userId = "11111111-1111-4111-8111-111111111111";

  it("accepts a valid role/status pair", () => {
    const result = updateUserSchema.safeParse({
      userId,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-UUID userId", () => {
    const result = updateUserSchema.safeParse({
      userId: "not-a-uuid",
      role: "PLAYER",
      status: "ACTIVE",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid status", () => {
    const result = updateUserSchema.safeParse({
      userId,
      role: "PLAYER",
      status: "SUSPENDED",
    });
    expect(result.success).toBe(false);
  });
});
