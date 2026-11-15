import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Filter, GitCompareArrows, SlidersHorizontal } from "lucide-react";
import { CityCard } from "@/components/city-card";
import { ShareButton } from "@/components/share-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  CLIMATE_LABELS,
  CRITERIA,
  HOUSEHOLD_LABELS,
  REGION_LABELS,
  SIZE_LABELS,
} from "@/lib/criteria";
import { getAllCities } from "@/lib/data";
import { DEFAULT_PREFS, decodePreferences, encodePreferences } from "@/lib/prefs";
import { rankCities } from "@/lib/scoring";
import type { MatchResult, Preferences } from "@/lib/types";
import { formatEUR } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Your city matches",
  description:
    "Ranked European cities that fit your budget, climate, safety, healthcare and work priorities.",
  robots: { index: false, follow: true },
};

const SORT_OPTIONS = [
  { value: "match", label: "Best match" },
  { value: "cost", label: "Lowest monthly cost" },
  { value: "safety", label: "Safest" },
  { value: "salary", label: "Salary coverage" },
  { value: "climate", label: "Climate fit" },
] as const;

function paramsFromRecord(
  record: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
    else if (value !== undefined) params.set(key, value);
  }
  return params;
}

function climateScoreOf(result: MatchResult): number {
  return result.breakdown.find((item) => item.key === "climate")?.score ?? 0;
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = paramsFromRecord(await searchParams);
  const decoded = decodePreferences(params);
  const prefs: Preferences = {
    ...DEFAULT_PREFS,
    ...decoded,
    budget: params.has("b") ? decoded.budget : DEFAULT_PREFS.budget,
  };
  const outcome = rankCities(getAllCities(), prefs);
  const sortParam = params.get("sort") ?? "match";
  const sort = SORT_OPTIONS.some((option) => option.value === sortParam)
    ? sortParam
    : "match";

  const results = [...outcome.results].sort((a, b) => {
    switch (sort) {
      case "cost":
        return a.totalMonthly - b.totalMonthly;
      case "safety":
        return b.city.metrics.safety - a.city.metrics.safety;
      case "salary":
        return b.city.work.salaryCoverage - a.city.work.salaryCoverage;
      case "climate":
        return climateScoreOf(b) - climateScoreOf(a);
      default:
        return b.score - a.score || a.totalMonthly - b.totalMonthly;
    }
  });

  function sortHref(value: string): string {
    const next = new URLSearchParams(encodePreferences(prefs));
    if (value !== "match") next.set("sort", value);
    return `/results?${next.toString()}`;
  }

  const editHref = `/?${encodePreferences(prefs)}#wizard`;
  const topPriorities = CRITERIA.filter(
    (criterion) => prefs.weights[criterion.key] >= 2,
  ).slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <p className="eyebrow">Your matches · methodology v1.0</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            {results.length > 0
              ? `${results.length} ${results.length === 1 ? "city fits" : "cities fit"} your brief.`
              : "No city survives that brief."}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Ranked by the criteria you weighted, with the trade-off made explicit.
            Every cost is an estimate for your household, in euros per month.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ShareButton label="Share my brief" />
          <Link
            href={editHref}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Edit brief
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-1.5">
        <Badge tone="primary">
          {prefs.budget ? `${formatEUR(prefs.budget)}/month` : "No budget cap"}
        </Badge>
        <Badge tone="outline">{HOUSEHOLD_LABELS[prefs.household]}</Badge>
        {prefs.regions.length > 0 ? (
          prefs.regions.map((region) => (
            <Badge key={region} tone="outline">
              {REGION_LABELS[region]}
            </Badge>
          ))
        ) : (
          <Badge tone="outline">All Europe</Badge>
        )}
        <Badge tone="outline">{CLIMATE_LABELS[prefs.climate]}</Badge>
        {prefs.size !== "any" ? (
          <Badge tone="outline">{SIZE_LABELS[prefs.size]}</Badge>
        ) : null}
        {topPriorities.map((criterion) => (
          <Badge key={criterion.key} tone="primary">
            <Filter className="h-3 w-3" /> {criterion.shortLabel}
          </Badge>
        ))}
      </div>

      {outcome.relaxedBudget ? (
        <div className="mt-6 rounded-2xl border border-[color-mix(in_oklch,var(--warning)_35%,transparent)] bg-[color-mix(in_oklch,var(--warning)_10%,transparent)] px-4 py-3 text-sm">
          <p className="font-semibold">Your budget is tight for this brief.</p>
          <p className="mt-1 text-muted-foreground">
            We kept a few candidates up to 25% over budget so you can see the
            closest options. They are marked and capped in the ranking.
            {prefs.budget ? (
              <>
                {" "}
                <Link
                  className="font-semibold text-primary hover:underline"
                  href={`/results?${(() => {
                    const next = new URLSearchParams(encodePreferences(prefs));
                    next.set("b", String(Math.round(prefs.budget! * 1.25)));
                    return next.toString();
                  })()}`}
                >
                  Try {formatEUR(Math.round(prefs.budget * 1.25))}
                </Link>
              </>
            ) : null}
          </p>
        </div>
      ) : null}

      {outcome.filteredOut > 0 ? (
        <p className="mt-5 text-xs text-muted-foreground">
          {outcome.filteredOut} {outcome.filteredOut === 1 ? "city was" : "cities were"} excluded
          by your region, climate or size filters.
        </p>
      ) : null}

      <div className="mt-8 flex flex-col justify-between gap-3 border-y border-border py-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sort
          </span>
          {SORT_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={sortHref(option.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                sort === option.value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {option.label}
            </Link>
          ))}
        </div>
        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <GitCompareArrows className="h-3.5 w-3.5" />
          Select 2–4 cities to compare
        </p>
      </div>

      {results.length > 0 ? (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((result, index) => (
            <CityCard
              key={result.city.slug}
              result={result}
              prefs={prefs}
              rank={index + 1}
            />
          ))}
        </div>
      ) : (
        <div className="surface mt-8 mx-auto max-w-xl p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Filter className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-2xl font-semibold">Try widening one constraint</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your region, climate, size and budget filters together exclude every
            city in the dataset. Loosen one and the ranking will come back.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link href="/results" className={buttonVariants({ size: "sm" })}>
              Clear filters
            </Link>
            <Link
              href={editHref}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Edit brief <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      <div className="mt-12 rounded-2xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">Reading the score:</span>{" "}
          it is a weighted average of only the criteria you kept, not a universal
          quality ranking. A city can be excellent for one brief and poor for
          another.{" "}
          <Link href="/methodology" className="font-semibold text-primary hover:underline">
            See the formula
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
