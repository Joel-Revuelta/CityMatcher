"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { Preferences, Region } from "@/lib/types";
import {
  CLIMATE_LABELS,
  PRESETS,
  REGION_LABELS,
  SIZE_LABELS,
} from "@/lib/criteria";
import { encodePreferences } from "@/lib/prefs";
import { formatEUR } from "@/lib/format";
import { Button, buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

export function BriefDrawer({
  initial,
  label = "Adjust brief",
}: {
  initial: Preferences;
  label?: string;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [prefs, setPrefs] = useState<Preferences>(initial);

  function open() {
    setPrefs(initial);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function apply() {
    router.push(`/results?${encodePreferences(prefs)}`);
    close();
  }

  const budget = prefs.budget ?? 2500;

  return (
    <>
      <Button variant="outline" size="sm" onClick={open}>
        <SlidersHorizontal className="h-3.5 w-3.5" />
        {label}
      </Button>

      <dialog
        ref={dialogRef}
        className="m-0 ml-auto h-dvh max-h-none w-full max-w-md border-l border-border bg-background p-0 text-foreground backdrop:bg-foreground/40"
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
        aria-labelledby="brief-drawer-title"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <p className="label">Your brief</p>
              <h2 id="brief-drawer-title" className="mt-1 text-xl font-semibold tracking-tight">
                Adjust the constraints
              </h2>
            </div>
            <button
              type="button"
              onClick={close}
              className="inline-flex h-10 w-10 items-center justify-center border border-border hover:border-foreground"
              aria-label="Close brief editor"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
            <div>
              <div className="flex items-end justify-between gap-3">
                <label htmlFor="drawer-budget" className="text-sm font-medium">
                  Monthly budget
                </label>
                <span className="font-mono text-lg tabular-nums">{formatEUR(budget)}</span>
              </div>
              <input
                id="drawer-budget"
                type="range"
                min={500}
                max={8000}
                step={50}
                value={budget}
                onChange={(event) => setPrefs({ ...prefs, budget: Number(event.target.value) })}
                className="mt-3 h-1.5 w-full cursor-pointer appearance-none bg-input accent-[var(--primary)]"
              />
            </div>

            <fieldset>
              <legend className="text-sm font-medium">Region</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(Object.keys(REGION_LABELS) as Region[]).map((region) => {
                  const active = prefs.regions.includes(region);
                  return (
                    <button
                      key={region}
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        setPrefs({
                          ...prefs,
                          regions: active
                            ? prefs.regions.filter((item) => item !== region)
                            : [...prefs.regions, region],
                        })
                      }
                      className={cn(
                        "border px-3 py-2 text-left text-xs transition-colors",
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
            </fieldset>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="drawer-climate" className="text-sm font-medium">
                  Climate
                </label>
                <select
                  id="drawer-climate"
                  value={prefs.climate}
                  onChange={(event) =>
                    setPrefs({ ...prefs, climate: event.target.value as Preferences["climate"] })
                  }
                  className="mt-2 h-10 w-full border border-border bg-background px-2 text-xs"
                >
                  {(Object.keys(CLIMATE_LABELS) as Array<keyof typeof CLIMATE_LABELS>).map(
                    (climate) => (
                      <option key={climate} value={climate}>
                        {CLIMATE_LABELS[climate]}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div>
                <label htmlFor="drawer-size" className="text-sm font-medium">
                  City size
                </label>
                <select
                  id="drawer-size"
                  value={prefs.size}
                  onChange={(event) =>
                    setPrefs({ ...prefs, size: event.target.value as Preferences["size"] })
                  }
                  className="mt-2 h-10 w-full border border-border bg-background px-2 text-xs"
                >
                  {(Object.keys(SIZE_LABELS) as Array<keyof typeof SIZE_LABELS>).map((size) => (
                    <option key={size} value={size}>
                      {SIZE_LABELS[size]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <fieldset>
              <legend className="text-sm font-medium">Priority preset</legend>
              <div className="mt-2 space-y-1">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setPrefs({ ...prefs, weights: { ...preset.weights } })}
                    className="flex w-full items-center justify-between border-b border-border/70 py-2 text-left text-xs last:border-0 hover:text-primary"
                  >
                    <span>{preset.label}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {Object.values(preset.weights).filter((weight) => weight === 3).length} essentials
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="border-t border-border p-5">
            <Button onClick={apply} className="w-full">
              Apply changes
            </Button>
            <Link
              href={`/?${encodePreferences(prefs)}#wizard`}
              onClick={close}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-1 w-full")}
            >
              Fine-tune all weights in the wizard
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}
