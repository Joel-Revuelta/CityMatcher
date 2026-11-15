import { CRITERIA, CLIMATE_LABELS, DEFAULT_WEIGHTS } from "./criteria";
import type {
  City,
  CriterionKey,
  CriterionScore,
  Household,
  MatchOutcome,
  MatchResult,
  MatchTier,
  Preferences,
} from "./types";

export const SCORING_VERSION = "1.0";

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function householdTotal(city: City, household: Household): number {
  const { rentOneBed, livingSingle } = city.cost;
  switch (household) {
    case "couple":
      return Math.round(rentOneBed * 1.3 + livingSingle * 1.7);
    case "family":
      return Math.round(rentOneBed * 1.9 + livingSingle * 2.5);
    default:
      return city.cost.totalSingle;
  }
}

function referenceIncome(city: City, prefs: Preferences): number {
  if (prefs.income && prefs.income > 0) return prefs.income;
  if (prefs.household === "couple") return city.work.avgNetSalary * 1.6;
  if (prefs.household === "family") return city.work.avgNetSalary * 1.9;
  return city.work.avgNetSalary;
}

export function climateScore(city: City, prefs: Preferences): number {
  const { summerHigh, winterLow, tags } = city.climate;
  const comfort = clamp(
    100 - Math.abs(summerHigh - 26) * 3 - Math.abs(winterLow - 8) * 3,
  );

  if (prefs.climate === "any") return round(comfort);

  if (tags.includes(prefs.climate)) return 100;

  switch (prefs.climate) {
    case "warm":
      return round(clamp(60 + (summerHigh - 24) * 6));
    case "cold":
      return round(clamp(60 + (2 - winterLow) * 6));
    case "mild":
      return round(
        clamp(
          60 +
            (10 - Math.abs(winterLow - 10)) * 4 +
            (28 - Math.abs(summerHigh - 25)) * 2,
        ),
      );
    case "four-seasons":
      return round(
        clamp(60 + (summerHigh - 25) * 3 + (10 - winterLow) * 3),
      );
    default:
      return round(comfort);
  }
}

function affordabilityScore(
  city: City,
  prefs: Preferences,
  totalMonthly: number,
): number {
  if (prefs.budget && prefs.budget > 0) {
    return round(clamp(100 - (totalMonthly / prefs.budget) * 30));
  }
  return round(clamp(100 - city.cost.index));
}

function jobsScore(city: City, totalMonthly: number): number {
  const coverage = city.work.avgNetSalary / totalMonthly;
  return round(clamp((coverage / 2) * 100));
}

export function criterionScores(
  city: City,
  prefs: Preferences,
): Record<CriterionKey, number> {
  const totalMonthly = householdTotal(city, prefs.household);
  return {
    affordability: affordabilityScore(city, prefs, totalMonthly),
    safety: city.metrics.safety,
    healthcare: city.metrics.healthcare,
    climate: climateScore(city, prefs),
    jobs: jobsScore(city, totalMonthly),
    walkability: city.metrics.walkability,
    internet: city.metrics.internet,
    environment: city.metrics.environment,
    happiness: city.metrics.happiness,
    services: city.metrics.publicServices,
    english: city.metrics.english,
  };
}

export function tierFor(score: number): MatchTier {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Strong";
  if (score >= 50) return "Fair";
  return "Stretch";
}

export function criterionReason(
  key: CriterionKey,
  city: City,
  score: number,
  prefs: Preferences,
  totalMonthly: number,
): string {
  return reasonFor(key, city, score, prefs, totalMonthly);
}

function reasonFor(
  key: CriterionKey,
  city: City,
  score: number,
  prefs: Preferences,
  totalMonthly: number,
): string {
  switch (key) {
    case "affordability":
      if (prefs.budget) {
        return `Estimated ${formatBudget(totalMonthly)}/month total fits your budget`;
      }
      return `One of the lower monthly cost bases in this set`;
    case "safety":
      return `Safety score of ${Math.round(score)}/100`;
    case "healthcare":
      return `Healthcare score of ${Math.round(score)}/100`;
    case "climate":
      if (prefs.climate !== "any") {
        return `${CLIMATE_LABELS[prefs.climate]} profile matches your preference`;
      }
      return `${city.climate.summerHigh}°C summer highs and ${city.climate.winterLow}°C winter lows`;
    case "jobs":
      return `Local net salary covers ${city.work.salaryCoverage.toFixed(2)}× living costs`;
    case "walkability":
      return `Walkability score of ${Math.round(score)}/100`;
    case "internet":
      return `Internet score of ${Math.round(score)}/100`;
    case "environment":
      return `Environment score of ${Math.round(score)}/100`;
    case "happiness":
      return `Resident happiness score of ${Math.round(score)}/100`;
    case "services":
      return `Public services score of ${Math.round(score)}/100`;
    case "english":
      return `English-friendliness score of ${Math.round(score)}/100`;
  }
}

