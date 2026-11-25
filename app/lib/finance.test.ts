import { describe, expect, it } from "vitest";
import { isInMonth } from "./finance";

describe("isInMonth", () => {
  it("matches the previous month across a year boundary", () => {
    expect(isInMonth("2025-12-31", -1, new Date(2026, 0, 10))).toBe(true);
  });
});
