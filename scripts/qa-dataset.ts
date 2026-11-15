import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Dataset } from "../lib/types";

const errors: string[] = [];
const warnings: string[] = [];

async function main(): Promise<void> {
  const raw = await readFile(path.join(process.cwd(), "data", "dataset.json"), "utf8");
  const dataset = JSON.parse(raw) as Dataset;

  function check(condition: boolean, message: string): void {
    if (!condition) errors.push(message);
  }

  check(dataset.cities.length >= 40, `Expected at least 40 cities, got ${dataset.cities.length}`);
  check(dataset.countries.length >= 20, `Expected at least 20 countries, got ${dataset.countries.length}`);
  check(dataset.methodologyVersion === "1.0", "Unexpected methodology version");

  const slugs = new Set<string>();
  const countries = new Set(dataset.countries.map((country) => country.code));

  for (const city of dataset.cities) {
    const label = city.slug;
    if (slugs.has(city.slug)) errors.push(`${label}: duplicate slug`);
    slugs.add(city.slug);

    if (!countries.has(city.countryCode)) {
      errors.push(`${label}: unknown country code ${city.countryCode}`);
    }
    if (city.climate.monthly.length !== 12) {
      errors.push(`${label}: expected 12 climate months`);
    }
    if (city.climate.tags.length === 0) {
      errors.push(`${label}: no climate tags`);
    }
    if (city.climate.annualSunHours <= 0) {
      errors.push(`${label}: annual sun hours missing`);
    }
    if (city.climate.annualRain <= 0) {
      errors.push(`${label}: annual rain missing`);
    }
    if (city.cost.totalSingle !== city.cost.rentOneBed + city.cost.livingSingle) {
      errors.push(`${label}: cost total does not equal rent + living`);
    }
    if (city.cost.index < 0 || city.cost.index > 100) {
      errors.push(`${label}: cost index out of range`);
    }
    if (city.work.avgNetSalary <= 0) {
      errors.push(`${label}: salary missing`);
    }
    if (Math.abs(city.work.salaryCoverage - city.work.avgNetSalary / city.cost.totalSingle) > 0.02) {
      errors.push(`${label}: salary coverage mismatch`);
    }
    for (const [metric, value] of Object.entries(city.metrics)) {
      if (!Number.isFinite(value) || value < 0 || value > 100) {
        errors.push(`${label}: metric ${metric} out of range (${value})`);
      }
    }
    if (city.sources.length < 3) errors.push(`${label}: fewer than 3 sources`);
    if (city.editorial.summary.length < 40) errors.push(`${label}: summary too short`);
    if (city.editorial.bestFor.length < 20) errors.push(`${label}: bestFor too short`);
    if (!city.confidence) errors.push(`${label}: missing confidence`);
  }

  const countryCoverage = dataset.cities.filter((city) =>
    countries.has(city.countryCode),
  ).length;
  const climateCoverage = dataset.cities.filter(
    (city) => city.climate.monthly.every((month) => Number.isFinite(month.high)),
  ).length;

  const stale = dataset.cities.filter((city) => {
    const costSource = city.sources.find((source) => source.label.includes("cost model"));
    return !costSource || costSource.asOf < "2025-01-01";
  });
  if (stale.length > 0) {
    warnings.push(`${stale.length} cities have cost data older than 2025`);
  }

  console.log("CityMatcher dataset QA");
  console.log("----------------------");
  console.log(`Cities:             ${dataset.cities.length}`);
  console.log(`Countries:          ${dataset.countries.length}`);
  console.log(`Country coverage:   ${countryCoverage}/${dataset.cities.length}`);
  console.log(`Climate coverage:   ${climateCoverage}/${dataset.cities.length}`);
  console.log(`Unique slugs:       ${slugs.size}/${dataset.cities.length}`);
  console.log(`Generated:          ${dataset.generatedAt}`);
  console.log(`Warnings:           ${warnings.length}`);
  warnings.forEach((warning) => console.log(`  ! ${warning}`));
  console.log(`Errors:             ${errors.length}`);
  errors.forEach((error) => console.log(`  ✗ ${error}`));

  if (errors.length > 0) process.exit(1);
  console.log("\nAll checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
