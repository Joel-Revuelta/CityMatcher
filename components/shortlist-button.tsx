"use client";

import { Bookmark } from "lucide-react";
import { useSaved } from "./saved-provider";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function ShortlistButton({
  slug,
  name,
  compact = false,
  className,
}: {
  slug: string;
  name: string;
  compact?: boolean;
  className?: string;
}) {
  const { isShortlisted, toggleShortlist, mounted } = useSaved();
  const saved = mounted && isShortlisted(slug);

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => toggleShortlist(slug)}
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center border border-border bg-transparent transition-colors hover:border-foreground",
          saved && "border-primary bg-primary text-primary-foreground",
          className,
        )}
        aria-label={saved ? `Remove ${name} from shortlist` : `Save ${name} to shortlist`}
        aria-pressed={saved}
        title={saved ? "Saved" : "Save city"}
      >
        <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
      </button>
    );
  }

  return (
    <Button
      variant={saved ? "soft" : "outline"}
      size="sm"
      onClick={() => toggleShortlist(slug)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from shortlist` : `Save ${name} to shortlist`}
      className={className}
    >
      <Bookmark className={cn("h-3.5 w-3.5", saved && "fill-current")} />
      {saved ? "Saved" : "Save city"}
    </Button>
  );
}
