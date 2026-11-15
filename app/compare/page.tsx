import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GitCompareArrows, Plus, X } from "lucide-react";
import { MatchBadge } from "@/components/match-badge";
import { ShareButton } from "@/components/share-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CLIMATE_LABELS, REGION_LABELS, SIZE_LABELS } from "@/lib/criteria";
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

interface Row {
  label: string;
  value: (result: MatchResult) => string;
  raw?: (result: MatchResult) => number;
  better?: "high" | "low";
}

const rows: Row[] = [
  { label: "Match score", value: (r) => `${Math.round(r.score)}/100`, raw: (r) => r.score, better: "high" },
  { label: "Monthly total", value: (r) => formatEUR(r.totalMonthly), raw: (r) => r.totalMonthly, better: "low" },
  { label: "Rent (1-bed)", value: (r) => formatEUR(r.city.cost.rentOneBed), raw: (r) => r.city.cost.rentOneBed, better: "low" },
  { label: "Living costs", value: (r) => formatEUR(r.city.cost.livingSingle), raw: (r) => r.city.cost.livingSingle, better: "low" },
  { label: "Average net salary", value: (r) => formatEUR(r.city.work.avgNetSalary), raw: (r) => r.city.work.avgNetSalary, better: "high" },
  { label: "Salary covers costs", value: (r) => `${r.city.work.salaryCoverage.toFixed(2)}×`, raw: (r) => r.city.work.salaryCoverage, better: "high" },
  { label: "Left after costs", value: (r) => formatEUR(r.leftover ?? 0), raw: (r) => r.leftover ?? 0, better: "high" },
  { label: "Safety", value: (r) => `${r.city.metrics.safety}/100`, raw: (r) => r.city.metrics.safety, better: "high" },
  { label: "Healthcare", value: (r) => `${r.city.metrics.healthcare}/100`, raw: (r) => r.city.metrics.healthcare, better: "high" },
  { label: "Walkability", value: (r) => `${r.city.metrics.walkability}/100`, raw: (r) => r.city.metrics.walkability, better: "high" },
  { label: "Internet", value: (r) => `${r.city.metrics.internet}/100`, raw: (r) => r.city.metrics.internet, better: "high" },
  { label: "Environment", value: (r) => `${r.city.metrics.environment}/100`, raw: (r) => r.city.metrics.environment, better: "high" },
  { label: "Happiness", value: (r) => `${r.city.metrics.happiness}/100`, raw: (r) => r.city.metrics.happiness, better: "high" },
  { label: "Public services", value: (r) => `${r.city.metrics.publicServices}/100`, raw: (r) => r.city.metrics.publicServices, better: "high" },
  { label: "English-friendly", value: (r) => `${r.city.metrics.english}/100`, raw: (r) => r.city.metrics.english, better: "high" },
  { label: "Summer high", value: (r) => `${r.city.climate.summerHigh}°C` },
  { label: "Winter low", value: (r) => `${r.city.climate.winterLow}°C` },
  { label: "Sun hours / year", value: (r) => formatCompact(r.city.climate.annualSunHours), raw: (r) => r.city.climate.annualSunHours, better: "high" },
  { label: "Population", value: (r) => formatCompact(r.city.population) },
];

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
    const next = [...slugs, slug].slice(0, 4);
    return `/compare?c=${next.join(",")}`;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="eyebrow">Side by side</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            Compare the finalists.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Same brief, same weights, no hidden adjustments. Green cells mark the
            better value in each row.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ShareButton label="Share comparison" />
          <Link
            href="/results"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Plus className="h-3.5 w-3.5" /> Add from matches
          </Link>
        </div>
      </div>

      {results.length >= 2 ? (
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="sticky left-0 z-10 w-44 bg-card px-4 py-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    City
                  </th>
                  {results.map((result) => (
                    <th key={result.city.slug} className="min-w-44 px-4 py-4 align-top">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/city/${result.city.slug}`}
                            className="font-display text-xl font-semibold tracking-tight hover:text-primary"
                          >
                            {result.city.name}
                          </Link>
                          <p className="mt-0.5 text-[0.7rem] font-normal text-muted-foreground">
                            {result.city.country}
                          </p>
                        </div>
                        <Link
                          href={removeHref(result.city.slug)}
                          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
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
                {rows.map((row, rowIndex) => {
                  let best: number | null = null;
                  if (row.raw && row.better) {
                    const values = results.map(row.raw);
                    best = row.better === "high" ? Math.max(...values) : Math.min(...values);
                  }
                  return (
                    <tr
                      key={row.label}
                      className={cn(
                        "border-b border-border/60 last:border-0",
                        rowIndex % 2 === 1 && "bg-muted/20",
                      )}
                    >
                      <th
                        scope="row"
                        className="sticky left-0 z-10 bg-[inherit] px-4 py-3 text-xs font-semibold text-muted-foreground"
                      >
                        {row.label}
                      </th>
                      {results.map((result) => {
                        const value = row.value(result);
                        const isBest =
                          best !== null &&
                          row.raw &&
                          Math.abs(row.raw(result) - best) < 0.001;
                        const isNegative =
                          row.label === "Left after costs" && value.startsWith("-");
                        return (
                          <td
                            key={result.city.slug}
                            className={cn(
                              "px-4 py-3 tabular-nums",
                              isBest && "bg-[color-mix(in_oklch,var(--success)_9%,transparent)] font-semibold text-[var(--success)]",
                              isNegative && !isBest && "font-semibold text-[var(--danger)]",
                            )}
                          >
                            {value}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                <tr className="border-t border-border">
                  <th scope="row" className="sticky left-0 z-10 bg-card px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Climate
                  </th>
                  {results.map((result) => (
                    <td key={result.city.slug} className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {result.city.climate.tags.map((tag) => (
                          <Badge key={tag} tone="outline">
                            {CLIMATE_LABELS[tag]}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="surface mt-8 p-7">
          <div className="mx-auto max-w-lg text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
              <GitCompareArrows className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-2xl font-semibold">
              {results.length === 1 ? "Add one more city" : "Pick two cities to begin"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A comparison is only useful with a rival. Choose from your matches or
              start with one of these.
            </p>
          </div>
          <div className="mx-auto mt-6 grid max-w-2xl gap-2 sm:grid-cols-2">
            {suggestions.map((city) => (
              <Link
                key={city.slug}
                href={addHref(city.slug)}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm transition-colors hover:border-primary/30 hover:bg-primary-soft/30"
              >
                <span>
                  <span className="font-semibold">{city.name}</span>
                  <span className="ml-1.5 text-xs text-muted-foreground">{city.country}</span>
                </span>
                <Plus className="h-4 w-4 text-primary" />
              </Link>
            ))}
          </div>
          {results.length === 1 ? (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              {results[0].city.name} is selected. Choose another above or{" "}
              <Link href="/results" className="font-semibold text-primary hover:underline">
                go back to your matches
              </Link>
              .
            </p>
          ) : null}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
        <p>
          Comparing with the default balanced brief. Personalise it on{" "}
          <Link href="/#wizard" className="font-semibold text-primary hover:underline">
            the wizard
          </Link>{" "}
          and reopen the comparison.
        </p>
        <Link href="/methodology" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
          How scores work <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
