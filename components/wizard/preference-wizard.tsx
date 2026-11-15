"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import { encodePreferences, resultsHref } from "@/lib/prefs";
import { formatEUR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CriterionIcon } from "../criterion-icon";
import { Button, buttonVariants } from "../ui/button";
import { Badge } from "../ui/badge";

const STEPS = [
  { title: "The basics", short: "Basics" },
  { title: "The weights", short: "Weights" },
  { title: "The context", short: "Context" },
];

const CLIMATE_OPTIONS = [
  { value: "any", label: "Any climate", icon: CloudSun },
  { value: "warm", label: "Warm and sunny", icon: Sun },
  { value: "mild", label: "Mild year-round", icon: Trees },
  { value: "cold", label: "Cold winters", icon: Snowflake },
  { value: "four-seasons", label: "Four seasons", icon: Trees },
] as const;

const REGIONS = ["western", "northern", "southern", "central", "eastern"] as const;

export function PreferenceWizard({ initial }: { initial: Preferences }) {
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<Preferences>(initial);
  const [text, setText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedPreferences | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [matchCount, setMatchCount] = useState<number | null>(null);

  const budget = prefs.budget ?? 2500;
  const effectivePrefs = useMemo(() => ({ ...prefs, budget }), [prefs, budget]);

  const essentialCount = useMemo(
    () => Object.values(prefs.weights).filter((weight) => weight === 3).length,
    [prefs.weights],
  );
  const chosenCount = useMemo(
    () => Object.values(prefs.weights).filter((weight) => weight > 0).length,
    [prefs.weights],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/match?${encodePreferences(effectivePrefs)}&limit=1`,
          { signal: controller.signal },
        );
        if (!response.ok) return;
        const payload = (await response.json()) as { candidateCount?: number };
        if (typeof payload.candidateCount === "number") {
          setMatchCount(payload.candidateCount);
        }
      } catch {
        // A live count is an enhancement; the wizard still works without it.
      }
    }, 350);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [effectivePrefs]);

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

  return (
    <div id="wizard" className="border border-border bg-background">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-5 py-5 sm:px-6">
        <div>
          <p className="label">Build your brief</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">
            A brief, not a quiz.
          </h2>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
        </p>
      </div>

      <div className="grid md:grid-cols-[13rem_1fr]">
        <aside className="border-b border-border p-5 md:border-b-0 md:border-r md:p-6">
          <p className="label">Steps</p>
          <ol className="mt-3 grid grid-cols-3 gap-2 md:block md:space-y-1">
            {STEPS.map((item, index) => (
              <li key={item.title}>
                <button
                  type="button"
                  onClick={() => setStep(index)}
                  aria-current={step === index ? "step" : undefined}
                  className={cn(
                    "flex w-full items-center gap-2 border-b py-2 text-left text-xs transition-colors md:py-2.5",
                    index === step
                      ? "border-primary text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span className="font-mono text-xs text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate">{item.short}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="mt-8 hidden border-t border-border pt-4 md:block">
            <p className="label">Brief so far</p>
            <dl className="mt-3 space-y-3 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Budget</dt>
                <dd className="font-mono">{formatEUR(budget)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Where</dt>
                <dd className="text-right">{prefs.regions.length > 0 ? prefs.regions.map((r) => REGION_LABELS[r]).join(", ") : "Anywhere"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Climate</dt>
                <dd className="text-right">{CLIMATE_LABELS[prefs.climate]}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Essentials</dt>
                <dd className="font-mono">{essentialCount}</dd>
              </div>
            </dl>
          </div>
        </aside>

        <div className="p-5 sm:p-6">
          {step === 0 ? (
            <div className="space-y-8">
              <div>
                <label htmlFor="nl-search" className="text-sm font-medium">
                  Describe it in your own words <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <div className="flex h-11 flex-1 items-center border border-border bg-background px-3">
                    <Wand2 className="h-4 w-4 shrink-0 text-muted-foreground" />
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
                      placeholder="Warm, walkable, safe, under €2,000…"
                      className="h-full w-full bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground/70"
                    />
                  </div>
                  <Button variant="outline" onClick={() => void parseText()} disabled={!text.trim() || parsing}>
                    {parsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {parsing ? "Reading" : "Apply"}
                  </Button>
                </div>
                {parsed ? (
                  <div className="mt-3 border-l-2 border-primary bg-card px-3 py-2.5">
                    <p className="text-xs font-medium text-primary">
                      {parsed.interpreted.join(" ")}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {parsed.chips.map((chip) => (
                        <Badge key={chip} tone="primary">
                          <Check className="h-3 w-3" /> {chip}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
                {parseError ? <p className="mt-2 text-xs text-danger">{parseError}</p> : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  Rules by default; a free-tier AI parser is used only when configured on the server.
                </p>
              </div>

              <div>
                <div className="flex items-end justify-between gap-3">
                  <label htmlFor="budget" className="text-sm font-medium">
                    Monthly budget
                  </label>
                  <span className="font-mono text-2xl font-medium tabular-nums">{formatEUR(budget)}</span>
                </div>
                <input
                  id="budget"
                  type="range"
                  min={500}
                  max={8000}
                  step={50}
                  value={budget}
                  onChange={(event) => update({ budget: Number(event.target.value) })}
                  className="mt-3 h-1.5 w-full cursor-pointer appearance-none bg-input accent-[var(--primary)]"
                />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex gap-1">
                    {[1500, 2500, 4000].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => update({ budget: value })}
                        className={cn(
                          "border px-2.5 py-1 font-mono text-xs transition-colors",
                          budget === value
                            ? "border-primary bg-primary-soft text-primary"
                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                        )}
                      >
                        {formatEUR(value)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Rent and everyday living costs for your household.
                  </p>
                </div>
              </div>

              <fieldset>
                <legend className="text-sm font-medium">Where in Europe?</legend>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {REGIONS.map((region) => {
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
                          "border px-3 py-2.5 text-left text-xs transition-colors",
                          active
                            ? "border-primary bg-primary-soft text-primary"
                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                        )}
                      >
                        {REGION_LABELS[region]}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Leave all off to search everywhere.
                </p>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-medium">Climate</legend>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
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
                          "flex items-center gap-2 border px-3 py-2.5 text-left text-xs transition-colors",
                          active
                            ? "border-primary bg-primary-soft text-primary"
                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                        )}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-medium">City size</legend>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(Object.keys(SIZE_LABELS) as Array<keyof typeof SIZE_LABELS>).map((size) => (
                    <button
                      key={size}
                      type="button"
                      aria-pressed={prefs.size === size}
                      onClick={() => update({ size })}
                      className={cn(
                        "flex items-center gap-2 border px-3 py-2.5 text-left text-xs transition-colors",
                        prefs.size === size
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                      )}
                    >
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      {SIZE_LABELS[size]}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Weight the criteria</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    0 skips a criterion. 3 makes it essential. Only kept criteria enter the average.
                  </p>
                </div>
                <p className="font-mono text-xs text-muted-foreground">
                  {essentialCount} essential / {chosenCount} in play
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => update({ weights: { ...preset.weights } })}
                    className="border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary-soft hover:text-primary"
                    title={preset.description}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="border-t border-border">
                {CRITERIA.map((criterion) => (
                  <div
                    key={criterion.key}
                    className="flex flex-col gap-2 border-b border-border py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-border text-muted-foreground">
                        <CriterionIcon name={criterion.icon} className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{criterion.label}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {criterion.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-0 border border-border">
                      {WEIGHT_LABELS.map((option) => {
                        const active = prefs.weights[criterion.key] === option.value;
                        const short = option.value === 0 ? "Skip" : option.value === 1 ? "Nice" : option.value === 2 ? "Key" : "Must";
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
                              "border-r border-border px-2.5 py-1.5 text-xs font-medium transition-colors last:border-r-0",
                              active
                                ? option.value === 3
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-foreground text-background"
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
                  <label htmlFor="income" className="text-sm font-medium">
                    Net monthly income <span className="font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <div className="mt-2 flex h-11 items-center border border-border bg-background px-3">
                    <span className="text-sm text-muted-foreground">€</span>
                    <input
                      id="income"
                      type="number"
                      min={0}
                      max={20000}
                      step={50}
                      value={prefs.income ?? ""}
                      onChange={(event) =>
                        update({ income: event.target.value ? Number(event.target.value) : null })
                      }
                      placeholder="3200"
                      className="h-full w-full bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground/60"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Used for what is left after rent and living costs.
                  </p>
                </div>

                <div>
                  <label htmlFor="job" className="text-sm font-medium">
                    Job title <span className="font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    id="job"
                    value={prefs.job}
                    onChange={(event) => update({ job: event.target.value })}
                    maxLength={60}
                    placeholder="Software engineer"
                    className="mt-2 h-11 w-full border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-foreground"
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    We show local salary context, not a guaranteed offer.
                  </p>
                </div>
              </div>

              <fieldset>
                <legend className="text-sm font-medium">Who is moving?</legend>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(Object.keys(HOUSEHOLD_LABELS) as Array<keyof typeof HOUSEHOLD_LABELS>).map((household) => {
                    const Icon = household === "single" ? User : household === "couple" ? Users : Baby;
                    const active = prefs.household === household;
                    return (
                      <button
                        key={household}
                        type="button"
                        aria-pressed={active}
                        onClick={() => update({ household })}
                        className={cn(
                          "flex flex-col items-center gap-1.5 border px-2 py-3 text-xs transition-colors",
                          active
                            ? "border-primary bg-primary-soft text-primary"
                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {HOUSEHOLD_LABELS[household]}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="border border-border">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                  <p className="text-sm font-medium">Brief summary</p>
                  <Link href={resultsHref(effectivePrefs)} className="text-xs text-primary underline-offset-4 hover:underline">
                    See matches
                  </Link>
                </div>
                <dl className="grid grid-cols-2 gap-4 px-4 py-4 sm:grid-cols-4">
                  <div>
                    <dt className="label">Budget</dt>
                    <dd className="mt-0.5 font-mono text-sm">{formatEUR(budget)}</dd>
                  </div>
                  <div>
                    <dt className="label">Household</dt>
                    <dd className="mt-0.5 text-sm">{HOUSEHOLD_LABELS[prefs.household]}</dd>
                  </div>
                  <div>
                    <dt className="label">Climate</dt>
                    <dd className="mt-0.5 text-sm">{CLIMATE_LABELS[prefs.climate]}</dd>
                  </div>
                  <div>
                    <dt className="label">Essentials</dt>
                    <dd className="mt-0.5 font-mono text-sm">{essentialCount}</dd>
                  </div>
                </dl>
                <div className="flex flex-wrap gap-1.5 border-t border-border px-4 py-3">
                  {prefs.regions.length > 0 ? (
                    prefs.regions.map((region) => (
                      <Badge key={region} tone="outline">{REGION_LABELS[region]}</Badge>
                    ))
                  ) : (
                    <Badge tone="outline">Anywhere in Europe</Badge>
                  )}
                  {prefs.size !== "any" ? <Badge tone="outline">{SIZE_LABELS[prefs.size]}</Badge> : null}
                  {CRITERIA.filter((criterion) => prefs.weights[criterion.key] >= 2)
                    .slice(0, 4)
                    .map((criterion) => (
                      <Badge key={criterion.key} tone="primary">{criterion.shortLabel}</Badge>
                    ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 sm:px-6">
        <div>
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep((current) => current - 1)}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">About 60 seconds.</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-xs text-muted-foreground sm:block">
            {matchCount === null ? "—" : `${matchCount} cities fit`}
          </span>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((current) => current + 1)}>
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Link href={resultsHref(effectivePrefs)} className={buttonVariants({ size: "md" })}>
              See matches <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
