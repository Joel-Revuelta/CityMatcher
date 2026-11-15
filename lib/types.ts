export type Region =
  | "western"
  | "northern"
  | "southern"
  | "central"
  | "eastern";

export type ClimateTag = "warm" | "mild" | "cold" | "four-seasons";

export type Confidence = "high" | "medium" | "low";

export type CriterionKey =
  | "affordability"
  | "safety"
  | "healthcare"
  | "climate"
  | "internet"
  | "walkability"
  | "environment"
  | "jobs"
  | "happiness"
  | "services"
  | "english";

export type CitySize = "small" | "medium" | "large";
export type ClimatePreference = ClimateTag | "any";
export type Household = "single" | "couple" | "family";

export interface SourceRef {
  label: string;
  url: string;
  asOf: string;
  note?: string;
}

export interface MonthlyClimate {
  month: string;
  high: number;
  low: number;
  rain: number;
  sun: number;
}

export interface CityClimate {
  monthly: MonthlyClimate[];
  summerHigh: number;
  winterLow: number;
  annualRain: number;
  annualSunHours: number;
  tags: ClimateTag[];
}

export interface CityCost {
  rentOneBed: number;
  livingSingle: number;
  totalSingle: number;
  index: number;
}

export interface CityWork {
  avgNetSalary: number;
  salaryCoverage: number;
  topSectors: string[];
}

export interface CityMetrics {
  safety: number;
  healthcare: number;
  internet: number;
  walkability: number;
  environment: number;
  happiness: number;
  publicServices: number;
  english: number;
}

export interface CityEditorial {
  summary: string;
  bestFor: string;
}

export interface City {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  region: Region;
  population: number;
  size: CitySize;
  lat: number;
  lng: number;
  currency: string;
  climate: CityClimate;
  cost: CityCost;
  work: CityWork;
  metrics: CityMetrics;
  confidence: Confidence;
  sources: SourceRef[];
  editorial: CityEditorial;
}

export interface CountryContext {
  code: string;
  name: string;
  internetUsers: number | null;
  lifeExpectancy: number | null;
  healthSpendPc: number | null;
  pm25: number | null;
  gdpPpp: number | null;
  unemployment: number | null;
  asOf: string;
}

export interface Dataset {
  generatedAt: string;
  methodologyVersion: string;
  cities: City[];
  countries: CountryContext[];
}

export interface Preferences {
  budget: number | null;
  regions: Region[];
  climate: ClimatePreference;
  size: "any" | CitySize;
  weights: Record<CriterionKey, number>;
  income: number | null;
  job: string;
  household: Household;
}

export interface CriterionScore {
  key: CriterionKey;
  label: string;
  score: number;
  weight: number;
  contribution: number;
}

export type MatchTier = "Excellent" | "Strong" | "Fair" | "Stretch";

export interface MatchResult {
  city: City;
  score: number;
  tier: MatchTier;
  breakdown: CriterionScore[];
  strengths: CriterionScore[];
  tradeoff: CriterionScore | null;
  reasons: string[];
  overBudget: boolean;
  overBudgetPct: number;
  totalMonthly: number;
  leftover: number | null;
  confidence: Confidence;
}

export interface MatchOutcome {
  results: MatchResult[];
  candidateCount: number;
  strictCount: number;
  relaxedBudget: boolean;
  filteredOut: number;
}

export interface ParsedPreferences {
  patch: Partial<Preferences>;
  chips: string[];
  interpreted: string[];
}
