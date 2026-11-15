import { describe, expect, it } from "vitest";
import { parsePreferences } from "@/lib/parse";
import { sanitizeAiPreferences } from "@/lib/ai";

describe("rule-based parser", () => {
  it("extracts a budget, climate and priority weights", () => {
    const result = parsePreferences(
      "warm, walkable, safe, under €2,000 per month",
    );
    expect(result.patch.budget).toBe(2000);
    expect(result.patch.climate).toBe("warm");
    expect(result.patch.weights?.walkability).toBe(3);
    expect(result.patch.weights?.safety).toBe(3);
    expect(result.chips.length).toBeGreaterThanOrEqual(3);
  });

  it("handles k-suffixed budgets", () => {
    const result = parsePreferences("affordable, max 2.5k, warm");
    expect(result.patch.budget).toBe(2500);
  });

  it("extracts income, household and region", () => {
    const result = parsePreferences("I earn 3k, moving with my partner to Portugal");
    expect(result.patch.income).toBe(3000);
    expect(result.patch.household).toBe("couple");
    expect(result.patch.regions).toContain("western");
  });

  it("extracts family, climate and city size", () => {
    const result = parsePreferences("family with kids, cold winters, big city");
    expect(result.patch.household).toBe("family");
    expect(result.patch.climate).toBe("cold");
    expect(result.patch.size).toBe("large");
  });

  it("handles remote-worker language", () => {
    const result = parsePreferences("remote work, fast internet, low cost of living");
    expect(result.patch.weights?.internet).toBe(3);
    expect(result.patch.weights?.affordability).toBe(3);
  });

  it("returns a helpful message when nothing is recognised", () => {
    const result = parsePreferences("hello there");
    expect(result.chips).toHaveLength(0);
    expect(result.interpreted[0]).toContain("No specific preferences");
  });
});

describe("AI output sanitisation", () => {
  it("keeps valid fields and clamps weights", () => {
    const parsed = sanitizeAiPreferences({
      budget: 2800,
      income: 4000,
      regions: ["western", "invalid"],
      climate: "mild",
      size: "medium",
      household: "couple",
      job: "Designer",
      weights: {
        affordability: 2,
        safety: 9,
        healthcare: -1,
        climate: 3,
        jobs: 1,
        walkability: 2,
        internet: 3,
        environment: 1,
        happiness: 1,
        services: 1,
        english: 2,
      },
    });
    expect(parsed).not.toBeNull();
    expect(parsed?.patch.budget).toBe(2800);
    expect(parsed?.patch.regions).toEqual(["western"]);
    expect(parsed?.patch.weights?.safety).toBe(3);
    expect(parsed?.patch.weights?.healthcare).toBe(0);
    expect(parsed?.patch.weights?.internet).toBe(3);
  });

  it("rejects junk output", () => {
    expect(sanitizeAiPreferences(null)).toBeNull();
    expect(sanitizeAiPreferences("nope")).toBeNull();
    expect(sanitizeAiPreferences({})).toBeNull();
  });
});
