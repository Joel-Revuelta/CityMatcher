import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, Database, Scale, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getAllCities, METHODOLOGY_VERSION } from "@/lib/data";
import { DEFAULT_PREFS } from "@/lib/prefs";
import { rankCities, SCORING_VERSION } from "@/lib/scoring";
import { CRITERIA, DEFAULT_WEIGHTS, WEIGHT_LABELS } from "@/lib/criteria";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How CityMatcher scores cities: criteria, weights, normalisation, hard filters, missing data and the limits of the model.",
  alternates: { canonical: "/methodology" },
};

export default function MethodologyPage() {
  const example = rankCities(getAllCities(), DEFAULT_PREFS).results.slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <p className="eyebrow">Methodology v{METHODOLOGY_VERSION}</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
        How the match is calculated.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
        CityMatcher is a decision aid, not an oracle. The score is deterministic,
        versioned and built only from the criteria you choose. This page explains
        exactly what enters it — and what does not.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { icon: Calculator, title: "Deterministic", text: "Same brief, same ranking." },
          { icon: Scale, title: "Weighted, not universal", text: "Only your chosen criteria count." },
          { icon: ShieldCheck, title: "Versioned", text: `Scoring v${SCORING_VERSION}, methodology v${METHODOLOGY_VERSION}.` },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="surface p-4">
              <Icon className="h-4 w-4 text-primary" />
              <p className="mt-2 text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          );
        })}
      </div>

      <div className="prose-cm mt-10">
        <h2>1. Start with filters</h2>
        <p>
          Region, climate band and city size are hard filters. If you set a monthly
          budget, a city whose estimated household total is above it is excluded.
          If strict filtering leaves fewer than five cities, we include candidates
          up to 25% over budget, mark them clearly and cap their score at 74. This
          keeps a tight brief useful without pretending an over-budget city is a
          perfect match.
        </p>

        <h2>2. Score each criterion from 0 to 100</h2>
        <p>
          Direct metrics (safety, healthcare, walkability, internet, environment,
          happiness, public services, English) use their 0–100 composite values.
          Three criteria are calculated from your brief:
        </p>
        <ul>
          <li>
            <strong>Affordability:</strong> with a budget,{" "}
            <code>100 − 30 × (monthly total ÷ budget)</code>, clamped to 0–100.
            Without a budget, the inverse of the cost index is used.
          </li>
          <li>
            <strong>Climate:</strong> a perfect 100 when the city matches your
            chosen band; otherwise a distance penalty based on summer highs and
            winter lows. “Any climate” uses a comfort curve around 26°C summer
            highs and 8°C winter lows.
          </li>
          <li>
            <strong>Work & salary:</strong>{" "}
            <code>100 × (average net salary ÷ monthly costs) ÷ 2</code>, clamped.
            A city where the local salary covers costs twice over scores 100.
          </li>
        </ul>
        <p>
          Household costs scale the single-person estimate: a couple uses 1.3× rent
          and 1.7× living costs; a family uses 1.9× rent and 2.5× living costs.
          These are planning assumptions, not quotes.
        </p>

        <h2>3. Weighted average — only for criteria you keep</h2>
        <p>
          Each criterion gets a weight from 0 to 3. Criteria at 0 are removed from
          both the numerator and the denominator. There is no hidden baseline and
          no universal “best city” bonus.
        </p>
        <div className="not-prose overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-semibold">Criterion</th>
                <th className="px-4 py-3 font-semibold">Default weight</th>
                <th className="px-4 py-3 font-semibold">Meaning</th>
              </tr>
            </thead>
            <tbody>
              {CRITERIA.map((criterion) => (
                <tr key={criterion.key} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 font-medium">{criterion.label}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {DEFAULT_WEIGHTS[criterion.key]} / 3
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {criterion.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="not-prose mt-3 flex flex-wrap gap-1.5">
          {WEIGHT_LABELS.map((weight) => (
            <Badge key={weight.value} tone="outline">
              {weight.value} = {weight.label}
            </Badge>
          ))}
        </div>

        <h2>4. Tiers, not false precision</h2>
        <p>
          Scores are rounded for display and grouped into tiers: Excellent (80+),
          Strong (65–79), Fair (50–64) and Stretch (below 50). Use the tier to
          compare; do not treat a two-point difference as decisive.
        </p>

        <h2>5. What the score ignores</h2>
        <p>
          Visas, tax residence, language requirements, schools, proximity to
          family, partner employment and housing availability are not in the
          score. Those are personal and often decisive. The city profile gives you
          country context and a monthly budget, but it is not immigration or
          financial advice.
        </p>

        <h2>6. Data quality and missingness</h2>
        <p>
          Climate is computed from Open-Meteo ERA5 reanalysis (2019–2024). Country
          context comes from the World Bank. Cost, salary and several livability
          metrics are a curated model with a date and a confidence label. When a
          value is modelled, the interface says so. We do not fill gaps with
          LLM-generated numbers, and a missing metric is never invented.
        </p>

        <h2>Worked example: the default brief</h2>
        <p>
          The default brief uses a €2,500 monthly budget, balanced weights and a
          single-person household. With those inputs, the current top three are:
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {example.map((result) => (
          <Link
            key={result.city.slug}
            href={`/city/${result.city.slug}`}
            className="surface group p-4 transition-colors hover:border-primary/35"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-display text-lg font-semibold">{result.city.name}</p>
              <Badge tone="primary">{Math.round(result.score)}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {result.city.country} · {result.tier}
            </p>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {result.reasons[0]}
            </p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
              Open profile <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-muted/30 p-5">
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <Database className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>
            Want to inspect the inputs? The{" "}
            <Link href="/sources" className="font-semibold text-primary hover:underline">
              data sources page
            </Link>{" "}
            lists every source, licence and freshness date, plus the coverage table
            for all cities.
          </span>
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/#wizard" className={buttonVariants()}>
          Build your own brief <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/results" className={buttonVariants({ variant: "outline" })}>
          See the default ranking
        </Link>
      </div>
    </div>
  );
}
