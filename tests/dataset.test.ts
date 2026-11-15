import { describe, expect, it } from "vitest";
import { getDataset, getAllCities } from "@/lib/data";
import type { ClimateTag } from "@/lib/types";

const CLIMATE_TAGS: ClimateTag[] = [
  "warm",
  "mild",
  "cold",
  "four-seasons",
];

describe("dataset", () => {
  const dataset = getDataset();

  it("has a useful number of cities and countries", () => {
    expect(dataset.cities.length).toBeGreaterThanOrEqual(40);
    expect(dataset.countries.length).toBeGreaterThanOrEqual(20);
    expect(dataset.methodologyVersion).toBe("1.0");
  });

  it("has unique slugs and valid country links", () => {
    const slugs = dataset.cities.map((city) => city.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const countryCodes = new Set(dataset.countries.map((country) => country.code));
    for (const city of dataset.cities) {
      expect(countryCodes.has(city.countryCode)).toBe(true);
    }
  });

  it("has twelve climate months and coherent aggregates", () => {
    for (const city of dataset.cities) {
      expect(city.climate.monthly).toHaveLength(12);
      const summerHigh =
        (city.climate.monthly[6].high + city.climate.monthly[7].high) / 2;
      expect(Math.abs(summerHigh - city.climate.summerHigh)).toBeLessThan(0.2);
      expect(city.climate.annualSunHours).toBeGreaterThan(500);
      expect(city.climate.annualRain).toBeGreaterThan(0);
      expect(city.climate.tags.length).toBeGreaterThan(0);
      for (const tag of city.climate.tags) {
        expect(CLIMATE_TAGS).toContain(tag);
      }
    }
  });

  it("keeps metric composites in range", () => {
    for (const city of dataset.cities) {
      for (const value of Object.values(city.metrics)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
      expect(city.cost.totalSingle).toBe(
        city.cost.rentOneBed + city.cost.livingSingle,
      );
      expect(city.cost.index).toBeGreaterThanOrEqual(0);
      expect(city.cost.index).toBeLessThanOrEqual(100);
      expect(city.work.avgNetSalary).toBeGreaterThan(0);
      expect(city.work.salaryCoverage).toBeCloseTo(
        city.work.avgNetSalary / city.cost.totalSingle,
        1,
      );
    }
  });

  it("has provenance and editorial content for every city", () => {
    for (const city of getAllCities()) {
      expect(city.sources.length).toBeGreaterThanOrEqual(3);
      expect(city.sources.every((source) => source.asOf.length > 0)).toBe(true);
      expect(city.editorial.summary.length).toBeGreaterThan(40);
      expect(city.editorial.bestFor.length).toBeGreaterThan(20);
    }
  });

  it("has country context for every country", () => {
    for (const country of dataset.countries) {
      expect(country.name.length).toBeGreaterThan(1);
      expect(country.asOf.length).toBeGreaterThan(0);
    }
  });
});
