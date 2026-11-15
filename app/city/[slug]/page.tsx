import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  ExternalLink,
  Info,
  Landmark,
  MapPin,
  ShieldCheck,
  Sparkles,
  Sun,
  TriangleAlert,
  Users,
} from "lucide-react";
import { ClimateChart } from "@/components/climate-chart";
import { BudgetPanel } from "@/components/budget-panel";
import { CityActions } from "@/components/city-actions";
import { CriterionIcon } from "@/components/criterion-icon";
import { MatchBadge } from "@/components/match-badge";
import { MetricBar } from "@/components/metric-bar";
import { SourceList } from "@/components/source-list";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  CLIMATE_LABELS,
  CRITERIA,
  HOUSEHOLD_LABELS,
  REGION_LABELS,
  SIZE_LABELS,
} from "@/lib/criteria";
import { getCityBySlug, getCountry, METHODOLOGY_VERSION } from "@/lib/data";
import { DEFAULT_PREFS, decodePreferences, encodePreferences, resultsHref } from "@/lib/prefs";
import { criterionScores, scoreCity, criterionReason } from "@/lib/scoring";
import { formatCompact, formatDecimal, formatEUR, formatNumber } from "@/lib/format";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import type { Preferences } from "@/lib/types";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) return { title: "City not found" };
  const title = `${city.name}: cost of living, climate and match`;
  const description = `${city.editorial.summary} Monthly estimate: €${city.cost.totalSingle.toLocaleString("en-IE")} for one person. Compare safety, healthcare, work and climate for ${city.name}, ${city.country}.`;
  return {
    title,
    description,
    alternates: { canonical: `/city/${city.slug}` },
    openGraph: {
      title: `${title} · ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/city/${city.slug}`,
    },
  };
}

