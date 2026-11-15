import { describe, expect, it } from "vitest";
import {
  DEFAULT_PREFS,
  decodePreferences,
  encodePreferences,
  cityHref,
  resultsHref,
} from "@/lib/prefs";
import { CRITERIA } from "@/lib/criteria";
import type { Preferences } from "@/lib/types";

describe("preference encoding", () => {
  it("round-trips a full brief", () => {
    const prefs = {
      ...DEFAULT_PREFS,
      budget: 3200,
      regions: ["western", "southern"] as Preferences["regions"],
      climate: "warm" as const,
      size: "medium" as const,
      income: 4100,
      job: "Software engineer",
      household: "couple" as const,
      weights: { ...DEFAULT_PREFS.weights, safety: 3 as const, english: 2 as const },
    };
    const encoded = encodePreferences(prefs);
    const decoded = decodePreferences(new URLSearchParams(encoded));
    expect(decoded.budget).toBe(3200);
    expect(decoded.regions.sort()).toEqual(["southern", "western"]);
    expect(decoded.climate).toBe("warm");
    expect(decoded.size).toBe("medium");
    expect(decoded.income).toBe(4100);
    expect(decoded.job).toBe("Software engineer");
    expect(decoded.household).toBe("couple");
    expect(decoded.weights.safety).toBe(3);
    expect(decoded.weights.english).toBe(2);
  });

  it("falls back safely on malformed values", () => {
    const decoded = decodePreferences(
      new URLSearchParams({
        b: "not-a-number",
        r: "nope,western",
        c: "volcanic",
        s: "huge",
        w: "123",
        i: "-5",
        hh: "robot",
      }),
    );
    expect(decoded.budget).toBeNull();
    expect(decoded.regions).toEqual(["western"]);
    expect(decoded.climate).toBe("any");
    expect(decoded.size).toBe("any");
    expect(decoded.weights).toEqual(DEFAULT_PREFS.weights);
    expect(decoded.income).toBeNull();
    expect(decoded.household).toBe("single");
  });

  it("clamps extreme budgets and incomes", () => {
    const decoded = decodePreferences(
      new URLSearchParams({ b: "999999", i: "999999" }),
    );
    expect(decoded.budget).toBe(10000);
    expect(decoded.income).toBe(20000);
  });

  it("encodes weights in the declared criterion order", () => {
    const encoded = encodePreferences(DEFAULT_PREFS);
    const params = new URLSearchParams(encoded);
    const weights = params.get("w");
    expect(weights).toHaveLength(CRITERIA.length);
    expect(weights).toBe(
      CRITERIA.map((criterion) => DEFAULT_PREFS.weights[criterion.key]).join(""),
    );
  });

  it("builds stable internal hrefs", () => {
    expect(resultsHref(DEFAULT_PREFS)).toContain("/results?");
    expect(cityHref("lisbon")).toBe("/city/lisbon");
    expect(cityHref("lisbon", DEFAULT_PREFS)).toContain("/city/lisbon?");
  });
});
