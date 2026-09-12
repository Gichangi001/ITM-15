import { describe, expect, it } from "vitest";
import { clientEnv } from "./env";

describe("clientEnv", () => {
  it("parses without throwing when optional vars are unset", () => {
    expect(clientEnv).toBeDefined();
  });
});
