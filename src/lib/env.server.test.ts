import { describe, expect, it } from "vitest";
import { parseServerEnv } from "./env.server";

const validSource = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
  SUPABASE_SECRET_KEY: "sb_secret_test",
};

describe("parseServerEnv", () => {
  it("parses valid input", () => {
    const env = parseServerEnv(validSource);
    expect(env.SUPABASE_URL).toBe(validSource.SUPABASE_URL);
    expect(env.SUPABASE_JWKS_URL).toBeUndefined();
  });

  it("throws when SUPABASE_SECRET_KEY is missing", () => {
    const rest = { ...validSource, SUPABASE_SECRET_KEY: undefined };
    expect(() => parseServerEnv(rest)).toThrow();
  });
});
