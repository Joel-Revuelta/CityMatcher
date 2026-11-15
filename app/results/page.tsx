import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, GitCompareArrows } from "lucide-react";
import { CityRow } from "@/components/city-row";
import { BriefDrawer } from "@/components/brief-drawer";
import { ShareButton } from "@/components/share-button";
import { SortSelect } from "@/components/sort-select";
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

  const editHref = `/?${encodePreferences(prefs)}#wizard`;
  const topPriorities = CRITERIA.filter(
    (criterion) => prefs.weights[criterion.key] >= 2,
  ).slice(0, 4);

  const PAGE_SIZE = 15;
  const requestedPage = Number(params.get("page") ?? "1");
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage =
    Number.isFinite(requestedPage) && requestedPage >= 1
      ? Math.min(totalPages, Math.floor(requestedPage))
      : 1;
  const offset = (currentPage - 1) * PAGE_SIZE;
  const pageResults = results.slice(offset, offset + PAGE_SIZE);

  function pageHref(page: number): string {
    const next = new URLSearchParams(encodePreferences(prefs));
    if (sort !== "match") next.set("sort", sort);
    if (page > 1) next.set("page", String(page));
    return `/results?${next.toString()}`;
  }

  return (
    <div className="mx-auto w-full max-w-[1360px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <div className="flex flex-col justify-between gap-6 border-b border-border pb-7 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <p className="label">Matches</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
            {results.length > 0
              ? `${results.length} ${results.length === 1 ? "city fits" : "cities fit"} your brief.`
              : "No city survives that brief."}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Ranked only by the criteria you weighted. Open a row to see the score
            anatomy, the trade-off and the monthly budget behind it.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ShareButton label="Share brief" />
          <BriefDrawer initial={prefs} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-muted-foreground">
        <span>
          <span className="text-foreground">
            {prefs.budget ? formatEUR(prefs.budget) : "No cap"}
          </span>
          /month
        </span>
        <span>{HOUSEHOLD_LABELS[prefs.household]}</span>
        <span>
          {prefs.regions.length > 0
            ? prefs.regions.map((region) => REGION_LABELS[region]).join(" + ")
            : "All Europe"}
        </span>
        <span>{CLIMATE_LABELS[prefs.climate]}</span>
        {prefs.size !== "any" ? <span>{SIZE_LABELS[prefs.size]}</span> : null}
        <Link href={editHref} className="text-primary underline-offset-4 hover:underline">
          Fine-tune weights
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {topPriorities.map((criterion) => (
          <Badge key={criterion.key} tone="outline">
            {criterion.shortLabel}
          </Badge>
        ))}
      </div>

      {outcome.relaxedBudget ? (
        <div className="mt-6 border-t border-border pt-4 text-sm">
          <p className="font-medium">Your budget is tight for this brief.</p>
          <p className="mt-1 text-muted-foreground">
            A few candidates up to 25% over budget are included and marked so the
            shortlist stays useful. They are capped in the ranking.{" "}
            {prefs.budget ? (
              <Link
                className="text-primary underline-offset-4 hover:underline"
                href={`/results?${(() => {
                  const next = new URLSearchParams(encodePreferences(prefs));
                  next.set("b", String(Math.round(prefs.budget! * 1.25)));
                  return next.toString();
                })()}`}
              >
                Try {formatEUR(Math.round(prefs.budget * 1.25))}
              </Link>
            ) : null}
          </p>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col justify-between gap-3 border-y border-border py-3 sm:flex-row sm:items-center">
        <p className="text-xs text-muted-foreground">
          <span className="font-mono text-foreground">{results.length}</span> cities
          {outcome.filteredOut > 0 ? (
            <>
              , 
              {outcome.filteredOut} excluded by filters
            </>
          ) : null}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <p className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            <GitCompareArrows className="h-3.5 w-3.5" />
            Select 2–4 to compare
          </p>
          <SortSelect
            value={sort}
            options={SORT_OPTIONS}
            preferencesQuery={encodePreferences(prefs)}
          />
        </div>
      </div>

      {results.length > 0 ? (
        <div className="mt-2">
          {pageResults.map((result, index) => (
            <CityRow
              key={result.city.slug}
              result={result}
              prefs={prefs}
              rank={offset + index + 1}
            />
          ))}
        </div>
      ) : (
        <div className="mx-auto mt-10 max-w-xl border border-border p-8">
          <p className="label">No results</p>
          <h2 className="mt-2 text-2xl font-semibold">Try widening one constraint</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Region, climate, size and budget together exclude every city in the
            dataset. Loosen one and the ledger will come back.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/results" className={buttonVariants({ size: "sm" })}>
              Clear filters
            </Link>
            <Link href={editHref} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Edit brief
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {results.length > 0 && totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border py-4">
          <p className="text-xs text-muted-foreground">
            Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, results.length)} of{" "}
            {results.length}
          </p>
          <div className="flex items-center gap-2">
            {currentPage > 1 ? (
              <Link href={pageHref(currentPage - 1)} className={buttonVariants({ variant: "outline", size: "sm" })}>
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </Link>
            ) : (
              <span className="inline-flex h-9 items-center gap-1.5 border border-border px-3.5 text-xs text-muted-foreground opacity-50">
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </span>
            )}
            <span className="font-mono text-xs text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            {currentPage < totalPages ? (
              <Link href={pageHref(currentPage + 1)} className={buttonVariants({ variant: "outline", size: "sm" })}>
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="inline-flex h-9 items-center gap-1.5 border border-border px-3.5 text-xs text-muted-foreground opacity-50">
                Next <ChevronRight className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        </div>
      ) : null}

      <div className="mt-10 border-t border-border pt-4 text-sm text-muted-foreground">
        The score is a weighted average of only the criteria you kept, not a
        universal quality ranking.{" "}
        <Link href="/methodology" className="text-primary underline-offset-4 hover:underline">
          Read the method
        </Link>
        .
      </div>
    </div>
  );
}
