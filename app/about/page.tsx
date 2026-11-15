import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, HeartHandshake, Lock, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CITY_COUNT } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why CityMatcher exists, what it refuses to do, and the roadmap from a hackathon winner to a real relocation decision tool.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <p className="label">About</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
        A hackathon idea, rebuilt properly.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
        CityMatcher started as a form that asked an LLM to invent city scores. It
        won an Extia hackathon — and then sat unfinished, because a demo that
        hallucinates numbers is not a product.
      </p>

      <div className="prose-cm mt-8">
        <h2>Why rebuild it?</h2>
        <p>
          “Where should I live?” is a high-stakes decision made with scattered
          tabs, stale blog posts and vibes. The useful version is not a chatbot
          with opinions. It is a transparent ranking you can inspect: here is the
          brief, here are the inputs, here is the trade-off, here is the monthly
          budget.
        </p>
        <p>
          So the engine is deterministic. It scores every city against only the
          criteria you keep, using sourced climate data, World Bank country
          indicators and a labelled cost model. The AI, when a free-tier key is
          configured, only translates your words into the form. It never invents a
          statistic.
        </p>

        <h2>Principles</h2>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {[
          {
            icon: Compass,
            title: "Explain, don't persuade",
            text: "Every score exposes its strengths, its weakest weighted criterion and the budget arithmetic.",
          },
          {
            icon: Lock,
            title: "No account, no tracking tax",
            text: "Your shortlist lives in your browser. There is no signup wall before the useful part.",
          },
          {
            icon: HeartHandshake,
            title: "Honest about uncertainty",
            text: "Modelled values are labelled. Unknowns are named instead of filled with confident-sounding fiction.",
          },
          {
            icon: Sparkles,
            title: "Useful before impressive",
            text: "A smaller set of cities done well beats 2,000 thin profiles with fake precision.",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="border border-border p-5">
              <Icon className="h-4 w-4 text-primary" />
              <h2 className="mt-2 text-lg font-semibold">{item.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          );
        })}
      </div>

      <div className="prose-cm mt-10">
        <h2>Where it is today</h2>
        <p>
          v1 covers {CITY_COUNT} European cities across 27 countries, eleven
          criteria, a three-step brief, ranked results, full city profiles,
          side-by-side comparison, a local shortlist and shareable URLs. It runs
          without an account, a database or a paid API.
        </p>

        <h2>What comes next</h2>
        <ul>
          <li>Accounts and email alerts when a city&apos;s costs or scores change.</li>
          <li>Visa pathways by nationality, with official-source links.</li>
          <li>Occupation-level salary ranges and live rental signals.</li>
          <li>French and Spanish interfaces, then more cities.</li>
          <li>Pro reports for people making the move, and a B2B API for relocation teams.</li>
        </ul>

        <h2>Built with</h2>
        <p>
          Next.js, React, TypeScript, Tailwind CSS, a versioned JSON dataset and a
          pure TypeScript scoring engine. Climate data from Open-Meteo, country
          context from the World Bank, and a cost model maintained in the open
          repository. The original Angular hackathon build is preserved on a{" "}
          <code>legacy/angular-v18</code> branch.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Badge tone="primary">v1</Badge>
        <Badge tone="outline">Free</Badge>
        <Badge tone="outline">No account</Badge>
        <Badge tone="outline">Methodology v1.0</Badge>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/#wizard" className={buttonVariants()}>
          Build your brief <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/methodology" className={buttonVariants({ variant: "outline" })}>
          Read the methodology
        </Link>
      </div>
    </div>
  );
}
