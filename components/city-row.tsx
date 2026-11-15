import Link from "next/link";
import {
  ArrowUpRight,
  ChevronDown,
  TriangleAlert,
} from "lucide-react";
import type { MatchResult, Preferences } from "@/lib/types";
import { CLIMATE_LABELS, REGION_LABELS } from "@/lib/criteria";
import { formatEUR, formatPercent } from "@/lib/format";
import { cityHref } from "@/lib/prefs";
import { MatchBadge } from "./match-badge";
import { MiniClimate } from "./mini-climate";
import { ShortlistButton } from "./shortlist-button";
import { CompareButton } from "./compare-button";
import { Badge } from "./ui/badge";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

export function CityRow({
  result,
  prefs,
  rank,
}: {
  result: MatchResult;
  prefs: Preferences;
  rank: number;
}) {
  const { city } = result;
  const climateLabel = city.climate.tags
    .map((tag) => CLIMATE_LABELS[tag])
    .slice(0, 1)
    .join("");

  return (
    <details className="group border-b border-border first:border-t">
      <summary className="grid cursor-pointer list-none grid-cols-[2rem_minmax(0,1fr)_auto_1.25rem] items-center gap-x-3 gap-y-2 py-4 transition-colors hover:bg-card md:grid-cols-[2.5rem_minmax(0,1.7fr)_7rem_6.5rem_6.5rem_8rem_1.25rem] md:gap-x-5 md:py-3.5 [&::-webkit-details-marker]:hidden">
        <span className="font-mono text-xs text-muted-foreground md:text-sm">
          {String(rank).padStart(2, "0")}
        </span>

        <div className="min-w-0">
          <p className="truncate text-base font-semibold md:text-lg">{city.name}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {city.country}
            <span className="md:hidden">
              {", "}
              {formatEUR(result.totalMonthly)}/mo,{" "}
              {city.work.salaryCoverage.toFixed(2)}× salary
            </span>
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 md:hidden">
            <Badge tone="outline">{climateLabel}</Badge>
            {result.overBudget ? (
              <Badge tone="warning">
                <TriangleAlert className="h-3 w-3" /> {formatPercent(result.overBudgetPct)} over
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="hidden md:block">
          <MiniClimate climate={city.climate} />
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {city.climate.summerHigh}° / {city.climate.winterLow}°
          </p>
        </div>

        <div className="hidden md:block">
          <p className="font-mono text-sm tabular-nums">{formatEUR(result.totalMonthly)}</p>
          <p className="text-xs text-muted-foreground">per month</p>
        </div>

        <div className="hidden md:block">
          <p className="font-mono text-sm tabular-nums">{city.work.salaryCoverage.toFixed(2)}×</p>
          <p className="text-xs text-muted-foreground">salary cover</p>
        </div>

        <div className="justify-self-end md:justify-self-start">
          <MatchBadge score={result.score} tier={result.tier} size="sm" />
        </div>

        <ChevronDown className="h-4 w-4 justify-self-end text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>

      <div className="pb-6 pl-8 pr-1 md:grid md:grid-cols-[1.1fr_1fr] md:gap-x-10 md:pl-12">
        <div>
          <p className="label">Why this rank</p>
          <ul className="mt-3 space-y-2.5">
            {result.reasons.map((reason) => (
              <li key={reason} className="flex gap-2.5 text-sm leading-relaxed">
                <span className="mt-2 h-1 w-1 shrink-0 bg-primary" aria-hidden="true" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
          {result.tradeoff ? (
            <p className="mt-4 border-t border-border/70 pt-3 text-sm leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">Trade-off: </span>
              {result.tradeoff.label} scores {Math.round(result.tradeoff.score)}/100 for this
              brief.
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link
              href={cityHref(city.slug, prefs)}
              className={cn(buttonVariants({ size: "sm" }))}
            >
              View city sheet
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <ShortlistButton slug={city.slug} name={city.name} />
            <CompareButton slug={city.slug} name={city.name} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {REGION_LABELS[city.region]}, {city.size} city, confidence {city.confidence}
          </p>
        </div>

        <div>
          <p className="label">Score anatomy</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
            {result.breakdown
              .filter((item) => item.weight > 0)
              .sort((a, b) => b.weight - a.weight)
              .slice(0, 5)
              .map((item) => (
                <span key={item.key} className="text-xs text-muted-foreground">
                  {item.label}{" "}
                  <span className="font-mono text-foreground">{Math.round(item.score)}</span>
                </span>
              ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            The full 11-signal breakdown is in the city sheet.
          </p>
        </div>
      </div>
    </details>
  );
}
