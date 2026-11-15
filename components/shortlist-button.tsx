"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
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
          "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted",
          saved && "border-primary/30 bg-primary-soft text-primary",
          className,
        )}
        aria-label={saved ? `Remove ${name} from shortlist` : `Save ${name} to shortlist`}
        aria-pressed={saved}
        title={saved ? "Saved" : "Save city"}
      >
        {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <Button
      variant={saved ? "soft" : "outline"}
      size="sm"
      onClick={() => toggleShortlist(slug)}
      aria-pressed={saved}
      className={cn(saved && "bg-primary-soft text-primary", className)}
    >
      {saved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
