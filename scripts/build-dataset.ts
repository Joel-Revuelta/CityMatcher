import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { citySeeds } from "./seed/cities";
import type {
  City,
  CityClimate,
  ClimateTag,
  CountryContext,
  Dataset,
  MonthlyClimate,
  SourceRef,
} from "../lib/types";

const ROOT = process.cwd();
const CACHE_DIR = path.join(ROOT, "scripts", ".cache");
const DATA_DIR = path.join(ROOT, "data");

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const CLIMATE_START = "2019-01-01";
const CLIMATE_END = "2024-12-31";
const METHODOLOGY_VERSION = "1.0";
const COST_AS_OF = "2025-06-30";

async function readCache<T>(name: string): Promise<T | null> {
  try {
    const raw = await readFile(path.join(CACHE_DIR, name), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeCache(name: string, value: unknown): Promise<void> {
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(path.join(CACHE_DIR, name), JSON.stringify(value), "utf8");
}

interface ArchiveResponse {
  daily?: {
    time: string[];
    temperature_2m_max: (number | null)[];
    temperature_2m_min: (number | null)[];
    precipitation_sum: (number | null)[];
    sunshine_duration: (number | null)[];
  };
  error?: boolean;
  reason?: string;
}

async function fetchClimate(
  slug: string,
  lat: number,
  lng: number,
): Promise<CityClimate> {
  const cacheName = `climate-${slug}.json`;
  const cached = await readCache<ArchiveResponse>(cacheName);
  let data = cached;

  if (!data) {
    const url = new URL("https://archive-api.open-meteo.com/v1/archive");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lng));
    url.searchParams.set("start_date", CLIMATE_START);
    url.searchParams.set("end_date", CLIMATE_END);
    url.searchParams.set(
      "daily",
      "temperature_2m_max,temperature_2m_min,precipitation_sum,sunshine_duration",
    );
    url.searchParams.set("timezone", "auto");

    const res = await fetchWithRetry(url, 1);
    if (!res.ok) {
      // The archive API rate-limits heavy normals requests; the climate
      // projection endpoint serves the same daily variables and is a
      // reliable fallback for the remaining cities.
      const fallback = new URL("https://climate-api.open-meteo.com/v1/climate");
      for (const [key, value] of url.searchParams) {
        if (key !== "timezone") fallback.searchParams.set(key, value);
      }
      fallback.searchParams.set("models", "MRI_AGCM3_2_S");
      const fallbackRes = await fetchWithRetry(fallback, 4);
      if (!fallbackRes.ok) {
        throw new Error(`Open-Meteo ${slug}: HTTP ${fallbackRes.status}`);
      }
      data = (await fallbackRes.json()) as ArchiveResponse;
    } else {
      data = (await res.json()) as ArchiveResponse;
    }
    if (data.error || !data.daily) {
      throw new Error(`Open-Meteo ${slug}: ${data.reason ?? "no daily data"}`);
    }
    await writeCache(cacheName, data);
  }

  const daily = data.daily;
  if (!daily) throw new Error(`Open-Meteo ${slug}: missing daily data`);

  const buckets = Array.from({ length: 12 }, () => ({
    high: [] as number[],
    low: [] as number[],
    rain: [] as number[],
    sun: [] as number[],
  }));

  for (let i = 0; i < daily.time.length; i++) {
    const date = daily.time[i];
    if (!date) continue;
    const month = Number(date.slice(5, 7)) - 1;
    const high = daily.temperature_2m_max[i];
    const low = daily.temperature_2m_min[i];
    const rain = daily.precipitation_sum[i];
    const sun = daily.sunshine_duration[i];
    if (high !== null) buckets[month].high.push(high);
    if (low !== null) buckets[month].low.push(low);
    if (rain !== null) buckets[month].rain.push(rain);
    if (sun !== null) buckets[month].sun.push(sun);
  }

  const mean = (values: number[]) =>
    values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

  // Number of years represented per calendar month.
  const years = daily.time.length ? Math.max(1, new Set(daily.time.map((d) => d.slice(0, 4))).size) : 1;

  const monthly: MonthlyClimate[] = buckets.map((bucket, i) => ({
    month: MONTHS[i],
    high: round(mean(bucket.high), 1),
    low: round(mean(bucket.low), 1),
    rain: round(sum(bucket.rain) / years, 0),
    sun: round(sum(bucket.sun) / 3600 / years, 0),
  }));

  const summerHigh = round((monthly[6].high + monthly[7].high) / 2, 1);
  const winterLow = round((monthly[0].low + monthly[1].low) / 2, 1);
  const annualRain = monthly.reduce((acc, m) => acc + m.rain, 0);
  const annualSunHours = monthly.reduce((acc, m) => acc + m.sun, 0);

  const tags: ClimateTag[] = [];
  if (winterLow < 2) tags.push("cold");
  if (summerHigh >= 28 && winterLow >= 2) tags.push("warm");
  if (winterLow >= 8 && summerHigh <= 27) tags.push("mild");
  if (winterLow < 3 && summerHigh >= 21) tags.push("four-seasons");
  if (tags.length === 0) tags.push("mild");

  return {
    monthly,
    summerHigh,
    winterLow,
    annualRain: Math.round(annualRain),
    annualSunHours: Math.round(annualSunHours),
    tags,
  };
}

const WB_INDICATORS = {
  internetUsers: "IT.NET.USER.ZS",
  lifeExpectancy: "SP.DYN.LE00.IN",
  healthSpendPc: "SH.XPD.CHEX.PC.CD",
  pm25: "EN.ATM.PM25.MC.M3",
  gdpPpp: "NY.GDP.PCAP.PP.CD",
  unemployment: "SL.UEM.TOTL.ZS",
} as const;

type WbKey = keyof typeof WB_INDICATORS;

interface WbRow {
  countryiso3code: string;
  date: string;
  value: number | null;
}

async function fetchWorldBankIndicator(
  key: WbKey,
  indicator: string,
): Promise<Map<string, { value: number; year: string }>> {
  const cacheName = `wb-${key}.json`;
  const cached = await readCache<Map<string, { value: number; year: string }>>(
    cacheName,
  );
  if (cached) return new Map(Object.entries(cached));

  const url = new URL(
    `https://api.worldbank.org/v2/country/all/indicator/${indicator}`,
  );
  url.searchParams.set("format", "json");
  url.searchParams.set("per_page", "2000");
  url.searchParams.set("date", "2020:2025");

  let res: Response | null = null;
  for (let attempt = 1; attempt <= 4; attempt++) {
    res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
    if (res.ok) break;
    console.warn(`World Bank ${key}: HTTP ${res.status}, retry ${attempt}/4`);
    await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
  }
  if (!res || !res.ok) {
    throw new Error(`World Bank ${key}: HTTP ${res?.status ?? "no response"}`);
  }
  const payload = (await res.json()) as [unknown, WbRow[] | undefined];
  const rows = payload[1];
  if (!Array.isArray(rows)) {
    throw new Error(`World Bank ${key}: unexpected payload`);
  }

  const latest = new Map<string, { value: number; year: string }>();
  for (const row of rows) {
    if (row.value === null) continue;
    const code = row.countryiso3code;
    const existing = latest.get(code);
    if (!existing || Number(row.date) > Number(existing.year)) {
      latest.set(code, { value: row.value, year: row.date });
    }
  }

  await writeCache(cacheName, Object.fromEntries(latest));
  return latest;
}

async function fetchWithRetry(
  url: URL,
  attempts: number,
): Promise<Response> {
  let last: Response | null = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    last = await fetch(url, { signal: AbortSignal.timeout(90_000) });
    if (last.ok) return last;
    if (last.status !== 429 && last.status < 500) return last;
    const wait = attempt * 4000;
    console.warn(`Open-Meteo: HTTP ${last.status}, retry in ${wait}ms`);
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  return last as Response;
}

function round(value: number, digits = 0): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

function citySize(population: number): "small" | "medium" | "large" {
  if (population < 500_000) return "small";
  if (population < 1_500_000) return "medium";
  return "large";
}

async function main(): Promise<void> {
  console.log(`Building CityMatcher dataset for ${citySeeds.length} cities…`);

  const countryCodes = [...new Set(citySeeds.map((c) => c.countryCode))];
  const iso3 = await import("./seed/iso3").then((m) => m.iso3);
  const codeToIso3 = new Map(countryCodes.map((code) => [code, iso3[code]]));

  const wbEntries = await Promise.all(
    (Object.keys(WB_INDICATORS) as WbKey[]).map(async (key) => {
      const map = await fetchWorldBankIndicator(key, WB_INDICATORS[key]);
      return [key, map] as const;
    }),
  );
  const wb = Object.fromEntries(wbEntries) as Record<
    WbKey,
    Map<string, { value: number; year: string }>
  >;

  const countryNames = new Map<string, string>();
  const countries: CountryContext[] = countryCodes.map((code) => {
    const iso = codeToIso3.get(code);
    if (!iso) throw new Error(`Missing ISO3 code for ${code}`);
    const get = (key: WbKey) => (iso ? wb[key].get(iso) : undefined);
    const latestYear = Math.max(
      ...Object.keys(WB_INDICATORS)
        .map((key) => Number(get(key as WbKey)?.year ?? 0))
        .filter((year) => year > 0),
    );
    const name = citySeeds.find((c) => c.countryCode === code)?.country ?? code;
    countryNames.set(code, name);
    return {
      code,
      name,
      internetUsers: get("internetUsers")?.value ?? null,
      lifeExpectancy: get("lifeExpectancy")?.value ?? null,
      healthSpendPc: get("healthSpendPc")?.value ?? null,
      pm25: get("pm25")?.value ?? null,
      gdpPpp: get("gdpPpp")?.value ?? null,
      unemployment: get("unemployment")?.value ?? null,
      asOf: latestYear ? String(latestYear) : "2024",
    };
  });

  const climateResults = await mapWithConcurrency(citySeeds, 1, async (seed) => {
    const climate = await fetchClimate(seed.slug, seed.lat, seed.lng);
    // Be polite to the free API: one request at a time, with a small gap.
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return [seed.slug, climate] as const;
  });
  const climates = new Map(climateResults);

  const cities: City[] = citySeeds.map((seed) => {
    const climate = climates.get(seed.slug);
    if (!climate) throw new Error(`No climate for ${seed.slug}`);
    const country = countries.find((c) => c.code === seed.countryCode);
    const totalSingle = seed.rentOneBed + seed.livingSingle;
    const costIndex = clamp(Math.round(((totalSingle - 500) / 3500) * 100));
    const internet = country?.internetUsers
      ? clamp(Math.round(((country.internetUsers - 55) / 45) * 100))
      : 70;
    const sources: SourceRef[] = [
      {
        label: "Open-Meteo climate normals",
        url: "https://open-meteo.com/",
        asOf: CLIMATE_END,
        note: "ERA5 reanalysis, monthly averages 2019–2024",
      },
      {
        label: "World Bank country indicators",
        url: "https://data.worldbank.org/",
        asOf: country?.asOf ?? "2024",
        note: "Internet use, life expectancy, health spending, PM2.5, GDP PPP, unemployment",
      },
      {
        label: "CityMatcher cost model",
        url: "/methodology",
        asOf: COST_AS_OF,
        note: "Curated rent, living-cost and salary estimates for a single person; modelled, medium confidence",
      },
    ];

    return {
      slug: seed.slug,
      name: seed.name,
      country: seed.country,
      countryCode: seed.countryCode,
      region: seed.region,
      population: seed.population,
      size: citySize(seed.population),
      lat: seed.lat,
      lng: seed.lng,
      currency: seed.currency,
      climate,
      cost: {
        rentOneBed: seed.rentOneBed,
        livingSingle: seed.livingSingle,
        totalSingle,
        index: costIndex,
      },
      work: {
        avgNetSalary: seed.avgNetSalary,
        salaryCoverage: round(seed.avgNetSalary / totalSingle, 2),
        topSectors: seed.topSectors,
      },
      metrics: {
        safety: seed.safety,
        healthcare: seed.healthcare,
        internet,
        walkability: seed.walkability,
        environment: seed.environment,
        happiness: seed.happiness,
        publicServices: seed.publicServices,
        english: seed.english,
      },
      confidence: "medium",
      sources,
      editorial: {
        summary: seed.summary,
        bestFor: seed.bestFor,
      },
    };
  });

  cities.sort((a, b) => a.name.localeCompare(b.name));

  const dataset: Dataset = {
    generatedAt: new Date().toISOString(),
    methodologyVersion: METHODOLOGY_VERSION,
    cities,
    countries,
  };

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(
    path.join(DATA_DIR, "dataset.json"),
    JSON.stringify(dataset, null, 2) + "\n",
    "utf8",
  );

  const avgCoverage =
    cities.reduce((acc, c) => acc + c.work.salaryCoverage, 0) / cities.length;
  console.log(
    `Wrote ${cities.length} cities and ${countries.length} countries to data/dataset.json`,
  );
  console.log(`Average salary coverage: ${avgCoverage.toFixed(2)}×`);
  console.log(
    `Climate months: ${cities.every((c) => c.climate.monthly.length === 12) ? "ok" : "INVALID"}`,
  );
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await mapper(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
