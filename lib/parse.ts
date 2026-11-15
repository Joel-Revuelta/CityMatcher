import { DEFAULT_WEIGHTS, CLIMATE_LABELS, REGION_LABELS } from "./criteria";
import type {
  ClimatePreference,
  CriterionKey,
  Household,
  ParsedPreferences,
  Region,
} from "./types";

const COUNTRY_REGIONS: Record<string, Region> = {
  portugal: "western",
  spain: "western",
  france: "western",
  belgium: "western",
  netherlands: "western",
  holland: "western",
  ireland: "western",
  uk: "western",
  britain: "western",
  england: "western",
  scotland: "western",
  germany: "central",
  austria: "central",
  switzerland: "central",
  czechia: "central",
  "czech republic": "central",
  poland: "central",
  hungary: "central",
  slovenia: "central",
  italy: "southern",
  greece: "southern",
  denmark: "northern",
  sweden: "northern",
  norway: "northern",
  finland: "northern",
  iceland: "northern",
  estonia: "eastern",
  latvia: "eastern",
  lithuania: "eastern",
  croatia: "eastern",
  serbia: "eastern",
  romania: "eastern",
  bulgaria: "eastern",
};

const KEYWORDS: Array<{
  key: CriterionKey;
  terms: RegExp;
  weight: number;
}> = [
  { key: "affordability", terms: /\b(affordable|cheap|budget|low cost|cost of living|save money)\b/, weight: 3 },
  { key: "safety", terms: /\b(safe|safety|low crime|crime|secure)\b/, weight: 3 },
  { key: "healthcare", terms: /\b(healthcare|health care|health system|hospital|medical)\b/, weight: 3 },
  { key: "climate", terms: /\b(climate|weather|sunny|sunshine|warm|hot|mild|cold|seasons|mediterranean)\b/, weight: 3 },
  { key: "jobs", terms: /\b(job|jobs|career|salary|salaries|work|employment|tech hub)\b/, weight: 3 },
  { key: "walkability", terms: /\b(walkable|walking|on foot|car-free|car free|bike|cycling)\b/, weight: 3 },
  { key: "internet", terms: /\b(internet|wifi|wi-fi|broadband|remote work|remote)\b/, weight: 3 },
  { key: "environment", terms: /\b(nature|green|clean air|air quality|pollution|outdoors|mountains|sea)\b/, weight: 2 },
  { key: "happiness", terms: /\b(happy|happiness|friendly|social|community)\b/, weight: 2 },
  { key: "services", terms: /\b(public transport|transit|public services|bureaucracy|infrastructure)\b/, weight: 2 },
  { key: "english", terms: /\b(english|english-speaking|language barrier)\b/, weight: 3 },
];

function parseAmount(raw: string, multiplier?: string): number | null {
  const cleaned = raw.replace(/[^\d.,]/g, "").replace(/,/g, "");
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value <= 0) return null;
  const multiplied = multiplier ? value * 1000 : value;
  return Math.round(multiplied);
}

function titleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function parsePreferences(text: string): ParsedPreferences {
  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
  const patch: ParsedPreferences["patch"] = {};
  const chips: string[] = [];
  const interpreted: string[] = [];
  const weights: Record<CriterionKey, number> = { ...DEFAULT_WEIGHTS };

  // Budget: "under €2,000", "max 2k", "budget of 1800 euros", "€2.5k"
  const budgetMatch =
    normalized.match(
      /(?:under|below|max(?:imum)?|budget(?: of)?|up to|less than|at most|around)\s*€?\s*([\d.,]+)\s*(k|thousand)?/,
    ) ??
    normalized.match(/€\s*([\d.,]+)\s*(k|thousand)?/) ??
    normalized.match(/([\d.,]+)\s*(?:€|eur|euros)/);
  if (budgetMatch) {
    const amount = parseAmount(budgetMatch[1], budgetMatch[2]);
    if (amount && amount >= 300) {
      patch.budget = amount;
      chips.push(`Budget ≤ €${amount.toLocaleString("en-IE")}/month`);
      interpreted.push(
        `Monthly budget set to €${amount.toLocaleString("en-IE")}`,
      );
    }
  }

  // Income: "I earn 3k", "salary of €45,000" (annual → monthly).
  const incomeMatch =
    normalized.match(/(?:i earn|earning|income of|salary of|make)\s*€?\s*([\d.,]+)\s*(k|thousand)?/) ??
    normalized.match(/€\s*([\d.,]+)\s*(k|thousand)?\s*(?:a month|per month|\/month|monthly)/);
  if (incomeMatch) {
    const amount = parseAmount(incomeMatch[1], incomeMatch[2]);
    if (amount) {
      const monthly = amount > 15000 ? Math.round(amount / 12) : amount;
      patch.income = monthly;
      chips.push(`Income ≈ €${monthly.toLocaleString("en-IE")}/month`);
    }
  }

  // Regions by name or country.
  const regions = new Set<Region>();
  if (/\b(northern europe|nordics?|scandinavia|baltic)\b/.test(normalized)) {
    regions.add("northern");
  }
  if (/\b(southern europe|mediterranean|south of europe)\b/.test(normalized)) {
    regions.add("southern");
  }
  if (/\b(western europe|west europe)\b/.test(normalized)) {
    regions.add("western");
  }
  if (/\b(central europe|central)\b/.test(normalized)) {
    regions.add("central");
  }
  if (/\b(eastern europe|east europe|balkans?)\b/.test(normalized)) {
    regions.add("eastern");
  }
  for (const [country, region] of Object.entries(COUNTRY_REGIONS)) {
    if (new RegExp(`\\b${country}\\b`).test(normalized)) {
      regions.add(region);
    }
  }
  if (regions.size > 0) {
    patch.regions = [...regions];
    chips.push(
      [...regions].map((region) => REGION_LABELS[region]).join(" + "),
    );
  }

  // Climate.
  let climate: ClimatePreference | null = null;
  if (/\b(warm|sunny|sunshine|hot|mediterranean|beach)\b/.test(normalized)) {
    climate = "warm";
  } else if (/\b(cold|snow|snowy|winter)\b/.test(normalized)) {
    climate = "cold";
  } else if (/\b(four seasons|distinct seasons|all four seasons)\b/.test(normalized)) {
    climate = "four-seasons";
  } else if (/\b(mild|not too hot|not too cold|temperate)\b/.test(normalized)) {
    climate = "mild";
  }
  if (climate) {
    patch.climate = climate;
    chips.push(CLIMATE_LABELS[climate]);
  }

  // City size.
  if (/\b(small city|small town|town|village|quiet)\b/.test(normalized)) {
    patch.size = "small";
    chips.push("Small city");
  } else if (/\b(big city|large city|capital|major city|metropolis|buzzing)\b/.test(normalized)) {
    patch.size = "large";
    chips.push("Big city");
  } else if (/\b(mid-sized|medium city|medium-sized)\b/.test(normalized)) {
    patch.size = "medium";
    chips.push("Mid-sized city");
  }

  // Weights.
  for (const keyword of KEYWORDS) {
    if (keyword.terms.test(normalized)) {
      weights[keyword.key] = Math.max(weights[keyword.key], keyword.weight);
      const label = keyword.key === "affordability" ? "Budget" : titleCase(keyword.key);
      if (!chips.includes(label)) chips.push(label);
    }
  }
  patch.weights = weights;

  // Household.
  let household: Household | null = null;
  if (/\b(family|kids|children|schools)\b/.test(normalized)) {
    household = "family";
    chips.push("Family");
  } else if (/\b(couple|partner|two of us)\b/.test(normalized)) {
    household = "couple";
    chips.push("Couple");
  }
  if (household) patch.household = household;

  // Job title, kept deliberately conservative.
  const jobMatch = normalized.match(
    /(?:work(?:ing)? as (?:a |an )?|job in |career in |i'm a |i am a )([a-z ]{3,30})/,
  );
  if (jobMatch) {
    const job = titleCase(jobMatch[1].replace(/\b(and|with|in|near)\b.*$/, ""));
    if (job.length >= 3) {
      patch.job = job;
      chips.push(`Work: ${job}`);
    }
  }

  if (chips.length === 0) {
    interpreted.push(
      "No specific preferences detected. Try “warm, walkable, safe, under €2,000”.",
    );
  } else {
    interpreted.push(
      `Applied ${chips.length} preference${chips.length === 1 ? "" : "s"} to your search.`,
    );
  }

  return { patch, chips, interpreted };
}
