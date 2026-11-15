import { describe, expect, it } from "vitest";
import { getAllCities, getCityBySlug } from "@/lib/data";
import { DEFAULT_PREFS } from "@/lib/prefs";
import {
  householdTotal,
  rankCities,
  scoreCity,
  tierFor,
} from "@/lib/scoring";
import type { Preferences } from "@/lib/types";

function withPrefs(patch: Partial<Preferences>): Preferences {
  return { ...DEFAULT_PREFS, ...patch, weights: { ...DEFAULT_PREFS.weights, ...patch.weights } };
}

describe("ranking", () => {
  it("is deterministic and sorted by score", () => {
    const first = rankCities(getAllCities(), DEFAULT_PREFS);
    const second = rankCities(getAllCities(), DEFAULT_PREFS);
    expect(first.results.map((result) => result.city.slug)).toEqual(
      second.results.map((result) => result.city.slug),
    );
    for (let index = 1; index < first.results.length; index++) {
      expect(first.results[index - 1].score).toBeGreaterThanOrEqual(
        first.results[index].score,
      );
    }
  });

  it("respects the budget strictly when there are enough matches", () => {
    const outcome = rankCities(
      getAllCities(),
      withPrefs({ budget: 2500, regions: [], climate: "any", size: "any" }),
    );
    expect(outcome.strictCount).toBeGreaterThanOrEqual(5);
    expect(outcome.relaxedBudget).toBe(false);
    for (const result of outcome.results) {
      expect(result.totalMonthly).toBeLessThanOrEqual(2500);
      expect(result.overBudget).toBe(false);
    }
  });

  it("relaxes a tight budget transparently and caps over-budget scores", () => {
    const outcome = rankCities(getAllCities(), withPrefs({ budget: 900 }));
    expect(outcome.relaxedBudget).toBe(true);
    expect(outcome.results.length).toBeGreaterThan(0);
    const over = outcome.results.filter((result) => result.overBudget);
    expect(over.length).toBeGreaterThan(0);
    for (const result of over) {
      expect(result.score).toBeLessThanOrEqual(74);
      expect(result.overBudgetPct).toBeGreaterThan(0);
    }
  });

  it("applies region, climate and size filters", () => {
    const outcome = rankCities(
      getAllCities(),
      withPrefs({ budget: 10000, regions: ["northern"], climate: "cold", size: "medium" }),
    );
    expect(outcome.results.length).toBeGreaterThan(0);
    for (const result of outcome.results) {
      expect(result.city.region).toBe("northern");
      expect(result.city.climate.tags).toContain("cold");
      expect(result.city.size).toBe("medium");
    }
  });

  it("ignores criteria with zero weight", () => {
    const highBudget = withPrefs({
      budget: 10000,
      weights: Object.fromEntries(
        Object.keys(DEFAULT_PREFS.weights).map((key) => [key, key === "safety" ? 3 : 0]),
      ) as Preferences["weights"],
    });
    const lisbon = getCityBySlug("lisbon");
    expect(lisbon).toBeDefined();
    const result = scoreCity(lisbon!, highBudget);
    expect(result.score).toBeCloseTo(lisbon!.metrics.safety, 5);
    const safetyContribution = result.breakdown.find((item) => item.key === "safety");
    expect(safetyContribution?.contribution).toBeCloseTo(lisbon!.metrics.safety, 5);
  });

  it("falls back to default weights when every criterion is skipped", () => {
    const skipped = withPrefs({
      budget: 10000,
      weights: Object.fromEntries(
        Object.keys(DEFAULT_PREFS.weights).map((key) => [key, 0]),
      ) as Preferences["weights"],
    });
    const result = scoreCity(getCityBySlug("vienna")!, skipped);
    expect(result.score).toBeGreaterThan(0);
  });

  it("scores climate 100 when the requested band matches", () => {
    const result = scoreCity(
      getCityBySlug("lisbon")!,
      withPrefs({ budget: 10000, climate: "warm" }),
    );
    expect(result.breakdown.find((item) => item.key === "climate")?.score).toBe(100);
  });

  it("scales household costs and leftover income", () => {
    const city = getCityBySlug("berlin")!;
    const single = householdTotal(city, "single");
    const couple = householdTotal(city, "couple");
    const family = householdTotal(city, "family");
    expect(couple).toBeGreaterThan(single);
    expect(family).toBeGreaterThan(couple);

    const result = scoreCity(
      city,
      withPrefs({ budget: 5000, household: "single", income: 4000 }),
    );
    expect(result.totalMonthly).toBe(single);
    expect(result.leftover).toBe(4000 - single);
  });
});

describe("tiers", () => {
  it("maps scores to stable tiers", () => {
    expect(tierFor(80)).toBe("Excellent");
    expect(tierFor(79.9)).toBe("Strong");
    expect(tierFor(65)).toBe("Strong");
    expect(tierFor(50)).toBe("Fair");
    expect(tierFor(49.9)).toBe("Stretch");
  });
});