export default async function CityPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();

  const rawParams = paramsFromRecord(await searchParams);
  const hasBrief = rawParams.toString().length > 0;
  const prefs: Preferences = hasBrief
    ? decodePreferences(rawParams)
    : DEFAULT_PREFS;
  const match = scoreCity(city, prefs);
  const scores = criterionScores(city, prefs);
  const country = getCountry(city.countryCode);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: city.name,
    description: city.editorial.summary,
    url: `${SITE_URL}/city/${city.slug}`,
    containedInPlace: {
      "@type": "Country",
      name: city.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: city.lat,
      longitude: city.lng,
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Monthly cost (single)", value: city.cost.totalSingle, unitCode: "EUR" },
      { "@type": "PropertyValue", name: "Safety", value: city.metrics.safety },
      { "@type": "PropertyValue", name: "Healthcare", value: city.metrics.healthcare },
      { "@type": "PropertyValue", name: "Walkability", value: city.metrics.walkability },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link href="/results" className="hover:text-primary">Explore</Link>
        <span>/</span>
        <span className="text-foreground">{city.name}</span>
      </nav>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.55fr_0.85fr] lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone="primary">
              <MapPin className="h-3 w-3" /> {city.country}
            </Badge>
            <Badge tone="outline">{REGION_LABELS[city.region]}</Badge>
            <Badge tone="outline">{SIZE_LABELS[city.size]}</Badge>
            <Badge tone="outline">{formatCompact(city.population)} residents</Badge>
            {city.climate.tags.map((tag) => (
              <Badge key={tag} tone="outline">
                <Sun className="h-3 w-3" /> {CLIMATE_LABELS[tag]}
              </Badge>
            ))}
          </div>

          <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
            {city.name}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {city.editorial.summary}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <MatchBadge score={match.score} tier={match.tier} size="lg" />
            <div>
              <p className="text-sm font-semibold">
                {hasBrief ? "Match for your brief" : "Match for a balanced brief"}
              </p>
              <p className="text-xs text-muted-foreground">
                {hasBrief ? "Based on your budget and weights" : "Based on balanced weights and a €2,500 budget"}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <CityActions slug={city.slug} name={city.name} />
            <Link
              href={hasBrief ? `/?${encodePreferences(prefs)}#wizard` : "/#wizard"}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <Sparkles className="h-3 w-3" /> Personalise this score
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Monthly total",
                value: formatEUR(match.totalMonthly),
                note: `${HOUSEHOLD_LABELS[prefs.household]} estimate`,
              },
              {
                label: "Local salary",
                value: formatEUR(city.work.avgNetSalary),
                note: `${city.work.salaryCoverage.toFixed(2)}× costs`,
              },
              {
                label: "Best for",
                value: city.editorial.bestFor,
                note: "Editorial view",
              },
            ].map((item) => (
              <div key={item.label} className="surface p-4">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  {item.label}
                </p>
                <p
                  className={`mt-1 font-display font-semibold leading-tight ${
                    item.label === "Best for" ? "text-sm" : "text-xl"
                  }`}
                >
                  {item.value}
                </p>
                <p className="mt-1 text-[0.7rem] leading-snug text-muted-foreground">
                  {item.note}
                </p>
              </div>
            ))}
          </div>

          <section className="mt-10">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="eyebrow">The verdict</p>
                <h2 className="mt-1 text-2xl font-semibold">Why it lands here</h2>
              </div>
              <Badge tone="outline">
                {formatDecimal(match.score)} / 100
              </Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {match.strengths.map((strength) => (
                <div key={strength.key} className="surface p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-primary">
                      <CriterionIcon name={CRITERIA.find((c) => c.key === strength.key)?.icon ?? "Circle"} className="h-4 w-4" />
                    </span>
                    <p className="text-sm font-semibold">{strength.label}</p>
                    <span className="ml-auto text-sm font-bold tabular-nums">{Math.round(strength.score)}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {criterionReason(
                      strength.key,
                      city,
                      strength.score,
                      prefs,
                      match.totalMonthly,
                    )}
                  </p>
                </div>
              ))}
              {match.tradeoff ? (
                <div className="surface border-[color-mix(in_oklch,var(--warning)_32%,transparent)] p-4 sm:col-span-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--warning)_16%,transparent)] text-[color-mix(in_oklch,var(--warning)_75%,var(--foreground))]">
                      <TriangleAlert className="h-4 w-4" />
                    </span>
                    <p className="text-sm font-semibold">The trade-off: {match.tradeoff.label}</p>
                    <span className="ml-auto text-sm font-bold tabular-nums">{Math.round(match.tradeoff.score)}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    This is the weakest weighted criterion for your brief. If it is
                    a deal-breaker, raise its weight or compare it directly with
                    another city before committing.
                  </p>
                </div>
              ) : null}
            </div>
          </section>

          <section className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="eyebrow">Climate</p>
                <h2 className="mt-1 text-2xl font-semibold">What the year feels like</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Open-Meteo · 2019–2024 normals
              </p>
            </div>
            <div className="surface mt-4 p-4 sm:p-6">
              <ClimateChart climate={city.climate} />
            </div>
          </section>

          <section className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="eyebrow">Livability</p>
                <h2 className="mt-1 text-2xl font-semibold">The eleven signals</h2>
              </div>
              <p className="max-w-xs text-right text-xs text-muted-foreground">
                Scores are 0–100. Climate and affordability react to your brief.
              </p>
            </div>
            <div className="surface mt-4 grid gap-x-8 gap-y-5 p-5 sm:grid-cols-2 sm:p-6">
              {CRITERIA.map((criterion) => (
                <MetricBar
                  key={criterion.key}
                  label={criterion.label}
                  score={scores[criterion.key]}
                  icon={<CriterionIcon name={criterion.icon} className="h-3.5 w-3.5" />}
                  compact
                />
              ))}
            </div>
            <p className="mt-2 text-[0.7rem] text-muted-foreground">
              Affordability uses {prefs.budget ? `your ${formatEUR(prefs.budget)} budget` : "the city cost index (no budget set)"};
              climate uses your {CLIMATE_LABELS[prefs.climate].toLowerCase()} preference.
              Safety, healthcare, walkability, environment, happiness, services and
              English are modelled city composites; internet is derived from World
              Bank country data.
            </p>
          </section>

          <section className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="eyebrow">Work</p>
                <h2 className="mt-1 text-2xl font-semibold">Salary and local depth</h2>
              </div>
              <Badge tone="outline">Modelled · medium confidence</Badge>
            </div>
            <div className="surface mt-4 p-5 sm:p-6">
              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Average net salary
                  </p>
                  <p className="mt-1 font-display text-2xl font-semibold">{formatEUR(city.work.avgNetSalary)}</p>
                  <p className="mt-1 text-[0.7rem] text-muted-foreground">per month, single person</p>
                </div>
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Covers local costs
                  </p>
                  <p className="mt-1 font-display text-2xl font-semibold">{city.work.salaryCoverage.toFixed(2)}×</p>
                  <p className="mt-1 text-[0.7rem] text-muted-foreground">salary ÷ monthly total</p>
                </div>
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Strong sectors
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {city.work.topSectors.map((sector) => (
                      <Badge key={sector} tone="outline">
                        <Briefcase className="h-3 w-3" /> {sector}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              {prefs.job ? (
                <p className="mt-5 rounded-xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                  You said you work as <span className="font-semibold text-foreground">{prefs.job}</span>.
                  CityMatcher does not have verified occupation-level salaries in v1;
                  treat the average above as context, not an offer.
                </p>
              ) : null}
            </div>
          </section>

          {country ? (
            <section className="mt-10">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="eyebrow">Country context</p>
                  <h2 className="mt-1 text-2xl font-semibold">{country.name} at a glance</h2>
                </div>
                <a
                  href="https://data.worldbank.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  World Bank · {country.asOf} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: "Internet users", value: country.internetUsers ? `${country.internetUsers.toFixed(1)}%` : "—" },
                  { label: "Life expectancy", value: country.lifeExpectancy ? `${country.lifeExpectancy.toFixed(1)} yrs` : "—" },
                  { label: "Health spend / capita", value: country.healthSpendPc ? `$${formatCompact(country.healthSpendPc)}` : "—" },
                  { label: "PM2.5 exposure", value: country.pm25 ? `${country.pm25.toFixed(1)} µg/m³` : "—" },
                  { label: "GDP per capita (PPP)", value: country.gdpPpp ? `$${formatCompact(country.gdpPpp)}` : "—" },
                  { label: "Unemployment", value: country.unemployment ? `${country.unemployment.toFixed(1)}%` : "—" },
                ].map((item) => (
                  <div key={item.label} className="surface p-4">
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.11em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 text-lg font-semibold tabular-nums">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-10">
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="eyebrow">Provenance</p>
                <h2 className="mt-1 text-2xl font-semibold">Where these numbers come from</h2>
              </div>
              <Link href="/sources" className="text-xs font-semibold text-primary hover:underline">
                All sources
              </Link>
            </div>
            <div className="surface mt-4 p-5 sm:p-6">
              <SourceList sources={city.sources} />
              <p className="mt-4 border-t border-border pt-3 text-[0.7rem] leading-relaxed text-muted-foreground">
                Methodology v{METHODOLOGY_VERSION}. Climate is real reanalysis data;
                cost and salary figures are modelled estimates for a single person,
                not official statistics. Always verify rent and pay locally.
              </p>
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <BudgetPanel city={city} prefs={prefs} />

          <div className="surface p-5">
            <p className="eyebrow">At a glance</p>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-muted-foreground"><Users className="h-3.5 w-3.5" /> Population</dt>
                <dd className="font-semibold tabular-nums">{formatNumber(city.population)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-muted-foreground"><Landmark className="h-3.5 w-3.5" /> Region</dt>
                <dd className="font-semibold">{REGION_LABELS[city.region]}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-muted-foreground"><Sun className="h-3.5 w-3.5" /> Summer high</dt>
                <dd className="font-semibold">{city.climate.summerHigh}°C</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-muted-foreground"><Sun className="h-3.5 w-3.5" /> Winter low</dt>
                <dd className="font-semibold">{city.climate.winterLow}°C</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5" /> Confidence</dt>
                <dd className="font-semibold capitalize">{city.confidence}</dd>
              </div>
            </dl>
          </div>

          <div className="surface p-5">
            <p className="eyebrow">Make it a decision</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Line this city up against another finalist. The comparison uses the
              same brief and highlights where each one wins.
            </p>
            <Link
              href={`/compare?c=${city.slug}`}
              className={buttonVariants({ variant: "outline", size: "sm", className: "mt-3 w-full" })}
            >
              Compare this city <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href={resultsHref(prefs)}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="h-3 w-3" /> Back to all matches
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-muted/30 p-4 text-[0.7rem] leading-relaxed text-muted-foreground">
            <p className="flex items-start gap-2">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Moving abroad? Visa, tax and residence rules depend on your
                nationality and are out of scope for this score. Check official
                government sources before you commit.
              </span>
            </p>
          </div>
        </aside>
      </div>

      <div className="mt-16 flex justify-center">
        <Link href="/results" className={buttonVariants({ variant: "outline" })}>
          <ArrowLeft className="h-4 w-4" /> Back to your matches
        </Link>
      </div>
    </div>
  );
}