function formatBudget(value: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function scoreCity(city: City, prefs: Preferences): MatchResult {
  const totalMonthly = householdTotal(city, prefs.household);
  const income = referenceIncome(city, prefs);
  const leftover = Math.round(income - totalMonthly);
  const scores = criterionScores(city, prefs);
  const weights =
    Object.values(prefs.weights).some((weight) => weight > 0)
      ? prefs.weights
      : DEFAULT_WEIGHTS;

  const breakdown: CriterionScore[] = CRITERIA.map((criterion) => ({
    key: criterion.key,
    label: criterion.label,
    score: scores[criterion.key],
    weight: weights[criterion.key] ?? 0,
    contribution: 0,
  }));

  const weightSum = breakdown.reduce(
    (sum, item) => sum + (item.weight > 0 ? item.weight : 0),
    0,
  );
  for (const item of breakdown) {
    item.contribution =
      weightSum > 0 && item.weight > 0
        ? round((item.score * item.weight) / weightSum)
        : 0;
  }

  const weightedScore =
    weightSum > 0
      ? breakdown.reduce((sum, item) => sum + item.score * item.weight, 0) /
        weightSum
      : 0;

  const overBudget = Boolean(prefs.budget && totalMonthly > prefs.budget);
  const overBudgetPct =
    prefs.budget && overBudget
      ? round(((totalMonthly - prefs.budget) / prefs.budget) * 100)
      : 0;

  // Over-budget candidates are never allowed to look like a perfect match.
  const score = round(
    overBudget ? Math.min(weightedScore * 0.92, 74) : weightedScore,
  );

  const chosen = breakdown
    .filter((item) => item.weight > 0)
    .sort((a, b) => b.score * b.weight - a.score * a.weight);

  const strengths = chosen
    .filter((item) => item.score >= 65)
    .slice(0, 2);
  const fallbackStrengths =
    strengths.length > 0 ? strengths : chosen.slice(0, 2);

  const tradeoffCandidates = [...chosen].sort((a, b) => a.score - b.score);
  const tradeoff =
    tradeoffCandidates.find(
      (item) =>
        item.score < 75 &&
        !fallbackStrengths.some((strength) => strength.key === item.key),
    ) ?? null;

  const reasons = fallbackStrengths.map((item) =>
    reasonFor(item.key, city, item.score, prefs, totalMonthly),
  );

  if (overBudget) {
    reasons.unshift(
      `${Math.round(overBudgetPct)}% over your budget at ${formatBudget(totalMonthly)}/month`,
    );
  }

  return {
    city,
    score,
    tier: tierFor(score),
    breakdown,
    strengths: fallbackStrengths,
    tradeoff,
    reasons,
    overBudget,
    overBudgetPct,
    totalMonthly,
    leftover,
    confidence: city.confidence,
  };
}

function matchesNonBudgetFilters(city: City, prefs: Preferences): boolean {
  if (prefs.regions.length > 0 && !prefs.regions.includes(city.region)) {
    return false;
  }
  if (prefs.climate !== "any" && !city.climate.tags.includes(prefs.climate)) {
    return false;
  }
  if (prefs.size !== "any" && city.size !== prefs.size) {
    return false;
  }
  return true;
}

export function rankCities(cities: City[], prefs: Preferences): MatchOutcome {
  const base = cities.filter((city) => matchesNonBudgetFilters(city, prefs));
  const budget = prefs.budget;

  const strict = budget
    ? base.filter((city) => householdTotal(city, prefs.household) <= budget)
    : base;

  let candidates = strict;
  let relaxedBudget = false;

  if (budget && strict.length < 5) {
    const near = base
      .filter((city) => {
        const total = householdTotal(city, prefs.household);
        return total > budget && total <= budget * 1.25;
      })
      .sort(
        (a, b) =>
          householdTotal(a, prefs.household) -
          householdTotal(b, prefs.household),
      );
    candidates = [...strict, ...near];
    relaxedBudget = near.length > 0;
  }

  if (budget && candidates.length === 0) {
    candidates = [...base]
      .sort(
        (a, b) =>
          householdTotal(a, prefs.household) -
          householdTotal(b, prefs.household),
      )
      .slice(0, 6);
    relaxedBudget = true;
  }

  const results = candidates
    .map((city) => scoreCity(city, prefs))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.totalMonthly - b.totalMonthly;
    });

  return {
    results,
    candidateCount: results.length,
    strictCount: strict.length,
    relaxedBudget,
    filteredOut: cities.length - base.length,
  };
}
