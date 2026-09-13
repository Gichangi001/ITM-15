import { describe, expect, it } from "vitest";
import { shouldInterrupt } from "./priority";

describe("shouldInterrupt", () => {
  it("always shows an incoming event when nothing is currently showing", () => {
    expect(shouldInterrupt(null, { priority: "P4_AMBIENT", interruptible: true })).toBe(true);
  });

  it("P0_CRITICAL always interrupts, even a non-interruptible current event", () => {
    expect(
      shouldInterrupt(
        { priority: "P1_LIVE_EVENT", interruptible: false },
        { priority: "P0_CRITICAL", interruptible: true },
      ),
    ).toBe(true);
  });

  it("a strictly higher-priority interruptible current event is interrupted", () => {
    expect(
      shouldInterrupt(
        { priority: "P3_GUIDANCE", interruptible: true },
        { priority: "P1_LIVE_EVENT", interruptible: true },
      ),
    ).toBe(true);
  });

  it("equal priority never interrupts", () => {
    expect(
      shouldInterrupt(
        { priority: "P2_PLAYER_RESULT", interruptible: true },
        { priority: "P2_PLAYER_RESULT", interruptible: true },
      ),
    ).toBe(false);
  });

  it("lower priority never interrupts", () => {
    expect(
      shouldInterrupt(
        { priority: "P1_LIVE_EVENT", interruptible: true },
        { priority: "P3_GUIDANCE", interruptible: true },
      ),
    ).toBe(false);
  });

  it("a non-interruptible current event blocks anything except P0", () => {
    expect(
      shouldInterrupt(
        { priority: "P2_PLAYER_RESULT", interruptible: false },
        { priority: "P1_LIVE_EVENT", interruptible: true },
      ),
    ).toBe(false);
  });
});
