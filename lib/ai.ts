import { CRITERIA, DEFAULT_WEIGHTS } from "./criteria";
import type {
  ClimatePreference,
  CriterionKey,
  Household,
  ParsedPreferences,
  Preferences,
  Region,
} from "./types";

const REGIONS: Region[] = [
  "western",
  "northern",
  "southern",
  "central",
  "eastern",
];
const CLIMATES: ClimatePreference[] = [
  "warm",
  "mild",
  "cold",
  "four-seasons",
  "any",
];
const SIZES = ["any", "small", "medium", "large"] as const;
const HOUSEHOLDS: Household[] = ["single", "couple", "family"];
const CRITERIA_KEYS = CRITERIA.map((criterion) => criterion.key);

export function isAiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY);
}

const PROMPT = `You convert a person's city preferences into a JSON object for a relocation search engine.
Extract only what the person states or strongly implies. Never invent preferences.
budget is a monthly household budget in euros (integer) or null.
income is monthly net income in euros or null.
regions is a subset of ["western","northern","southern","central","eastern"]; empty means anywhere.
climate is one of "warm","mild","cold","four-seasons","any".
size is one of "any","small","medium","large".
weights must contain every criterion key with a value 0 (skip), 1 (nice), 2 (important), 3 (essential):
affordability, safety, healthcare, climate, jobs, walkability, internet, environment, happiness, services, english.
Use 3 only when the person clearly treats it as essential. Default unmentioned criteria to 1 or 2.
household is "single","couple","family".
job is a short job title or "".
Return JSON only, with no commentary.`;

function geminiSchema(): Record<string, unknown> {
  const weightProperties: Record<string, unknown> = {};
  for (const key of CRITERIA_KEYS) {
    weightProperties[key] = { type: "INTEGER", minimum: 0, maximum: 3 };
  }
  return {
    type: "OBJECT",
    properties: {
      budget: { type: "NUMBER", nullable: true },
      income: { type: "NUMBER", nullable: true },
      regions: {
        type: "ARRAY",
        items: { type: "STRING", enum: REGIONS },
      },
      climate: { type: "STRING", enum: CLIMATES },
      size: { type: "STRING", enum: SIZES },
      weights: {
        type: "OBJECT",
        properties: weightProperties,
        required: CRITERIA_KEYS,
      },
      household: { type: "STRING", enum: HOUSEHOLDS },
      job: { type: "STRING" },
    },
    required: [
      "budget",
      "income",
      "regions",
      "climate",
      "size",
      "weights",
      "household",
      "job",
    ],
  };
}

async function parseWithGemini(text: string): Promise<unknown | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: `${PROMPT}\n\nUser: ${text}` }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 800,
        responseMimeType: "application/json",
        responseSchema: geminiSchema(),
      },
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(`Gemini HTTP ${response.status}`);
  }
  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) return null;
  return JSON.parse(raw);
}

async function parseWithGroq(text: string): Promise<unknown | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: PROMPT },
        { role: "user", content: text },
      ],
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(`Groq HTTP ${response.status}`);
  }
  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = payload.choices?.[0]?.message?.content;
  if (!raw) return null;
  return JSON.parse(raw);
}

function clampWeight(value: unknown): number {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return 1;
  return Math.min(3, Math.max(0, Math.round(number)));
}

export function sanitizeAiPreferences(raw: unknown): ParsedPreferences | null {
  if (!raw || typeof raw !== "object") return null;
  const input = raw as Record<string, unknown>;
  const patch: Partial<Preferences> = {};
  const chips: string[] = [];

  const budget = Number(input.budget);
  if (Number.isFinite(budget) && budget >= 300 && budget <= 10000) {
    patch.budget = Math.round(budget);
    chips.push(`Budget ≤ €${Math.round(budget).toLocaleString("en-IE")}/month`);
  }

  const income = Number(input.income);
  if (Number.isFinite(income) && income > 0 && income <= 20000) {
    patch.income = Math.round(income);
    chips.push(`Income ≈ €${Math.round(income).toLocaleString("en-IE")}/month`);
  }

  if (Array.isArray(input.regions)) {
    const regions = [
      ...new Set(
        input.regions.filter((region): region is Region =>
          REGIONS.includes(region as Region),
        ),
      ),
    ];
    if (regions.length > 0) {
      patch.regions = regions;
      chips.push(regions.join(", "));
    }
  }

  if (typeof input.climate === "string" && CLIMATES.includes(input.climate as ClimatePreference)) {
    patch.climate = input.climate as ClimatePreference;
    if (input.climate !== "any") chips.push(String(input.climate));
  }

  if (typeof input.size === "string" && SIZES.includes(input.size as (typeof SIZES)[number])) {
    patch.size = input.size as (typeof SIZES)[number];
    if (input.size !== "any") chips.push(String(input.size));
  }

  if (input.weights && typeof input.weights === "object") {
    const weights = { ...DEFAULT_WEIGHTS };
    const inputWeights = input.weights as Record<string, unknown>;
    for (const key of CRITERIA_KEYS) {
      if (key in inputWeights) {
        weights[key] = clampWeight(inputWeights[key]);
      }
    }
    patch.weights = weights;
  }

  if (typeof input.household === "string" && HOUSEHOLDS.includes(input.household as Household)) {
    patch.household = input.household as Household;
    if (input.household !== "single") chips.push(String(input.household));
  }

  if (typeof input.job === "string" && input.job.trim()) {
    patch.job = input.job.trim().slice(0, 60);
    chips.push(`Work: ${patch.job}`);
  }

  if (Object.keys(patch).length === 0) return null;
  return {
    patch,
    chips,
    interpreted: [`AI parsed ${chips.length} preference${chips.length === 1 ? "" : "s"}.`],
  };
}

export async function parseWithAi(text: string): Promise<ParsedPreferences | null> {
  if (!isAiConfigured()) return null;
  const candidates = [
    () => parseWithGemini(text),
    () => parseWithGroq(text),
  ];
  for (const call of candidates) {
    try {
      const raw = await call();
      if (!raw) continue;
      const parsed = sanitizeAiPreferences(raw);
      if (parsed) return parsed;
    } catch (error) {
      console.warn("AI preference parsing failed:", error);
    }
  }
  return null;
}

export const AI_CRITERIA_KEYS: CriterionKey[] = CRITERIA_KEYS;
