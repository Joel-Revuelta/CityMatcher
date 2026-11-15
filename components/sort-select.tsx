"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function SortSelect({
  value,
  options,
  preferencesQuery,
  basePath = "/results",
}: {
  value: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  preferencesQuery: string;
  basePath?: string;
}) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      Sort
      <select
        value={value}
        onChange={(event) => {
          const params = new URLSearchParams(preferencesQuery);
          if (event.target.value !== "match") params.set("sort", event.target.value);
          else params.delete("sort");
          router.push(`${basePath}?${params.toString()}`);
        }}
        className={cn(
          "h-9 border border-border bg-background px-2 text-xs text-foreground",
          "focus:border-foreground",
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
