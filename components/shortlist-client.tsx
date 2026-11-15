"use client";

import Link from "next/link";
import { ArrowUpRight, Bookmark, GitCompareArrows, Trash2 } from "lucide-react";
import { useSaved } from "@/components/saved-provider";
import { MatchBadge } from "@/components/match-badge";
import { ShortlistButton } from "@/components/shortlist-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MiniClimate } from "@/components/mini-climate";
import { REGION_LABELS } from "@/lib/criteria";
import type { CityClimate, MatchTier } from "@/lib/types";
import { formatEUR } from "@/lib/format";

export interface ShortlistEntry {
  slug: string;
  name: string;
  country: string;
  score: number;
  tier: MatchTier;
  totalMonthly: number;
  salaryCoverage: number;
  region: string;
  size: string;
  climate: CityClimate;
  overBudget: boolean;
}

export function ShortlistClient({ entries }: { entries: ShortlistEntry[] }) {
  const { shortlist, mounted, clearShortlist } = useSaved();
  const results = shortlist
    .map((slug) => entries.find((entry) => entry.slug === slug))
    .filter((entry): entry is ShortlistEntry => Boolean(entry));

  if (!mounted) {
    return (
      <div className="mt-8 space-y-0 border-t border-border" aria-hidden="true">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-20 animate-pulse border-b border-border bg-card/40" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="mt-8 max-w-xl border border-border p-8">
        <span className="flex h-11 w-11 items-center justify-center border border-border text-primary">
          <Bookmark className="h-5 w-5" />
        </span>
        <h2 className="mt-4 text-2xl font-semibold">No saved cities yet</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Save a city from your matches or the city index. The shortlist lives in
          this browser — no account, no email.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/results" className={buttonVariants({ size: "sm" })}>
            Open matches
          </Link>
          <Link href="/cities" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Browse cities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-y border-border py-3">
        <p className="text-xs text-muted-foreground">
          <span className="font-mono text-foreground">{results.length}</span> saved
          {results.length === 1 ? " city" : " cities"} in save order
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {results.length >= 2 ? (
            <Link
              href={`/compare?c=${results.slice(0, 4).map((entry) => entry.slug).join(",")}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <GitCompareArrows className="h-3.5 w-3.5" /> Compare first four
            </Link>
          ) : null}
          <Button variant="ghost" size="sm" onClick={clearShortlist}>
            <Trash2 className="h-3.5 w-3.5" /> Clear shortlist
          </Button>
        </div>
      </div>

      <div>
        {results.map((entry, index) => (
          <div
            key={entry.slug}
            className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-border py-4 md:grid-cols-[2.5rem_minmax(0,1.5fr)_7rem_6.5rem_8rem_auto] md:gap-5"
          >
            <span className="font-mono text-xs text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <Link
                href={`/city/${entry.slug}`}
                className="text-lg font-semibold tracking-tight hover:text-primary"
              >
                {entry.name}
              </Link>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {entry.country}, {REGION_LABELS[entry.region as keyof typeof REGION_LABELS]}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5 md:hidden">
                <Badge tone="outline">{formatEUR(entry.totalMonthly)}/mo</Badge>
                <Badge tone="outline">{entry.salaryCoverage.toFixed(2)}× salary</Badge>
              </div>
            </div>
            <div className="hidden md:block">
              <MiniClimate climate={entry.climate} />
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {entry.climate.summerHigh}° / {entry.climate.winterLow}°
              </p>
            </div>
            <p className="hidden font-mono text-sm tabular-nums md:block">
              {formatEUR(entry.totalMonthly)}
            </p>
            <div className="justify-self-end md:justify-self-start">
              <MatchBadge score={entry.score} tier={entry.tier} size="sm" />
            </div>
            <div className="col-start-3 flex items-center gap-1 md:col-start-auto">
              <Link
                href={`/city/${entry.slug}`}
                className="inline-flex h-11 w-11 items-center justify-center border border-border hover:border-foreground"
                aria-label={`Open ${entry.name}`}
                title="Open city sheet"
              >
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <ShortlistButton slug={entry.slug} name={entry.name} compact />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Match scores here use the balanced default brief. Open a city sheet to see
        how it changes with your priorities.
      </p>
    </div>
  );
}
