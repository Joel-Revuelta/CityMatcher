import type { Metadata } from "next";
import { ShortlistClient, type ShortlistEntry } from "@/components/shortlist-client";
import { getAllCities } from "@/lib/data";
import { DEFAULT_PREFS } from "@/lib/prefs";
import { scoreCity } from "@/lib/scoring";

export const metadata: Metadata = {
  title: "Your shortlist",
  description:
    "Your saved European cities, stored locally in your browser. Compare finalists and keep the decision in one place.",
  robots: { index: false, follow: false },
};

export default function ShortlistPage() {
  const entries: ShortlistEntry[] = getAllCities().map((city) => {
    const result = scoreCity(city, DEFAULT_PREFS);
    return {
      slug: city.slug,
      name: city.name,
      country: city.country,
      score: result.score,
      tier: result.tier,
      totalMonthly: result.totalMonthly,
      salaryCoverage: city.work.salaryCoverage,
      region: city.region,
      size: city.size,
      climate: city.climate,
      overBudget: result.overBudget,
    };
  });

  return (
    <div className="mx-auto w-full max-w-[1360px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <p className="label">Saved locally</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
        Your shortlist.
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        The cities you are seriously considering. Stored in this browser only, so
        you can close the tab and come back without an account.
      </p>
      <ShortlistClient entries={entries} />
    </div>
  );
}
