import type {
  ClimatePreference,
  CriterionKey,
  Household,
  Region,
} from "./types";

export interface CriterionDefinition {
  key: CriterionKey;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
}

export const CRITERIA: CriterionDefinition[] = [
  {
    key: "affordability",
    label: "Affordability",
    shortLabel: "Budget fit",
    description: "Rent and everyday costs against the budget you set.",
    icon: "Wallet",
  },
  {
    key: "safety",
    label: "Safety",
    shortLabel: "Safety",
    description: "Street safety, petty crime and how safe the city feels day to day.",
    icon: "ShieldCheck",
  },
  {
    key: "healthcare",
    label: "Healthcare",
    shortLabel: "Healthcare",
    description: "Access, quality and resilience of the local health system.",
    icon: "HeartPulse",
  },
  {
    key: "climate",
    label: "Climate",
    shortLabel: "Climate",
    description: "How well the city's seasons match what you want.",
    icon: "Sun",
  },
  {
    key: "jobs",
    label: "Work & salary",
    shortLabel: "Work",
    description: "Local net salary against the cost of living, plus job depth.",
    icon: "Briefcase",
  },
  {
    key: "walkability",
    label: "Walkability",
    shortLabel: "Walkability",
    description: "How much of daily life you can do on foot or by bike.",
    icon: "Footprints",
  },
  {
    key: "internet",
    label: "Internet",
    shortLabel: "Internet",
    description: "Broadband quality and how easy remote work is.",
    icon: "Wifi",
  },
  {
    key: "environment",
    label: "Environment",
    shortLabel: "Environment",
    description: "Air quality, green space and everyday environmental quality.",
    icon: "Leaf",
  },
  {
    key: "happiness",
    label: "Happiness",
    shortLabel: "Happiness",
    description: "Resident satisfaction and the general mood of the city.",
    icon: "Smile",
  },
  {
    key: "services",
    label: "Public services",
    shortLabel: "Services",
    description: "Transport, administration and everyday public infrastructure.",
    icon: "Landmark",
  },
  {
    key: "english",
    label: "English-friendly",
    shortLabel: "English",
    description: "How comfortably you can live and work in English.",
    icon: "Languages",
  },
];

export const DEFAULT_WEIGHTS: Record<CriterionKey, number> = {
  affordability: 2,
  safety: 2,
  healthcare: 2,
  climate: 2,
  jobs: 1,
  walkability: 1,
  internet: 1,
  environment: 1,
  happiness: 1,
  services: 1,
  english: 0,
};

export const WEIGHT_LABELS = [
  { value: 0, label: "Skip" },
  { value: 1, label: "Nice" },
  { value: 2, label: "Important" },
  { value: 3, label: "Essential" },
] as const;

export const REGION_LABELS: Record<Region, string> = {
  western: "Western Europe",
  northern: "Northern Europe",
  southern: "Southern Europe",
  central: "Central Europe",
  eastern: "Eastern Europe",
};

export const CLIMATE_LABELS: Record<ClimatePreference, string> = {
  any: "Any climate",
  warm: "Warm & sunny",
  mild: "Mild year-round",
  cold: "Cold winters",
  "four-seasons": "Four distinct seasons",
};

export const SIZE_LABELS = {
  any: "Any size",
  small: "Small city",
  medium: "Mid-sized city",
  large: "Big city",
} as const;

export const HOUSEHOLD_LABELS: Record<Household, string> = {
  single: "Just me",
  couple: "Couple",
  family: "Family",
};

export interface Preset {
  id: string;
  label: string;
  description: string;
  weights: Record<CriterionKey, number>;
}

export const PRESETS: Preset[] = [
  {
    id: "balanced",
    label: "Balanced life",
    description: "A bit of everything, weighted toward the essentials.",
    weights: DEFAULT_WEIGHTS,
  },
  {
    id: "budget",
    label: "Budget first",
    description: "Keep the monthly burn low without giving up safety.",
    weights: {
      affordability: 3,
      safety: 2,
      healthcare: 2,
      climate: 1,
      jobs: 1,
      walkability: 1,
      internet: 1,
      environment: 1,
      happiness: 1,
      services: 1,
      english: 0,
    },
  },
  {
    id: "career",
    label: "Career move",
    description: "Salary, job depth and a city that works for your CV.",
    weights: {
      affordability: 1,
      safety: 2,
      healthcare: 2,
      climate: 1,
      jobs: 3,
      walkability: 1,
      internet: 2,
      environment: 1,
      happiness: 1,
      services: 1,
      english: 2,
    },
  },
  {
    id: "wellbeing",
    label: "Health & calm",
    description: "Safety, healthcare, clean air and everyday livability.",
    weights: {
      affordability: 1,
      safety: 3,
      healthcare: 3,
      climate: 2,
      jobs: 1,
      walkability: 1,
      internet: 1,
      environment: 2,
      happiness: 2,
      services: 2,
      english: 0,
    },
  },
  {
    id: "remote",
    label: "Remote worker",
    description: "Fast internet, low costs and a city built for daily life.",
    weights: {
      affordability: 2,
      safety: 2,
      healthcare: 2,
      climate: 2,
      jobs: 1,
      walkability: 2,
      internet: 3,
      environment: 1,
      happiness: 1,
      services: 1,
      english: 2,
    },
  },
];
