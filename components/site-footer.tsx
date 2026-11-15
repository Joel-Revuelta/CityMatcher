import Link from "next/link";
import { Database, ExternalLink, ShieldCheck } from "lucide-react";
import { Logo } from "./logo";
import { CITY_COUNT, COUNTRY_COUNT } from "@/lib/data";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-card/45">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            A relocation decision engine built on real climate data, country
            indicators and transparent cost models. No black-box rankings, no
            invented statistics.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1">
              <Database className="h-3 w-3" /> {CITY_COUNT} cities · {COUNTRY_COUNT} countries
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1">
              <ShieldCheck className="h-3 w-3" /> Sourced & dated
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Product
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="hover:text-primary" href="/results">Explore cities</Link></li>
            <li><Link className="hover:text-primary" href="/compare">Compare</Link></li>
            <li><Link className="hover:text-primary" href="/shortlist">Shortlist</Link></li>
            <li><Link className="hover:text-primary" href="/#wizard">Preference wizard</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Trust
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="hover:text-primary" href="/methodology">Methodology</Link></li>
            <li><Link className="hover:text-primary" href="/sources">Data sources</Link></li>
            <li><Link className="hover:text-primary" href="/about">About</Link></li>
            <li>
              <a
                className="inline-flex items-center gap-1 hover:text-primary"
                href="https://open-meteo.com/"
                target="_blank"
                rel="noreferrer"
              >
                Open-Meteo <ExternalLink className="h-3 w-3" />
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Fine print
          </p>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            CityMatcher is informational. Costs are estimates and visa, tax or
            immigration decisions should always be checked with official
            sources. Some metrics are modelled and labelled accordingly.
          </p>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} CityMatcher. Built for better moves.</p>
          <p>Made with public data · Methodology v1.0</p>
        </div>
      </div>
    </footer>
  );
}
