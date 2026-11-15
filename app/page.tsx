import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Database,
  Sparkles,
} from "lucide-react";
import { PreferenceWizard } from "@/components/wizard/preference-wizard";
import { MatchBadge } from "@/components/match-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getAllCities, CITY_COUNT, COUNTRY_COUNT } from "@/lib/data";
import { DEFAULT_PREFS, decodePreferences, encodePreferences } from "@/lib/prefs";
import { rankCities } from "@/lib/scoring";
import { PRESETS } from "@/lib/criteria";
import { formatEUR } from "@/lib/format";
import { cn } from "@/lib/utils";

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
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-[0.18]" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 pb-14 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-8 lg:pt-20">
          <div className="animate-fade-up">
            <Badge tone="primary" className="mb-5">
              <Sparkles className="h-3 w-3" /> The relocation decision engine
            </Badge>
            <h1 className="max-w-2xl font-display text-5xl font-semibold leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-[4.6rem]">
              Find where you&apos;d <em className="text-primary">actually thrive</em>.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Tell us what matters — budget, climate, safety, work, walkability —
              and we&apos;ll rank real European cities with sourced data, honest
              trade-offs and a realistic monthly budget.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="#wizard" className={buttonVariants({ size: "lg" })}>
                Build my brief <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/results"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Explore all cities
              </Link>
            </div>

            <dl className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-6">
              <div>
                <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Cities
                </dt>
                <dd className="mt-1 font-display text-2xl font-semibold">{CITY_COUNT}</dd>
              </div>
              <div>
                <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Countries
                </dt>
                <dd className="mt-1 font-display text-2xl font-semibold">{COUNTRY_COUNT}</dd>
              </div>
              <div>
                <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Criteria
                </dt>
                <dd className="mt-1 font-display text-2xl font-semibold">11</dd>
              </div>
            </dl>
          </div>

          <div className="animate-fade-up lg:pl-4" style={{ animationDelay: "120ms" }}>
            <div className="relative">
              <div className="absolute -left-5 top-10 hidden h-24 w-24 rounded-full bg-accent/20 blur-2xl sm:block" />
              <div className="surface-raised relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-border bg-muted/35 px-5 py-4">
                  <div>
                    <p className="eyebrow">Live preview</p>
                    <p className="mt-1 text-sm font-semibold">Your likely matches</p>
                  </div>
                  <Badge tone="outline">{isEditing ? "Your brief" : "Balanced brief"}</Badge>
                </div>
                <div className="divide-y divide-border/70">
                  {preview.map((result, index) => (
                    <div key={result.city.slug} className="flex items-center gap-3 px-5 py-4">
                      <span className="font-display text-sm font-semibold tabular-nums text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold">
                            {result.city.name}
                            <span className="ml-1.5 font-normal text-muted-foreground">
                              {result.city.country}
                            </span>
                          </p>
                          <MatchBadge score={result.score} tier={result.tier} size="sm" />
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${result.score}%` }}
                          />
                        </div>
                        <div className="mt-1.5 flex items-center justify-between text-[0.7rem] text-muted-foreground">
                          <span>{formatEUR(result.totalMonthly)}/month</span>
                          <span>{result.city.work.salaryCoverage.toFixed(2)}× salary coverage</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/25 px-5 py-3">
                  <p className="text-[0.7rem] text-muted-foreground">
                    Based on {initial.budget ? formatEUR(initial.budget) : "no budget cap"}/month
                    {" · "}
                    {isEditing ? "your current brief" : "balanced weights"}
                  </p>
                  <Link
                    href="/results"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Explore <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-3 hidden rotate-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg sm:block">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Data you can check
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold">
                  <Database className="h-3.5 w-3.5 text-primary" />
                  Climate · World Bank · cost model
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
          <PreferenceWizard initial={initial} />

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="surface p-5">
              <p className="eyebrow">How the match works</p>
              <ol className="mt-4 space-y-4">
                {[
                  {
                    title: "You set the brief",
                    text: "Budget, climate, region and weights. Deal-breakers are filters, not hidden penalties.",
                  },
                  {
                    title: "We score the real city",
                    text: "Eleven criteria from sourced data. Only the ones you care about enter the average.",
                  },
                  {
                    title: "You see the trade-off",
                    text: "Monthly costs, salary coverage and the one thing you'd give up — before you fall in love with a city.",
                  },
                ].map((item, index) => {
                  return (
                    <li key={item.title} className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft font-display text-sm font-semibold text-primary">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          {item.text}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2.5 text-xs text-muted-foreground">
                <IconCheck />
                <span>No account. Your shortlist stays in your browser.</span>
              </div>
            </div>

            <div className="surface p-5">
              <p className="eyebrow">Not another listicle</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                The ranking is deterministic and versioned. The AI, when enabled,
                only reads your words — it never invents a score.
              </p>
              <Link
                href="/methodology"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Read the methodology <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Start somewhere</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              What kind of move are you making?
            </h2>
          </div>
          <Link
            href="/results"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Browse every city <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PRESETS.map((preset) => {
            const prefs = { ...DEFAULT_PREFS, weights: { ...preset.weights } };
            return (
              <Link
                key={preset.id}
                href={`/results?${encodePreferences(prefs)}`}
                className="surface group flex flex-col p-5 transition-colors hover:border-primary/35 hover:bg-primary-soft/30"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                </span>
                <p className="mt-3 text-sm font-semibold">{preset.label}</p>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">
                  {preset.description}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  See matches <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Database,
              title: "Sourced, dated, labelled",
              text: "Climate comes from Open-Meteo; country context from the World Bank. Cost data is a transparent model with a date and confidence level.",
            },
            {
              icon: BarChart3,
              title: "Explainable by design",
              text: "Every match shows its strengths, its weakest weighted criterion and the budget maths. No black-box ranking.",
            },
            {
              icon: CheckCircle2,
              title: "Built for the decision",
              text: "Compare finalists, save a shortlist, share the brief with a partner. The app works without an account.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="surface p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-foreground px-7 py-12 text-background sm:px-12">
          <div className="pointer-events-none absolute inset-0 dot-grid opacity-[0.08]" />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-background/60">
                Your move, with evidence
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Stop guessing between Lisbon and Lyon.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-background/70">
                Build a brief, see the ranking and understand exactly why each
                city lands where it does. Then compare the finalists side by side.
              </p>
            </div>
            <Link
              href="#wizard"
              className={cn(buttonVariants({ variant: "accent", size: "lg" }), "shrink-0")}
            >
              Build my brief <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function IconCheck() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
      <CheckCircle2 className="h-3 w-3" />
    </span>
  );
}
