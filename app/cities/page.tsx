import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { MiniClimate } from "@/components/mini-climate";
import {
  CLIMATE_LABELS,
  REGION_LABELS,
  SIZE_LABELS,
} from "@/lib/criteria";
import { getAllCities } from "@/lib/data";
import { formatEUR } from "@/lib/format";
import type { ClimateTag, Region } from "@/lib/types";

export const metadata: Metadata = {
  title: "Browse European cities",
  description:
    "Search and compare 42 European cities on monthly cost, safety, healthcare, walkability, climate and English-friendliness.",
  alternates: { canonical: "/cities" },
};

const SORTS = [
  { value: "name", label: "Name" },
  { value: "cost", label: "Lowest monthly cost" },
  { value: "safety", label: "Safety" },
  { value: "healthcare", label: "Healthcare" },
  { value: "walkability", label: "Walkability" },
  { value: "sun", label: "Most sun" },
] as const;

const CLIMATE_TAGS = ["warm", "mild", "cold", "four-seasons"] as const;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function CitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = first(params.q).trim();
  const region = first(params.region);
  const climate = first(params.climate);
  const sort = SORTS.some((option) => option.value === first(params.sort))
    ? first(params.sort)
    : "name";

  let cities = getAllCities();
  if (q) {
    const needle = q.toLowerCase();
    cities = cities.filter(
      (city) =>
        city.name.toLowerCase().includes(needle) ||
        city.country.toLowerCase().includes(needle),
    );
  }
  if (region && region in REGION_LABELS) {
    cities = cities.filter((city) => city.region === (region as Region));
  }
  if (climate && climate in CLIMATE_LABELS) {
    cities = cities.filter((city) =>
      city.climate.tags.includes(climate as ClimateTag),
    );
  }

  cities = [...cities].sort((a, b) => {
    switch (sort) {
      case "cost":
        return a.cost.totalSingle - b.cost.totalSingle;
      case "safety":
        return b.metrics.safety - a.metrics.safety;
      case "healthcare":
        return b.metrics.healthcare - a.metrics.healthcare;
      case "walkability":
        return b.metrics.walkability - a.metrics.walkability;
      case "sun":
        return b.climate.annualSunHours - a.climate.annualSunHours;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const hasFilters = Boolean(q || region || climate);

  return (
    <div className="mx-auto w-full max-w-[1360px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <div className="flex flex-col justify-between gap-6 border-b border-border pb-7 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <p className="label">City index</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
            Browse the cities.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            All 42 cities in the dataset, now searchable. Filter by region and
            climate, or sort by the thing you care about most.
          </p>
        </div>
        <Link href="/#wizard" className={buttonVariants({ size: "sm" })}>
          Build a brief instead
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <form
        action="/cities"
        method="get"
        className="mt-6 grid gap-3 border-b border-border pb-5 md:grid-cols-[1fr_10rem_11rem_11rem_auto] md:items-end"
      >
        <div>
          <label htmlFor="city-search" className="label">
            Search
          </label>
          <div className="mt-1.5 flex h-10 items-center border border-border bg-background px-3">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              id="city-search"
              name="q"
              defaultValue={q}
              placeholder="Lisbon, Portugal…"
              className="h-full w-full bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground/70"
            />
          </div>
        </div>

        <div>
          <label htmlFor="city-region" className="label">
            Region
          </label>
          <select
            id="city-region"
            name="region"
            defaultValue={region}
            className="mt-1.5 h-10 w-full border border-border bg-background px-2 text-xs"
          >
            <option value="">All regions</option>
            {(Object.keys(REGION_LABELS) as Region[]).map((key) => (
              <option key={key} value={key}>
                {REGION_LABELS[key]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="city-climate" className="label">
            Climate
          </label>
          <select
            id="city-climate"
            name="climate"
            defaultValue={climate}
            className="mt-1.5 h-10 w-full border border-border bg-background px-2 text-xs"
          >
            <option value="">Any climate</option>
            {CLIMATE_TAGS.map((tag) => (
              <option key={tag} value={tag}>
                {CLIMATE_LABELS[tag]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="city-sort" className="label">
            Sort
          </label>
          <select
            id="city-sort"
            name="sort"
            defaultValue={sort}
            className="mt-1.5 h-10 w-full border border-border bg-background px-2 text-xs"
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button type="submit" className={buttonVariants({ size: "md" })}>
            Apply
          </button>
          {hasFilters || sort !== "name" ? (
            <Link href="/cities" className={buttonVariants({ variant: "ghost", size: "md" })}>
              Reset
            </Link>
          ) : null}
        </div>
      </form>

      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          <span className="font-mono text-foreground">{cities.length}</span>{" "}
          {cities.length === 1 ? "city" : "cities"}
          {q ? ` matching “${q}”` : ""}
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          Costs are single-person, EUR/month
        </p>
      </div>

      <div className="mt-3 border-t border-border">
        {cities.map((city) => (
          <div
            key={city.slug}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 border-b border-border py-4 md:grid-cols-[minmax(0,1.5fr)_8rem_7rem_6.5rem_6rem_2rem] md:gap-5"
          >
            <div className="min-w-0">
              <Link
                href={`/city/${city.slug}`}
                className="text-lg font-semibold tracking-tight hover:text-primary"
              >
                {city.name}
              </Link>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {city.country}, {REGION_LABELS[city.region]}, {SIZE_LABELS[city.size]}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5 md:hidden">
                <Badge tone="outline">{formatEUR(city.cost.totalSingle)}/mo</Badge>
                <Badge tone="outline">{city.climate.tags.map((tag) => CLIMATE_LABELS[tag]).join(" + ")}</Badge>
              </div>
            </div>

            <div className="hidden md:block">
              <MiniClimate climate={city.climate} width={86} height={24} />
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {city.climate.summerHigh}° / {city.climate.winterLow}°
              </p>
            </div>

            <div className="hidden md:block">
              <p className="font-mono text-sm tabular-nums">{formatEUR(city.cost.totalSingle)}</p>
              <p className="text-xs text-muted-foreground">monthly</p>
            </div>

            <div className="hidden md:block">
              <p className="font-mono text-sm tabular-nums">{city.metrics.safety}</p>
              <p className="text-xs text-muted-foreground">safety</p>
            </div>

            <div className="hidden md:block">
              <p className="font-mono text-sm tabular-nums">{city.metrics.healthcare}</p>
              <p className="text-xs text-muted-foreground">health</p>
            </div>

            <Link
              href={`/city/${city.slug}`}
              className="inline-flex h-10 w-10 items-center justify-center border border-border justify-self-end hover:border-foreground"
              aria-label={`Open ${city.name}`}
            >
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>

      {cities.length === 0 ? (
        <div className="mx-auto mt-10 max-w-xl border border-border p-8">
          <p className="label">No matches</p>
          <h2 className="mt-2 text-2xl font-semibold">No city fits those filters</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Try a different spelling, remove the climate filter or search by country.
          </p>
          <Link href="/cities" className={buttonVariants({ size: "sm", className: "mt-5" })}>
            Reset the index
          </Link>
        </div>
      ) : null}

      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        This index is a directory, not a ranking. For a ranked list,{" "}
        <Link href="/#wizard" className="text-primary underline-offset-4 hover:underline">
          build a brief
        </Link>{" "}
        and let the weights decide.
      </p>
    </div>
  );
}
