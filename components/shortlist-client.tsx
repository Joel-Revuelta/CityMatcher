"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, GitCompareArrows, Trash2 } from "lucide-react";
import { CityCard } from "@/components/city-card";
import { useSaved } from "@/components/saved-provider";
import { buttonVariants } from "@/components/ui/button";
import { getAllCities } from "@/lib/data";
import { DEFAULT_PREFS } from "@/lib/prefs";
import { scoreCity } from "@/lib/scoring";
import { cn } from "@/lib/utils";

export function ShortlistClient() {
  const { shortlist, mounted, clearShortlist } = useSaved();
  const cities = getAllCities();
  const results = shortlist
    .map((slug) => cities.find((city) => city.slug === slug))
    .filter((city): city is NonNullable<typeof city> => Boolean(city))
    .map((city) => scoreCity(city, DEFAULT_PREFS));

  if (!mounted) {
    return (
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
        {[0, 1, 2].map((item) => (
          <div key={item} className="surface h-80 animate-pulse-soft" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="surface mt-8 mx-auto max-w-xl p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Bookmark className="h-5 w-5" />
        </span>
        <h2 className="mt-4 text-2xl font-semibold">Your shortlist is empty</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Save cities from your matches and they will appear here. The shortlist
          lives in this browser — no account, no email.
        </p>
        <Link href="/results" className={cn(buttonVariants({ size: "sm" }), "mt-5")}>
          Explore cities <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-y border-border py-3">
        <p className="text-sm text-muted-foreground">
          {results.length} saved {results.length === 1 ? "city" : "cities"} · ordered
          by when you saved them
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {results.length >= 2 ? (
            <Link
              href={`/compare?c=${results.slice(0, 4).map((result) => result.city.slug).join(",")}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <GitCompareArrows className="h-3.5 w-3.5" /> Compare first four
            </Link>
          ) : null}
          <button
            type="button"
            onClick={clearShortlist}
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear shortlist
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {results.map((result, index) => (
          <CityCard
            key={result.city.slug}
            result={result}
            prefs={DEFAULT_PREFS}
            rank={index + 1}
          />
        ))}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Match scores here use the balanced default brief. Open a profile to see how
        the city changes with your own priorities.
      </p>
    </div>
  );
}
