import Link from "next/link";
import { Logo } from "./logo";
import { CITY_COUNT, COUNTRY_COUNT } from "@/lib/data";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto w-full max-w-[1360px] px-5 py-12 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-2xl font-semibold leading-[1.1] tracking-[-0.035em]">
              Find where you&apos;d actually thrive.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              An independent relocation tool built on real climate data, country
              indicators and a transparent cost model. No black-box rankings, no
              invented statistics.
            </p>
          </div>

          <div>
            <p className="label">Product</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link className="hover:text-primary" href="/cities">Cities</Link></li>
              <li><Link className="hover:text-primary" href="/results">Matches</Link></li>
              <li><Link className="hover:text-primary" href="/compare">Compare</Link></li>
              <li><Link className="hover:text-primary" href="/shortlist">Shortlist</Link></li>
            </ul>
          </div>

          <div>
            <p className="label">Trust</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link className="hover:text-primary" href="/methodology">Methodology</Link></li>
              <li><Link className="hover:text-primary" href="/sources">Data sources</Link></li>
              <li><Link className="hover:text-primary" href="/about">About</Link></li>
              <li><Link className="hover:text-primary" href="/#wizard">Build a brief</Link></li>
            </ul>
          </div>

          <div>
            <p className="label">Colophon</p>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              {CITY_COUNT} cities across {COUNTRY_COUNT} countries. Climate from
              Open-Meteo, country context from the World Bank, cost model maintained
              in the open repository. Informational only — verify visas, tax and
              rent locally.
            </p>
            <p className="mt-4 font-mono text-xs text-muted-foreground">
              Methodology v1.0
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CityMatcher. Built for better moves.</p>
          <p className="font-mono text-xs">42 cities / 27 countries / 11 criteria</p>
        </div>
      </div>
    </footer>
  );
}
