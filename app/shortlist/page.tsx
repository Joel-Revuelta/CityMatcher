import type { Metadata } from "next";
import { ShortlistClient } from "@/components/shortlist-client";

export const metadata: Metadata = {
  title: "Your shortlist",
  description:
    "Your saved European cities, stored locally in your browser. Compare finalists and keep the decision in one place.",
  robots: { index: false, follow: false },
};

export default function ShortlistPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <p className="eyebrow">Saved locally</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
        Your shortlist.
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        The cities you are seriously considering. Saved in this browser only, so
        you can close the tab and come back without an account.
      </p>
      <ShortlistClient />
    </div>
  );
}
