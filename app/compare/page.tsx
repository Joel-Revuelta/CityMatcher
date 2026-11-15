import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GitCompareArrows, Plus, X } from "lucide-react";
import { MatchBadge } from "@/components/match-badge";
import { ShareButton } from "@/components/share-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { REGION_LABELS, SIZE_LABELS } from "@/lib/criteria";
import { getAllCities, getCityBySlug } from "@/lib/data";
import { DEFAULT_PREFS, decodePreferences } from "@/lib/prefs";
import { scoreCity } from "@/lib/scoring";
import { formatCompact, formatEUR } from "@/lib/format";
import type { MatchResult, Preferences } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Compare cities",
  description:
    "Compare finalist European cities side by side on match score, monthly costs, salary coverage, safety, healthcare and climate.",
  robots: { index: false, follow: true },
};

type Group = "Money" | "Life" | "Climate" | "Place";

interface Row {
  group: Group;
  label: string;
  value: (result: MatchResult) => string;
  raw?: (result: MatchResult) => number;
  better?: "high" | "low";
}

const rows: Row[] = [
  { group: "Money", label: "Monthly total", value: (r) => formatEUR(r.totalMonthly), raw: (r) => r.totalMonthly, better: "low" },
  { group: "Money", label: "Rent, 1-bed", value: (r) => formatEUR(r.city.cost.rentOneBed), raw: (r) => r.city.cost.rentOneBed, better: "low" },
  { group: "Money", label: "Living costs", value: (r) => formatEUR(r.city.cost.livingSingle), raw: (r) => r.city.cost.livingSingle, better: "low" },
  { group: "Money", label: "Average net salary", value: (r) => formatEUR(r.city.work.avgNetSalary), raw: (r) => r.city.work.avgNetSalary, better: "high" },
  { group: "Money", label: "Salary covers costs", value: (r) => `${r.city.work.salaryCoverage.toFixed(2)}×`, raw: (r) => r.city.work.salaryCoverage, better: "high" },
  { group: "Money", label: "Left after costs", value: (r) => formatEUR(r.leftover ?? 0), raw: (r) => r.leftover ?? 0, better: "high" },
  { group: "Life", label: "Safety", value: (r) => `${r.city.metrics.safety}/100`, raw: (r) => r.city.metrics.safety, better: "high" },
  { group: "Life", label: "Healthcare", value: (r) => `${r.city.metrics.healthcare}/100`, raw: (r) => r.city.metrics.healthcare, better: "high" },
  { group: "Life", label: "Walkability", value: (r) => `${r.city.metrics.walkability}/100`, raw: (r) => r.city.metrics.walkability, better: "high" },
  { group: "Life", label: "Internet", value: (r) => `${r.city.metrics.internet}/100`, raw: (r) => r.city.metrics.internet, better: "high" },
  { group: "Life", label: "Environment", value: (r) => `${r.city.metrics.environment}/100`, raw: (r) => r.city.metrics.environment, better: "high" },
  { group: "Life", label: "Happiness", value: (r) => `${r.city.metrics.happiness}/100`, raw: (r) => r.city.metrics.happiness, better: "high" },
  { group: "Life", label: "Public services", value: (r) => `${r.city.metrics.publicServices}/100`, raw: (r) => r.city.metrics.publicServices, better: "high" },
  { group: "Life", label: "English-friendly", value: (r) => `${r.city.metrics.english}/100`, raw: (r) => r.city.metrics.english, better: "high" },
  { group: "Climate", label: "Summer high", value: (r) => `${r.city.climate.summerHigh}°C` },
  { group: "Climate", label: "Winter low", value: (r) => `${r.city.climate.winterLow}°C` },
  { group: "Climate", label: "Sun hours / year", value: (r) => formatCompact(r.city.climate.annualSunHours), raw: (r) => r.city.climate.annualSunHours, better: "high" },
  { group: "Climate", label: "Rain / year", value: (r) => `${formatCompact(r.city.climate.annualRain)} mm`, raw: (r) => r.city.climate.annualRain, better: "low" },
  { group: "Place", label: "Population", value: (r) => formatCompact(r.city.population) },
  { group: "Place", label: "Region", value: (r) => REGION_LABELS[r.city.region] },
  { group: "Place", label: "City size", value: (r) => SIZE_LABELS[r.city.size] },
];

