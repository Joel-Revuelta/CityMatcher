"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Baby,
  Building2,
  Check,
  CloudSun,
  Loader2,
  Snowflake,
  Sparkles,
  Sun,
  Trees,
  User,
  Users,
  Wand2,
} from "lucide-react";
import type { Preferences, ParsedPreferences } from "@/lib/types";
import {
  CLIMATE_LABELS,
  CRITERIA,
  HOUSEHOLD_LABELS,
  PRESETS,
  REGION_LABELS,
  SIZE_LABELS,
  WEIGHT_LABELS,
} from "@/lib/criteria";
import { resultsHref } from "@/lib/prefs";
import { formatEUR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CriterionIcon } from "../criterion-icon";
import { Button, buttonVariants } from "../ui/button";
import { Badge } from "../ui/badge";

const STEPS = [
  { title: "Non-negotiables", short: "Basics" },
  { title: "What matters", short: "Priorities" },
  { title: "Your context", short: "Context" },
];

const CLIMATE_OPTIONS = [
  { value: "any", label: "Any climate", icon: CloudSun },
  { value: "warm", label: "Warm & sunny", icon: Sun },
  { value: "mild", label: "Mild year-round", icon: Trees },
  { value: "cold", label: "Cold winters", icon: Snowflake },
  { value: "four-seasons", label: "Four seasons", icon: Trees },
] as const;

