"use client";

import { Check, GitCompareArrows } from "lucide-react";
import { useSaved } from "./saved-provider";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function CompareButton({
  slug,
  name,
  compact = false,
}: {
  slug: string;
  name: string;
  compact?: boolean;
}) {
  const { isComparing, toggleCompare, mounted, compareFull } = useSaved();
  const active = mounted && isComparing(slug);

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => toggleCompare(slug)}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted",
          active && "border-primary/30 bg-primary-soft text-primary",
        )}
        aria-label={active ? `Remove ${name} from comparison` : `Compare ${name}`}
        aria-pressed={active}
        title={active ? "In comparison" : compareFull && !active ? "Comparison full (4)" : "Compare"}
      >
        {active ? <Check className="h-4 w-4" /> : <GitCompareArrows className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <Button
      variant={active ? "soft" : "outline"}
      size="sm"
      onClick={() => toggleCompare(slug)}
      aria-pressed={active}
      className={cn(active && "bg-primary-soft text-primary")}
    >
      {active ? <Check className="h-3.5 w-3.5" /> : <GitCompareArrows className="h-3.5 w-3.5" />}
      {active ? "Added" : "Compare"}
    </Button>
  );
}