const GROUPS: Group[] = ["Money", "Life", "Climate", "Place"];

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

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = paramsFromRecord(await searchParams);
  const decoded = decodePreferences(raw);
  const prefs: Preferences = {
    ...DEFAULT_PREFS,
    ...decoded,
    budget: raw.has("b") ? decoded.budget : DEFAULT_PREFS.budget,
  };
  const slugs = [
    ...new Set(
      (raw.get("c") ?? "")
        .split(",")
        .map((slug) => slug.trim())
        .filter(Boolean),
    ),
  ].slice(0, 4);
  const cities = slugs
    .map((slug) => getCityBySlug(slug))
    .filter((city): city is NonNullable<typeof city> => Boolean(city));
  const results = cities.map((city) => scoreCity(city, prefs));
  const suggestions = getAllCities()
    .filter((city) => !slugs.includes(city.slug))
    .slice(0, 8);

  function removeHref(slug: string): string {
    const next = slugs.filter((item) => item !== slug);
    return next.length > 0 ? `/compare?c=${next.join(",")}` : "/compare";
  }

  function addHref(slug: string): string {
    return `/compare?c=${[...slugs, slug].slice(0, 4).join(",")}`;
  }

  

  return (
    <div className="mx-auto w-full max-w-[1360px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-7 lg:flex-row lg:items-end">
        <div>
          <p className="label">Compare</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
            Compare the finalists.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Same brief, same weights, no hidden adjustments. The better value in
            each row is labelled.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ShareButton label="Share comparison" />
          <Link href="/results" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Plus className="h-3.5 w-3.5" /> Add from matches
          </Link>
        </div>
      </div>

      {results.length >= 2 ? (
        <>
          {results.length === 2 ? (
            <MobileCompare results={results} removeHref={removeHref} />
          ) : null}
          {results.length !== 2 ? (
            <p className="mt-4 text-xs text-muted-foreground lg:hidden">
              Swipe horizontally to see every city.
            </p>
          ) : null}
          <div
            className={cn(
              "mt-2 overflow-x-auto",
              results.length === 2 && "hidden lg:block",
            )}
          >
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="sticky left-0 z-20 w-44 bg-background px-3 py-4 text-left">
                  <span className="label">Metric</span>
                </th>
                {results.map((result) => (
                  <th key={result.city.slug} className="min-w-44 px-4 py-4 align-top">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/city/${result.city.slug}`}
                          className="text-xl font-semibold tracking-tight hover:text-primary"
                        >
                          {result.city.name}
                        </Link>
                        <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                          {result.city.country}
                        </p>
                      </div>
                      <Link
                        href={removeHref(result.city.slug)}
                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center border border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                        aria-label={`Remove ${result.city.name}`}
                        title="Remove"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                    <div className="mt-3">
                      <MatchBadge score={result.score} tier={result.tier} size="sm" />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge tone="outline">{REGION_LABELS[result.city.region]}</Badge>
                      <Badge tone="outline">{SIZE_LABELS[result.city.size]}</Badge>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GROUPS.map((group) => (
                <GroupRows
                  key={group}
                  group={group}
                  rows={rows.filter((row) => row.group === group)}
                  results={results}
                />
              ))}
            </tbody>
          </table>
          </div>
        </>
      ) : (
        <div className="mt-8 border border-border p-7">
          <div className="max-w-lg">
            <span className="flex h-11 w-11 items-center justify-center border border-border text-primary">
              <GitCompareArrows className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-2xl font-semibold">
              {results.length === 1 ? "Add one more city" : "Pick two cities to begin"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A comparison needs a rival. Choose from the index or start with one of
              these.
            </p>
          </div>
          <div className="mt-6 grid max-w-2xl gap-0 border-t border-border sm:grid-cols-2">
            {suggestions.map((city) => (
              <Link
                key={city.slug}
                href={addHref(city.slug)}
                className="flex items-center justify-between gap-3 border-b border-border px-1 py-3 text-sm transition-colors hover:bg-card"
              >
                <span>
                  <span className="font-medium">{city.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{city.country}</span>
                </span>
                <Plus className="h-4 w-4 text-primary" />
              </Link>
            ))}
          </div>
          {results.length === 1 ? (
            <p className="mt-4 text-xs text-muted-foreground">
              {results[0].city.name} is selected. Add another above or{" "}
              <Link href="/results" className="text-primary underline-offset-4 hover:underline">
                return to your matches
              </Link>
              .
            </p>
          ) : null}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
        <p>
          Comparing with the balanced brief. Personalise it on{" "}
          <Link href="/#wizard" className="text-primary underline-offset-4 hover:underline">
            the brief sheet
          </Link>{" "}
          and reopen the comparison.
        </p>
        <Link href="/methodology" className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline">
          How scores work <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function GroupRows({
  group,
  rows,
  results,
}: {
  group: Group;
  rows: Row[];
  results: MatchResult[];
}) {
  return (
    <>
      <tr>
        <th
          colSpan={results.length + 1}
          scope="colgroup"
          className="border-y border-border bg-card px-3 py-2 text-left text-xs font-medium text-muted-foreground"
        >
          {group}
        </th>
      </tr>
      {rows.map((row) => {
        let best: number | null = null;
        if (row.raw && row.better) {
          const values = results.map(row.raw);
          best = row.better === "high" ? Math.max(...values) : Math.min(...values);
        }
        return (
          <tr key={row.label} className="border-b border-border/60">
            <th
              scope="row"
              className="sticky left-0 z-10 bg-background px-3 py-2.5 text-left text-xs font-normal text-muted-foreground"
            >
              {row.label}
            </th>
            {results.map((result) => {
              const value = row.value(result);
              const isBest =
                best !== null && row.raw && Math.abs(row.raw(result) - best) < 0.001;
              const isNegative = row.label === "Left after costs" && value.startsWith("-");
              return (
                <td key={result.city.slug} className="px-4 py-2.5 font-mono text-xs tabular-nums">
                  <span
                    className={
                      isBest
                        ? "font-medium text-foreground"
                        : isNegative
                          ? "text-danger"
                          : ""
                    }
                  >
                    {value}
                  </span>
                  {isBest ? (
                    <span className="ml-2 border border-primary/30 bg-primary-soft px-1 py-0.5 text-xs font-medium text-primary">
                      best
                    </span>
                  ) : null}
                </td>
              );
            })}
          </tr>
        );
      })}
    </>
  );
}

function MobileCompare({
  results,
  removeHref,
}: {
  results: MatchResult[];
  removeHref: (slug: string) => string;
}) {
  return (
    <div className="mt-7 lg:hidden">
      <div className="grid grid-cols-[minmax(0,1.1fr)_1fr_1fr] gap-x-3 border-b border-border pb-4">
        <p className="label self-end">Metric</p>
        {results.map((result) => (
          <div key={result.city.slug}>
            <div className="flex items-start justify-between gap-1">
              <p className="text-sm font-semibold">{result.city.name}</p>
              <Link
                href={removeHref(result.city.slug)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${result.city.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">{result.city.country}</p>
            <div className="mt-2">
              <MatchBadge score={result.score} tier={result.tier} size="sm" />
            </div>
          </div>
        ))}
      </div>

      {GROUPS.map((group) => (
        <div key={group}>
          <p className="border-b border-border bg-card py-2 text-xs font-medium text-muted-foreground">
            {group}
          </p>
          {rows
            .filter((row) => row.group === group)
            .map((row) => {
              let best: number | null = null;
              if (row.raw && row.better) {
                const values = results.map(row.raw);
                best = row.better === "high" ? Math.max(...values) : Math.min(...values);
              }
              return (
                <div
                  key={row.label}
                  className="grid grid-cols-[minmax(0,1.1fr)_1fr_1fr] items-start gap-x-3 border-b border-border/60 py-2.5"
                >
                  <p className="text-xs text-muted-foreground">{row.label}</p>
                  {results.map((result) => {
                    const value = row.value(result);
                    const isBest =
                      best !== null && row.raw && Math.abs(row.raw(result) - best) < 0.001;
                    const isNegative = row.label === "Left after costs" && value.startsWith("-");
                    return (
                      <p
                        key={result.city.slug}
                        className={cn(
                          "font-mono text-xs tabular-nums",
                          isBest && "font-medium text-foreground",
                          isNegative && !isBest && "text-danger",
                        )}
                      >
                        {value}
                        {isBest ? <span className="ml-1 text-xs text-primary">best</span> : null}
                      </p>
                    );
                  })}
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
}

