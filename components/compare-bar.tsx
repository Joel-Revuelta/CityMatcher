"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitCompareArrows, X } from "lucide-react";
import { useSaved } from "./saved-provider";
import { buttonVariants } from "./ui/button";

export function CompareBar() {
  const pathname = usePathname();
  const { compare, clearCompare, mounted } = useSaved();

  if (!mounted || compare.length === 0 || pathname === "/compare") {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex w-full max-w-xl items-center justify-between gap-3 rounded-full border border-border bg-card/95 py-2 pl-4 pr-2 shadow-2xl backdrop-blur">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <GitCompareArrows className="h-3.5 w-3.5" />
          </span>
          <p className="truncate text-sm font-semibold">
            {compare.length} {compare.length === 1 ? "city" : "cities"} selected
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={clearCompare}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Clear comparison"
            title="Clear comparison"
          >
            <X className="h-4 w-4" />
          </button>
          <Link
            href={`/compare?c=${compare.join(",")}`}
            className={buttonVariants({ size: "sm" })}
          >
            Compare
          </Link>
        </div>
      </div>
    </div>
  );
}
