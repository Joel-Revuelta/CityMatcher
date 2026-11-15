"use client";

import { GitCompareArrows, X } from "lucide-react";
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
          "inline-flex h-11 w-11 items-center justify-center border border-border bg-transparent transition-colors hover:border-foreground",
          active && "border-primary bg-primary text-primary-foreground",
        )}
        aria-label={active ? `Remove ${name} from comparison` : `Compare ${name}`}
        aria-pressed={active}
        title={active ? "In comparison" : compareFull && !active ? "Comparison full (4)" : "Compare"}
      >
        {active ? <X className="h-4 w-4" /> : <GitCompareArrows className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <Button
      variant={active ? "soft" : "outline"}
      size="sm"
      onClick={() => toggleCompare(slug)}
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from comparison` : `Compare ${name}`}
    >
      {active ? <X className="h-3.5 w-3.5" /> : <GitCompareArrows className="h-3.5 w-3.5" />}
      {active ? "Remove" : "Compare"}
    </Button>
  );
}
