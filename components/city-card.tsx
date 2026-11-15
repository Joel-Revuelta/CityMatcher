import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Info,
  MapPin,
  Sun,
  TriangleAlert,
} from "lucide-react";
import type { MatchResult, Preferences } from "@/lib/types";
import { CLIMATE_LABELS, REGION_LABELS } from "@/lib/criteria";
import { formatEUR, formatPercent } from "@/lib/format";
import { cityHref } from "@/lib/prefs";
import { MatchBadge } from "./match-badge";
import { ShortlistButton } from "./shortlist-button";
import { CompareButton } from "./compare-button";
import { Badge } from "./ui/badge";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

export function CityCard({
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
    <article
      className="surface-raised group flex h-full flex-col overflow-hidden p-5 transition-shadow duration-300 hover:shadow-xl sm:p-6"
      style={{ animationDelay: `${Math.min(rank, 10) * 45}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-1 font-display text-sm font-semibold tabular-nums text-muted-foreground">
            {String(rank).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <Link
              href={cityHref(city.slug, prefs)}
              className="group/link inline-flex items-start gap-1"
            >
              <h3 className="truncate font-display text-2xl font-semibold leading-tight tracking-tight group-hover/link:text-primary">
                {city.name}
              </h3>
              <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/link:opacity-100" />
            </Link>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {city.country} · {REGION_LABELS[city.region]}
            </p>
          </div>
        </div>
        <MatchBadge score={result.score} tier={result.tier} size="sm" className="shrink-0" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge tone="primary">
          <Sun className="h-3 w-3" /> {climateLabel}
        </Badge>
        <Badge tone="outline">
          {city.climate.summerHigh}° / {city.climate.winterLow}°
        </Badge>
        <Badge tone="outline">{city.size} city</Badge>
        {result.overBudget ? (
          <Badge tone="warning">
            <TriangleAlert className="h-3 w-3" /> {formatPercent(result.overBudgetPct)} over budget
          </Badge>
        ) : null}
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {city.editorial.summary}
      </p>

      <ul className="mt-4 space-y-2">
        {result.reasons.slice(0, 3).map((reason) => (
          <li key={reason} className="flex items-start gap-2 text-[0.82rem] leading-snug">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--success)]" />
            <span>{reason}</span>
          </li>
        ))}
      </ul>

      {result.tradeoff ? (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-muted/70 px-3 py-2 text-[0.8rem] leading-snug text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            <span className="font-semibold text-foreground">Trade-off:</span>{" "}
            {result.tradeoff.label.toLowerCase()} scores {Math.round(result.tradeoff.score)}/100.
          </span>
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-border/70 bg-background/40 p-3">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
            Monthly
          </p>
          <p className="mt-0.5 text-sm font-bold tabular-nums">{formatEUR(result.totalMonthly)}</p>
        </div>
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
            Rent 1BR
          </p>
          <p className="mt-0.5 text-sm font-bold tabular-nums">{formatEUR(city.cost.rentOneBed)}</p>
        </div>
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
            Salary covers
          </p>
          <p className="mt-0.5 text-sm font-bold tabular-nums">{city.work.salaryCoverage.toFixed(2)}×</p>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-1.5 pt-4">
        <Link
          href={cityHref(city.slug, prefs)}
          className={cn(buttonVariants({ size: "sm" }), "flex-1")}
        >
          View profile
        </Link>
        <CompareButton slug={city.slug} name={city.name} compact />
        <ShortlistButton slug={city.slug} name={city.name} compact />
      </div>
    </article>
  );
}
