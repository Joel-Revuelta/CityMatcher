"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, GitCompareArrows, Sparkles } from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { useSaved } from "./saved-provider";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/results", label: "Explore" },
  { href: "/compare", label: "Compare" },
  { href: "/methodology", label: "Methodology" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { shortlist, compare, mounted } = useSaved();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 glass">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/compare"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
            aria-label="Compare cities"
            title="Compare cities"
          >
            <GitCompareArrows className="h-4 w-4" />
            {mounted && compare.length > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.6rem] font-bold text-accent-foreground">
                {compare.length}
              </span>
            ) : null}
          </Link>
          <Link
            href="/shortlist"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
            aria-label="Saved shortlist"
            title="Saved shortlist"
          >
            <Bookmark className="h-4 w-4" />
            {mounted && shortlist.length > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-bold text-primary-foreground">
                {shortlist.length}
              </span>
            ) : null}
          </Link>
          <ThemeToggle />
          <Link
            href="/#wizard"
            className={cn(buttonVariants({ size: "sm" }), "ml-1 hidden sm:inline-flex")}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Find my city
          </Link>
        </div>
      </div>
    </header>
  );
}
