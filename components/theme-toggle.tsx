"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      window.localStorage.setItem("cm:theme", next ? "dark" : "light");
    } catch {
      // Ignore storage failures.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center border border-border bg-transparent text-foreground transition-colors hover:border-foreground",
        className,
      )}
      aria-label="Toggle color theme"
      title="Toggle color theme"
    >
      <Moon className="h-4 w-4 dark:hidden" />
      <Sun className="hidden h-4 w-4 dark:block" />
    </button>
  );
}
