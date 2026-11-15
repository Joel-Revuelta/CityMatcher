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
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
      <div className="pointer-events-auto flex w-full max-w-2xl items-center justify-between gap-3 border border-border bg-background p-2 pl-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-border text-primary">
            <GitCompareArrows className="h-3.5 w-3.5" />
          </span>
          <p className="truncate text-sm">
            <span className="font-mono font-medium">{compare.length}</span>{" "}
            {compare.length === 1 ? "city" : "cities"} selected
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={clearCompare}
            className="inline-flex h-9 w-9 items-center justify-center border border-transparent text-muted-foreground transition-colors hover:border-border hover:text-foreground"
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
