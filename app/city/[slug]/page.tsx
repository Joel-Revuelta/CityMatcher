import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  ExternalLink,
  Info,
  MapPin,
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
import { criterionReason, criterionScores, scoreCity } from "@/lib/scoring";
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
  const briefKeys = ["b", "r", "c", "s", "w", "i", "j", "hh"];
  const hasBrief = briefKeys.some((key) => rawParams.has(key));
  const prefs: Preferences = hasBrief ? decodePreferences(rawParams) : DEFAULT_PREFS;
  const match = scoreCity(city, prefs);
  const scores = criterionScores(city, prefs);
  const leftover = match.leftover ?? 0;
  const country = getCountry(city.countryCode);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: city.name,
    description: city.editorial.summary,
    url: `${SITE_URL}/city/${city.slug}`,
    containedInPlace: { "@type": "Country", name: city.country },
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
    <div className="mx-auto w-full max-w-[1360px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link href="/cities" className="hover:text-primary">Cities</Link>
        <span>/</span>
        <span className="text-foreground">{city.name}</span>
      </nav>

      <header className="mt-8 border-b border-border pb-8">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="primary">
                <MapPin className="h-3 w-3" /> {city.country}
              </Badge>
              <Badge tone="outline">{REGION_LABELS[city.region]}</Badge>
              <Badge tone="outline">{SIZE_LABELS[city.size]}</Badge>
              <Badge tone="outline">
                <Users className="h-3 w-3" /> {formatCompact(city.population)}
              </Badge>
              {city.climate.tags.map((tag) => (
                <Badge key={tag} tone="outline">
                  <Sun className="h-3 w-3" /> {CLIMATE_LABELS[tag]}
                </Badge>
              ))}
            </div>

            <h1 className="mt-5 text-5xl font-semibold tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              {city.name}
            </h1>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              {city.lat.toFixed(4)}° N / {city.lng.toFixed(4)}° E
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {city.editorial.summary}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <CityActions slug={city.slug} name={city.name} />
              <Link
                href={hasBrief ? `/?${encodePreferences(prefs)}#wizard` : "/#wizard"}
                className="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
              >
                <Sparkles className="h-3 w-3" /> Personalise this score
              </Link>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end lg:text-right">
            <MatchBadge score={match.score} tier={match.tier} size="lg" />
            <p className="text-sm font-medium">
              {hasBrief ? "Match for your brief" : "Match for a balanced brief"}
            </p>
            <p className="max-w-[15rem] text-xs text-muted-foreground">
              {hasBrief
                ? "Based on your budget, filters and weights"
                : "Balanced weights and a €2,500 monthly budget"}
            </p>
          </div>
        </div>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.55fr_0.8fr] lg:items-start lg:gap-14">
        <div>
          <div className="grid gap-4 border-b border-border pb-6 sm:grid-cols-3">
            {[
              {
                label: "Monthly total",
                value: formatEUR(match.totalMonthly),
                note: `${HOUSEHOLD_LABELS[prefs.household]}, ${
                  leftover >= 0 ? "left" : "short"
                } ${formatEUR(Math.abs(leftover))}`,
              },
              {
                label: "Local net salary",
                value: formatEUR(city.work.avgNetSalary),
                note: `${city.work.salaryCoverage.toFixed(2)}× costs`,
              },
              {
                label: "Best for",
                value: city.editorial.bestFor,
                note: "Editorial view",
              },
            ].map((item) => (
              <div key={item.label} className="border-t border-border pt-3">
                <p className="label">{item.label}</p>
                <p
                  className={`mt-1.5 font-semibold leading-tight ${
                    item.label === "Best for" ? "text-sm" : "font-mono text-xl"
                  }`}
                >
                  {item.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
              </div>
            ))}
          </div>

          <section className="mt-9 border-t border-border pt-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-2xl font-semibold">Why this rank</h2>
              <span className="font-mono text-xs text-muted-foreground">
                {formatDecimal(match.score)} / 100
              </span>
            </div>
            <div className="mt-4 grid gap-x-8 sm:grid-cols-2">
              {match.strengths.map((strength) => (
                <div key={strength.key} className="border-t border-border py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <CriterionIcon
                        name={CRITERIA.find((c) => c.key === strength.key)?.icon ?? "Circle"}
                        className="h-3.5 w-3.5 text-muted-foreground"
                      />
                      {strength.label}
                    </span>
                    <span className="font-mono text-sm">{Math.round(strength.score)}</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {criterionReason(strength.key, city, strength.score, prefs, match.totalMonthly)}
                  </p>
                </div>
              ))}
              {match.tradeoff ? (
                <div className="border-t border-border py-3 sm:col-span-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <TriangleAlert className="h-3.5 w-3.5 text-warning" />
                      Trade-off: {match.tradeoff.label}
                    </span>
                    <span className="font-mono text-sm">{Math.round(match.tradeoff.score)}</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    The weakest weighted criterion for your brief. If it is a
                    deal-breaker, raise its weight or compare this city directly
                    with a finalist before committing.
                  </p>
                </div>
              ) : null}
            </div>
          </section>

          <section className="mt-9 border-t border-border pt-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-2xl font-semibold">The year, month by month</h2>
              <span className="font-mono text-xs text-muted-foreground">
                Open-Meteo / 2019–2024
              </span>
            </div>
            <div className="mt-4 border border-border p-4 sm:p-5">
              <ClimateChart climate={city.climate} />
            </div>
          </section>

          <section className="mt-9 border-t border-border pt-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-2xl font-semibold">The eleven signals</h2>
              <p className="max-w-xs text-right text-xs text-muted-foreground">
                Scores are 0–100. Climate and affordability react to your brief.
              </p>
            </div>
            <div className="mt-3 grid gap-x-10 sm:grid-cols-2">
              {CRITERIA.map((criterion) => (
                <MetricBar
                  key={criterion.key}
                  label={criterion.label}
                  score={scores[criterion.key]}
                  icon={<CriterionIcon name={criterion.icon} className="h-3.5 w-3.5" />}
                />
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Affordability uses{" "}
              {prefs.budget
                ? `your ${formatEUR(prefs.budget)} budget`
                : "the city cost index (no budget set)"}
              ; climate uses your {CLIMATE_LABELS[prefs.climate].toLowerCase()} preference.
              Safety, healthcare, walkability, environment, happiness, services and
              English are modelled city composites; internet is derived from World
              Bank country data.
            </p>
          </section>

          <section className="mt-9 border-t border-border pt-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-2xl font-semibold">Work and local depth</h2>
              <Badge tone="outline">Modelled / medium confidence</Badge>
            </div>
            <div className="mt-4 grid gap-5 border-t border-border pt-4 sm:grid-cols-3">
              <div>
                <p className="label">Average net salary</p>
                <p className="mt-1 font-mono text-xl">{formatEUR(city.work.avgNetSalary)}</p>
                <p className="mt-1 text-xs text-muted-foreground">per month, single person</p>
              </div>
              <div>
                <p className="label">Covers local costs</p>
                <p className="mt-1 font-mono text-xl">{city.work.salaryCoverage.toFixed(2)}×</p>
                <p className="mt-1 text-xs text-muted-foreground">salary ÷ monthly total</p>
              </div>
              <div>
                <p className="label">Strong sectors</p>
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
              <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
                You said you work as{" "}
                <span className="font-medium text-foreground">{prefs.job}</span>.
                CityMatcher does not have verified occupation-level salaries in v1;
                the average above is context, not an offer.
              </p>
            ) : null}
          </section>

          {country ? (
            <section className="mt-9 border-t border-border pt-6">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h2 className="text-2xl font-semibold">{country.name} at a glance</h2>
                <a
                  href="https://data.worldbank.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
                >
                  World Bank / {country.asOf} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <dl className="mt-4 grid gap-x-8 sm:grid-cols-2">
                {[
                  { label: "Internet users", value: country.internetUsers ? `${country.internetUsers.toFixed(1)}%` : "—" },
                  { label: "Life expectancy", value: country.lifeExpectancy ? `${country.lifeExpectancy.toFixed(1)} years` : "—" },
                  { label: "Health spend per capita", value: country.healthSpendPc ? `$${formatCompact(country.healthSpendPc)}` : "—" },
                  { label: "PM2.5 exposure", value: country.pm25 ? `${country.pm25.toFixed(1)} µg/m³` : "—" },
                  { label: "GDP per capita (PPP)", value: country.gdpPpp ? `$${formatCompact(country.gdpPpp)}` : "—" },
                  { label: "Unemployment", value: country.unemployment ? `${country.unemployment.toFixed(1)}%` : "—" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4 border-t border-border py-3">
                    <dt className="text-sm text-muted-foreground">{item.label}</dt>
                    <dd className="font-mono text-sm tabular-nums">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          <section className="mt-9 border-t border-border pt-6">
            <div className="flex items-end justify-between gap-2">
              <h2 className="text-2xl font-semibold">Where these numbers come from</h2>
              <Link href="/sources" className="text-xs text-primary underline-offset-4 hover:underline">
                All sources
              </Link>
            </div>
            <div className="mt-4">
              <SourceList sources={city.sources} />
            </div>
            <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
              Methodology v{METHODOLOGY_VERSION}. Climate is real reanalysis data;
              cost and salary figures are modelled estimates for a single person,
              not official statistics. Verify rent and pay locally.
            </p>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <BudgetPanel city={city} prefs={prefs} />

          <div className="border border-border">
            <div className="border-b border-border p-5">
              <p className="label">City fact file</p>
            </div>
            <dl className="px-5">
              {[
                { label: "Population", value: formatNumber(city.population) },
                { label: "Region", value: REGION_LABELS[city.region] },
                { label: "Summer high", value: `${city.climate.summerHigh}°C` },
                { label: "Winter low", value: `${city.climate.winterLow}°C` },
                { label: "Confidence", value: city.confidence },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3 border-b border-border/70 py-3 text-sm last:border-0">
                  <dt className="text-muted-foreground">{item.label}</dt>
                  <dd className="font-mono text-xs capitalize tabular-nums">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="border border-border p-5">
            <p className="label">Make it a decision</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Put this city beside a finalist. The comparison uses the same brief
              and shows where each one wins.
            </p>
            <Link
              href={resultsHref(prefs)}
              className={buttonVariants({ variant: "outline", size: "sm", className: "mt-4 w-full" })}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to matches
            </Link>
            <Link
              href={hasBrief ? `/compare?c=${city.slug}&${encodePreferences(prefs)}` : `/compare?c=${city.slug}`}
              className={buttonVariants({ size: "sm", className: "mt-2 w-full" })}
            >
              Compare this city
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <p className="border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
            <span className="inline-flex items-start gap-2">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Visa, tax and residence rules depend on your nationality and are out
              of scope. Check official government sources before you commit.
            </span>
          </p>
        </aside>
      </div>

      <div className="mt-14 border-t border-border pt-6">
        <Link href={resultsHref(prefs)} className="inline-flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to your matches
        </Link>
      </div>
    </div>
  );
}
