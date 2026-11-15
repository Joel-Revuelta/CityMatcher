import { CRITERIA, DEFAULT_WEIGHTS } from "./criteria";
import type {
  ClimatePreference,
  CriterionKey,
  Household,
  Preferences,
  Region,
} from "./types";

export const DEFAULT_PREFS: Preferences = {
  budget: 2500,
  regions: [],
  climate: "any",
  size: "any",
  weights: { ...DEFAULT_WEIGHTS },
  income: null,
  job: "",
  household: "single",
};

const REGIONS: Region[] = [
  "western",
  "northern",
  "southern",
  "central",
  "eastern",
];
const CLIMATES: ClimatePreference[] = [
  "any",
  "warm",
  "mild",
  "cold",
  "four-seasons",
];
const SIZES = ["any", "small", "medium", "large"] as const;
const HOUSEHOLDS: Household[] = ["single", "couple", "family"];
const CRITERIA_KEYS = CRITERIA.map((criterion) => criterion.key);

function asString(
  input: URLSearchParams | Record<string, string | string[] | undefined>,
  key: string,
): string | null {
  if (input instanceof URLSearchParams) {
    return input.get(key);
  }
  const value = input[key];
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function toNumber(value: string | null): number | null {
  if (value === null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function decodeWeights(value: string | null): Record<CriterionKey, number> {
  if (!value) return { ...DEFAULT_WEIGHTS };
  const digits = value.split("");
  if (digits.length !== CRITERIA_KEYS.length) return { ...DEFAULT_WEIGHTS };
  const weights = { ...DEFAULT_WEIGHTS };
  CRITERIA_KEYS.forEach((key, index) => {
    const digit = Number(digits[index]);
    if (Number.isInteger(digit) && digit >= 0 && digit <= 3) {
      weights[key] = digit;
    }
  });
  return weights;
}

export function decodePreferences(
  input: URLSearchParams | Record<string, string | string[] | undefined>,
): Preferences {
  const budgetRaw = toNumber(asString(input, "b"));
  const incomeRaw = toNumber(asString(input, "i"));
  const regionsRaw = asString(input, "r");
  const regions = regionsRaw
    ? (regionsRaw
        .split(",")
        .filter((region): region is Region =>
          REGIONS.includes(region as Region),
        ) as Region[])
    : [];
  const climateRaw = asString(input, "c") ?? "any";
  const climate = CLIMATES.includes(climateRaw as ClimatePreference)
    ? (climateRaw as ClimatePreference)
    : "any";
  const sizeRaw = asString(input, "s") ?? "any";
  const size = SIZES.includes(sizeRaw as (typeof SIZES)[number])
    ? (sizeRaw as (typeof SIZES)[number])
    : "any";
  const householdRaw = asString(input, "hh") ?? "single";
  const household = HOUSEHOLDS.includes(householdRaw as Household)
    ? (householdRaw as Household)
    : "single";

  return {
    budget:
      budgetRaw !== null && budgetRaw > 0
        ? Math.min(10000, Math.max(300, Math.round(budgetRaw)))
        : null,
    regions: [...new Set(regions)],
    climate,
    size,
    weights: decodeWeights(asString(input, "w")),
    income:
      incomeRaw !== null && incomeRaw > 0
        ? Math.min(20000, Math.max(0, Math.round(incomeRaw)))
        : null,
    job: (asString(input, "j") ?? "").slice(0, 60),
    household,
  };
}

export function encodePreferences(prefs: Preferences): string {
  const params = new URLSearchParams();
  if (prefs.budget) params.set("b", String(Math.round(prefs.budget)));
  if (prefs.regions.length > 0) params.set("r", prefs.regions.join(","));
  if (prefs.climate !== "any") params.set("c", prefs.climate);
  if (prefs.size !== "any") params.set("s", prefs.size);
  const weightString = CRITERIA_KEYS.map((key) =>
    String(prefs.weights[key] ?? 0),
  ).join("");
  params.set("w", weightString);
  if (prefs.income) params.set("i", String(Math.round(prefs.income)));
  if (prefs.job.trim()) params.set("j", prefs.job.trim());
  if (prefs.household !== "single") params.set("hh", prefs.household);
  return params.toString();
}

export function resultsHref(prefs: Preferences): string {
  return `/results?${encodePreferences(prefs)}`;
}

export function compareHref(slugs: string[], prefs?: Preferences): string {
  const params = new URLSearchParams();
  params.set("c", slugs.join(","));
  if (prefs) {
    const prefsParams = new URLSearchParams(encodePreferences(prefs));
    for (const [key, value] of prefsParams) {
      params.set(key, value);
    }
  }
  return `/compare?${params.toString()}`;
}

export function cityHref(slug: string, prefs?: Preferences): string {
  if (!prefs) return `/city/${slug}`;
  return `/city/${slug}?${encodePreferences(prefs)}`;
}

export function activeFilterCount(prefs: Preferences): number {
  let count = prefs.regions.length;
  if (prefs.climate !== "any") count++;
  if (prefs.size !== "any") count++;
  return count;
}
