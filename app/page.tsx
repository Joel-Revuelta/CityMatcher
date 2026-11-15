import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Database,
  GitCompareArrows,
  Wallet,
} from "lucide-react";
import { PreferenceWizard } from "@/components/wizard/preference-wizard";
import { MatchBadge } from "@/components/match-badge";
import { MiniClimate } from "@/components/mini-climate";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getAllCities, CITY_COUNT, COUNTRY_COUNT } from "@/lib/data";
import { DEFAULT_PREFS, decodePreferences, encodePreferences } from "@/lib/prefs";
import { rankCities } from "@/lib/scoring";
import { PRESETS } from "@/lib/criteria";
import { formatEUR } from "@/lib/format";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
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

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const record = await searchParams;
  const decoded = decodePreferences(paramsFromRecord(record));
  const isEditing = Object.keys(record).length > 0;
  const initial = {
    ...DEFAULT_PREFS,
    ...decoded,
    budget: decoded.budget ?? DEFAULT_PREFS.budget,
  };
  const preview = rankCities(getAllCities(), initial).results.slice(0, 3);

  return (
    <div>
      <section className="border-b border-border">
        <div className="mx-auto grid w-full max-w-[1360px] gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[1.03fr_0.97fr] lg:items-center lg:gap-16 lg:px-12 lg:py-20">
          <div className="animate-ledger-in">
            <p className="label">Relocation decision engine</p>
            <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-[0.96] tracking-[-0.045em] sm:text-6xl lg:text-[5rem]">
              A city that fits the life you want.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Set your budget, priorities and deal-breakers. We rank real European
              cities with sourced data, a monthly budget and the trade-offs made
              explicit.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-2">
              <Link href="#wizard" className={buttonVariants({ size: "lg" })}>
                Build my brief
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/cities"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Browse cities
              </Link>
            </div>

            <div className="mt-9 grid max-w-lg grid-cols-3 border-t border-border pt-4">
              <div>
                <p className="font-mono text-2xl font-medium">{CITY_COUNT}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">cities</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-medium">{COUNTRY_COUNT}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">countries</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-medium">11</p>
                <p className="mt-0.5 text-xs text-muted-foreground">criteria</p>
              </div>
            </div>
          </div>

          <div className="relative animate-ledger-in" style={{ animationDelay: "120ms" }}>
            <div className="pointer-events-none absolute -inset-4 -z-10 coordinate-grid opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
            <div className="border border-border bg-background">
              <div className="flex items-end justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                  <p className="label">Match ledger</p>
                  <p className="mt-1 text-sm font-medium">
                    {isEditing ? "Your current brief" : "A balanced starting point"}
                  </p>
                </div>
                <Badge tone="outline">
                  {initial.budget ? `${formatEUR(initial.budget)}/mo` : "No cap"}
                </Badge>
              </div>

              <div>
                {preview.map((result, index) => (
                  <div
                    key={result.city.slug}
                    className="grid grid-cols-[1.5rem_minmax(0,1fr)_5.5rem_4.5rem] items-center gap-3 border-b border-border px-5 py-4 last:border-0"
                    style={{ animationDelay: `${180 + index * 60}ms` }}
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{result.city.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {result.city.country}
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <MiniClimate climate={result.city.climate} width={78} height={22} />
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        {result.city.climate.summerHigh}° / {result.city.climate.winterLow}°
                      </p>
                    </div>
                    <div className="justify-self-end">
                      <MatchBadge score={result.score} tier={result.tier} size="sm" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
                <p className="text-xs text-muted-foreground">
                  Costs and salary coverage are in the full ledger.
                </p>
                <Link
                  href="/results"
                  className="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
                >
                  See matches
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="wizard" className="mx-auto w-full max-w-[1360px] scroll-mt-24 px-5 py-12 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr] lg:items-start">
          <PreferenceWizard initial={initial} />

          <aside className="space-y-8 lg:sticky lg:top-24">
            <div>
              <p className="label">How the match works</p>
              <ol className="mt-3 border-t border-border">
                {[
                  {
                    title: "Set the brief",
                    text: "Budget, region, climate and size are hard filters. Deal-breakers stay deal-breakers.",
                  },
                  {
                    title: "Weight what matters",
                    text: "Only the criteria you keep enter the average. No hidden denominator.",
                  },
                  {
                    title: "Read the ledger",
                    text: "Monthly costs, salary coverage and the trade-off are shown before the score.",
                  },
                ].map((item, index) => (
                  <li key={item.title} className="grid grid-cols-[2rem_1fr] gap-3 border-b border-border py-3">
                    <span className="font-mono text-xs text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {item.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border-t border-border pt-4">
              <p className="label">No account, no theatre</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                The shortlist stays in your browser. The ranking is deterministic and
                versioned. AI only reads your words when enabled — it never invents a
                city score.
              </p>
              <Link
                href="/methodology"
                className="mt-3 inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
              >
                Read the methodology
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1360px] px-5 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-border pt-6">
          <div>
            <p className="label">Start somewhere</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              What kind of move are you making?
            </h2>
          </div>
          <Link
            href="/cities"
            className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
          >
            Browse every city
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-6 grid border-t border-border sm:grid-cols-2 lg:grid-cols-5">
          {PRESETS.map((preset) => {
            const prefs = { ...DEFAULT_PREFS, weights: { ...preset.weights } };
            return (
              <Link
                key={preset.id}
                href={`/results?${encodePreferences(prefs)}`}
                className="group border-b border-border py-5 pr-5 transition-colors hover:bg-card sm:border-r sm:last:border-r-0 lg:border-b-0"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{preset.label}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
                </span>
                <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">
                  {preset.description}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1360px] px-5 py-12 sm:px-8 lg:px-12">
        <div className="grid gap-8 border-t border-border pt-6 md:grid-cols-3">
          {[
            {
              icon: Database,
              title: "Sourced, dated and labelled",
              text: "Climate from Open-Meteo, country context from the World Bank, and a transparent cost model with a confidence label.",
            },
            {
              icon: GitCompareArrows,
              title: "Built for the decision",
              text: "A ledger you can scan, a score anatomy you can open, and a comparison matrix for the finalists.",
            },
            {
              icon: Wallet,
              title: "A real monthly budget",
              text: "Rent, living costs, salary coverage and what is left. Not a single opaque cost-of-living index.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title}>
                <Icon className="h-4 w-4 text-primary" />
                <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1360px] px-5 py-12 sm:px-8 lg:px-12">
        <div className="ink-block flex flex-col items-start justify-between gap-8 px-6 py-12 sm:px-10 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="text-xs text-background/60">Your move, with evidence</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Stop guessing between Lisbon and Lyon.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-background/65">
              Build a brief, read the ledger and understand why each city lands
              where it does. Then compare the finalists side by side.
            </p>
          </div>
          <Link href="#wizard" className={buttonVariants({ variant: "accent", size: "lg" })}>
            Build my brief
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