export function PreferenceWizard({ initial }: { initial: Preferences }) {
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<Preferences>(initial);
  const [text, setText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedPreferences | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const essentialCount = useMemo(
    () => Object.values(prefs.weights).filter((weight) => weight === 3).length,
    [prefs.weights],
  );
  const chosenCount = useMemo(
    () => Object.values(prefs.weights).filter((weight) => weight > 0).length,
    [prefs.weights],
  );

  function update(patch: Partial<Preferences>) {
    setPrefs((current) => ({ ...current, ...patch }));
  }

  function applyParsed(result: ParsedPreferences) {
    setPrefs((current) => ({
      ...current,
      ...result.patch,
      weights: result.patch.weights
        ? { ...current.weights, ...result.patch.weights }
        : current.weights,
    }));
  }

  async function parseText() {
    if (!text.trim() || parsing) return;
    setParsing(true);
    setParseError(null);
    try {
      const response = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error("Parser unavailable");
      const payload = (await response.json()) as {
        parsed: ParsedPreferences;
        source: "ai" | "rules";
      };
      setParsed(payload.parsed);
      applyParsed(payload.parsed);
    } catch {
      setParseError("Could not parse that right now. Use the controls below instead.");
    } finally {
      setParsing(false);
    }
  }

  const budget = prefs.budget ?? 2500;

  return (
    <div id="wizard" className="surface-raised scroll-mt-24 overflow-hidden">
      <div className="border-b border-border bg-muted/35 px-5 py-5 sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Build your brief</p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
              What would a good life look like?
            </h2>
          </div>
          <Badge tone="primary">
            {step + 1} / {STEPS.length}
          </Badge>
        </div>

        <ol className="mt-5 grid grid-cols-3 gap-2" aria-label="Wizard progress">
          {STEPS.map((item, index) => (
            <li key={item.title}>
              <button
                type="button"
                onClick={() => setStep(index)}
                className="group w-full text-left"
                aria-current={step === index ? "step" : undefined}
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full transition-colors",
                    index <= step ? "bg-primary" : "bg-border",
                  )}
                />
                <span
                  className={cn(
                    "mt-2 hidden text-[0.7rem] font-semibold sm:block",
                    index === step ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.short}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="p-5 sm:p-7">
        {step === 0 ? (
          <div className="space-y-7">
            <div>
              <label htmlFor="nl-search" className="text-sm font-semibold">
                Describe it in your own words
                <span className="ml-2 font-normal text-muted-foreground">optional</span>
              </label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Wand2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="nl-search"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void parseText();
                      }
                    }}
                    maxLength={400}
                    placeholder="Warm, walkable, safe, tech jobs, under €2,000…"
                    className="h-11 w-full rounded-full border border-border bg-background pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50"
                  />
                </div>
                <Button
                  onClick={() => void parseText()}
                  disabled={!text.trim() || parsing}
                  variant="soft"
                >
                  {parsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {parsing ? "Reading" : "Apply"}
                </Button>
              </div>
              {parsed ? (
                <div className="mt-3 rounded-xl border border-primary/15 bg-primary-soft/50 p-3">
                  <p className="text-xs font-semibold text-primary">
                    {parsed.interpreted.join(" ")}
                  </p>
                  {parsed.chips.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {parsed.chips.map((chip) => (
                        <Badge key={chip} tone="primary">
                          <Check className="h-3 w-3" /> {chip}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
              {parseError ? (
                <p className="mt-2 text-xs text-[var(--danger)]">{parseError}</p>
              ) : null}
              <p className="mt-2 text-[0.7rem] text-muted-foreground">
                Works with simple rules; an AI parser is used only when the server
                has a free-tier key configured.
              </p>
            </div>

            <div>
              <div className="flex items-end justify-between gap-3">
                <label htmlFor="budget" className="text-sm font-semibold">
                  Monthly budget
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-display text-2xl font-semibold tabular-nums">
                    {formatEUR(budget)}
                  </span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>
              </div>
              <input
                id="budget"
                type="range"
                min={500}
                max={8000}
                step={50}
                value={budget}
                onChange={(event) => update({ budget: Number(event.target.value) })}
                className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-[var(--primary)]"
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-1.5">
                  {[1500, 2500, 4000].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => update({ budget: value })}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold transition-colors",
                        budget === value
                          ? "border-primary/30 bg-primary-soft text-primary"
                          : "border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {formatEUR(value)}
                    </button>
                  ))}
                </div>
                <p className="text-[0.7rem] text-muted-foreground">
                  Rent + everyday living costs, for your household.
                </p>
              </div>
            </div>

            <fieldset>
              <legend className="text-sm font-semibold">Where in Europe?</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {(Object.keys(REGION_LABELS) as Array<keyof typeof REGION_LABELS>).map(
                  (region) => {
                    const active = prefs.regions.includes(region);
                    return (
                      <button
                        key={region}
                        type="button"
                        aria-pressed={active}
                        onClick={() =>
                          update({
                            regions: active
                              ? prefs.regions.filter((item) => item !== region)
                              : [...prefs.regions, region],
                          })
                        }
                        className={cn(
                          "rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                          active
                            ? "border-primary/30 bg-primary-soft text-primary"
                            : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        {REGION_LABELS[region]}
                      </button>
                    );
                  },
                )}
              </div>
              <p className="mt-1.5 text-[0.7rem] text-muted-foreground">
                Leave all off to search everywhere.
              </p>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold">Climate</legend>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {CLIMATE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const active = prefs.climate === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => update({ climate: option.value })}
                      className={cn(
                        "flex flex-col items-start gap-2 rounded-2xl border p-3 text-left text-xs font-semibold transition-colors",
                        active
                          ? "border-primary/40 bg-primary-soft text-primary"
                          : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold">City size</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {(Object.keys(SIZE_LABELS) as Array<keyof typeof SIZE_LABELS>).map(
                  (size) => (
                    <button
                      key={size}
                      type="button"
                      aria-pressed={prefs.size === size}
                      onClick={() => update({ size })}
                      className={cn(
                        "rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                        prefs.size === size
                          ? "border-primary/30 bg-primary-soft text-primary"
                          : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {size === "small" ? <Trees className="mr-1.5 inline h-3.5 w-3.5" /> : null}
                      {size === "medium" ? <Building2 className="mr-1.5 inline h-3.5 w-3.5" /> : null}
                      {size === "large" ? <Building2 className="mr-1.5 inline h-3.5 w-3.5" /> : null}
                      {SIZE_LABELS[size]}
                    </button>
                  ),
                )}
              </div>
            </fieldset>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">Set your weights</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    0 = skip · 1 = nice · 2 = important · 3 = essential
                  </p>
                </div>
                <Badge tone={essentialCount > 0 ? "primary" : "neutral"}>
                  {essentialCount} essential · {chosenCount} in play
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => update({ weights: { ...preset.weights } })}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary-soft hover:text-primary"
                    title={preset.description}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {CRITERIA.map((criterion) => (
                <div
                  key={criterion.key}
                  className="flex flex-col gap-2 rounded-2xl border border-border/80 bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <CriterionIcon name={criterion.icon} className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{criterion.label}</p>
                      <p className="truncate text-[0.7rem] text-muted-foreground">
                        {criterion.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1 rounded-full border border-border bg-background p-1">
                    {WEIGHT_LABELS.map((option) => {
                      const active = prefs.weights[criterion.key] === option.value;
                      const short =
                        option.value === 0
                          ? "Skip"
                          : option.value === 1
                            ? "Nice"
                            : option.value === 2
                              ? "Key"
                              : "Must";
                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={active}
                          aria-label={`${criterion.label}: ${option.label}`}
                          onClick={() =>
                            update({
                              weights: { ...prefs.weights, [criterion.key]: option.value },
                            })
                          }
                          className={cn(
                            "rounded-full px-2.5 py-1.5 text-[0.68rem] font-bold transition-colors",
                            active
                              ? option.value === 3
                                ? "bg-accent text-accent-foreground"
                                : "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          {short}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="income" className="text-sm font-semibold">
                  Net monthly income
                  <span className="ml-2 font-normal text-muted-foreground">optional</span>
                </label>
                <div className="mt-2 flex items-center rounded-full border border-border bg-background px-4">
                  <span className="text-sm text-muted-foreground">€</span>
                  <input
                    id="income"
                    type="number"
                    min={0}
                    max={20000}
                    step={50}
                    value={prefs.income ?? ""}
                    onChange={(event) =>
                      update({
                        income: event.target.value ? Number(event.target.value) : null,
                      })
                    }
                    placeholder="e.g. 3200"
                    className="h-11 w-full bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground/60"
                  />
                </div>
                <p className="mt-1.5 text-[0.7rem] text-muted-foreground">
                  Used to estimate what is left after rent and living costs.
                </p>
              </div>

              <div>
                <label htmlFor="job" className="text-sm font-semibold">
                  Job title
                  <span className="ml-2 font-normal text-muted-foreground">optional</span>
                </label>
                <input
                  id="job"
                  value={prefs.job}
                  onChange={(event) => update({ job: event.target.value })}
                  maxLength={60}
                  placeholder="e.g. Software engineer"
                  className="mt-2 h-11 w-full rounded-full border border-border bg-background px-4 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary/50"
                />
                <p className="mt-1.5 text-[0.7rem] text-muted-foreground">
                  We show the local salary context — not a guaranteed offer.
                </p>
              </div>
            </div>

            <fieldset>
              <legend className="text-sm font-semibold">Who is moving?</legend>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(Object.keys(HOUSEHOLD_LABELS) as Array<keyof typeof HOUSEHOLD_LABELS>).map(
                  (household) => {
                    const Icon = household === "single" ? User : household === "couple" ? Users : Baby;
                    const active = prefs.household === household;
                    return (
                      <button
                        key={household}
                        type="button"
                        aria-pressed={active}
                        onClick={() => update({ household })}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-xs font-semibold transition-colors",
                          active
                            ? "border-primary/40 bg-primary-soft text-primary"
                            : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {HOUSEHOLD_LABELS[household]}
                      </button>
                    );
                  },
                )}
              </div>
            </fieldset>

            <div className="rounded-2xl border border-border bg-muted/35 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">Your brief</p>
                <Link
                  href={resultsHref(prefs)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  See matches now →
                </Link>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">Budget</dt>
                  <dd className="mt-0.5 font-semibold">{formatEUR(budget)}</dd>
                </div>
                <div>
                  <dt className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">Household</dt>
                  <dd className="mt-0.5 font-semibold">{HOUSEHOLD_LABELS[prefs.household]}</dd>
                </div>
                <div>
                  <dt className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">Climate</dt>
                  <dd className="mt-0.5 font-semibold">{CLIMATE_LABELS[prefs.climate]}</dd>
                </div>
                <div>
                  <dt className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">Essentials</dt>
                  <dd className="mt-0.5 font-semibold">{essentialCount}</dd>
                </div>
              </dl>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {prefs.regions.length > 0 ? (
                  prefs.regions.map((region) => (
                    <Badge key={region} tone="outline">
                      {REGION_LABELS[region]}
                    </Badge>
                  ))
                ) : (
                  <Badge tone="outline">Anywhere in Europe</Badge>
                )}
                {prefs.size !== "any" ? <Badge tone="outline">{SIZE_LABELS[prefs.size]}</Badge> : null}
                {CRITERIA.filter((criterion) => prefs.weights[criterion.key] >= 2)
                  .slice(0, 4)
                  .map((criterion) => (
                    <Badge key={criterion.key} tone="primary">
                      {criterion.shortLabel}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/25 px-5 py-4 sm:px-7">
        <div>
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep((current) => current - 1)}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">Takes about 60 seconds.</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((current) => current + 1)}>
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Link href={resultsHref(prefs)} className={buttonVariants({ size: "md" })}>
              Show my matches <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
