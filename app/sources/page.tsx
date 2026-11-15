import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CloudSun, Database, ExternalLink, Landmark, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  CITY_COUNT,
  COUNTRY_COUNT,
  getAllCities,
  getDataset,
} from "@/lib/data";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Data sources",
  description:
    "Every source behind CityMatcher: Open-Meteo climate normals, World Bank indicators and the curated cost model, with licences and freshness dates.",
  alternates: { canonical: "/sources" },
};

const sources = [
  {
    icon: CloudSun,
    title: "Open-Meteo",
    url: "https://open-meteo.com/",
    licence: "CC BY 4.0 · ERA5 reanalysis",
    use: "Monthly high and low temperatures, rainfall and sunshine normals for every city, 2019–2024.",
    refresh: "Regenerated when the dataset is rebuilt",
  },
  {
    icon: Landmark,
    title: "World Bank Open Data",
    url: "https://data.worldbank.org/",
    licence: "CC BY 4.0",
    use: "Country internet use, life expectancy, health spending, PM2.5 exposure, GDP per capita and unemployment.",
    refresh: "Latest available year per indicator",
  },
  {
    icon: Database,
    title: "CityMatcher cost model",
    url: "/methodology",
    licence: "Modelled estimate",
    use: "Rent, living costs, net salaries, safety, walkability, environment, happiness, public services and English composites.",
    refresh: "Curated 2025 · medium confidence",
  },
  {
    icon: MapPin,
    title: "City catalogue",
    url: "https://www.geonames.org/",
    licence: "Coordinates cross-checked with GeoNames",
    use: "City coordinates, country assignment, population bands and editorial copy.",
    refresh: "Maintained with the seed file",
  },
];

export default function SourcesPage() {
  const cities = getAllCities();
  const dataset = getDataset();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <p className="eyebrow">Provenance</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
        Data sources & limits.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
        Transparency is the product. Every automated input is linked; every
        modelled value is labelled. If you cannot see where a number came from, it
        should not influence your move.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Badge tone="primary">{CITY_COUNT} cities</Badge>
        <Badge tone="outline">{COUNTRY_COUNT} countries</Badge>
        <Badge tone="outline">Dataset built {formatDate(dataset.generatedAt)}</Badge>
        <Badge tone="outline">Methodology v{dataset.methodologyVersion}</Badge>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {sources.map((source) => {
          const Icon = source.icon;
          const external = source.url.startsWith("http");
          return (
            <div key={source.title} className="surface p-5">
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <Badge tone="outline">{source.licence}</Badge>
              </div>
              <h2 className="mt-3 text-lg font-semibold">{source.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {source.use}
              </p>
              <p className="mt-3 text-[0.7rem] text-muted-foreground">
                <span className="font-semibold text-foreground">Freshness:</span>{" "}
                {source.refresh}
              </p>
              <a
                href={source.url}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Visit source {external ? <ExternalLink className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
              </a>
            </div>
          );
        })}
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Coverage and freshness</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Climate is complete for every city. Country context is the latest
          available World Bank year. Cost, salary and composite livability values
          are modelled and should be treated as planning ranges.
        </p>
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="max-h-[28rem] overflow-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">City</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Country</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Climate</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Country data</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {cities.map((city) => {
                  const country = dataset.countries.find((item) => item.code === city.countryCode);
                  return (
                    <tr key={city.slug} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-3">
                        <Link href={`/city/${city.slug}`} className="font-medium hover:text-primary">
                          {city.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{city.country}</td>
                      <td className="px-4 py-3 text-muted-foreground">2019–2024</td>
                      <td className="px-4 py-3 text-muted-foreground">{country?.asOf ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge tone="outline" className="capitalize">{city.confidence}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-border bg-muted/30 p-5">
        <h2 className="text-lg font-semibold">What is not here yet</h2>
        <ul className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>• Verified city-level crime statistics, school quality and neighbourhood data.</li>
          <li>• Visa eligibility by nationality, tax residence and immigration processing times.</li>
          <li>• Live rent listings, job openings and occupation-level salary offers.</li>
          <li>• Licensed cost-of-living panels; v1 uses a transparent model instead.</li>
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          These are deliberate omissions, not hidden estimates. They are the next
          data partnerships or curated datasets on the roadmap.
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/methodology" className={buttonVariants()}>
          Read the methodology <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/results" className={buttonVariants({ variant: "outline" })}>
          Explore the dataset
        </Link>
      </div>
    </div>
  );
}
