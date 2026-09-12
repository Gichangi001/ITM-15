import { describe, expect, it } from "vitest";
import { parseClientEnv } from "./env";

const validSource = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
};

describe("parseClientEnv", () => {
  it("parses valid input", () => {
    const env = parseClientEnv(validSource);
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe(validSource.NEXT_PUBLIC_SUPABASE_URL);
    expect(env.NEXT_PUBLIC_APP_URL).toBeUndefined();
  });

  it("accepts an optional NEXT_PUBLIC_APP_URL", () => {
    const env = parseClientEnv({
      ...validSource,
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    });
    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });

  it("throws when a required variable is missing", () => {
    expect(() => parseClientEnv({})).toThrow();
  });
});
