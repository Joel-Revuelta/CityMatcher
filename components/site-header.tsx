"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Bookmark, Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { useSaved } from "./saved-provider";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/cities", label: "Cities" },
  { href: "/results", label: "Matches" },
  { href: "/compare", label: "Compare" },
  { href: "/methodology", label: "Method" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { shortlist, compare, mounted } = useSaved();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-16 w-full max-w-[1360px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <Logo />

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              pathname.startsWith(`${link.href}/`) ||
              (link.href === "/cities" && pathname.startsWith("/city/"));
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "border-b-2 pb-1 text-sm transition-colors",
                  active
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/shortlist"
            className="relative inline-flex h-11 w-11 items-center justify-center border border-border text-foreground transition-colors hover:border-foreground"
            aria-label="Saved shortlist"
            title="Saved shortlist"
          >
            <Bookmark className="h-4 w-4" />
            {mounted && shortlist.length > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center bg-primary px-1 font-mono text-xs font-medium text-primary-foreground">
                {shortlist.length}
              </span>
            ) : null}
          </Link>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <Link
            href="/#wizard"
            className={cn(buttonVariants({ size: "sm" }), "hidden lg:inline-flex")}
          >
            Build my brief
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center border border-border text-foreground transition-colors hover:border-foreground md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex w-full max-w-[1360px] flex-col px-5 py-2 sm:px-8" aria-label="Mobile">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-border/70 py-3.5 text-sm"
              >
                {link.label}
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            ))}
            <Link
              href="/shortlist"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between border-b border-border/70 py-3.5 text-sm"
            >
              Shortlist
              {mounted && shortlist.length > 0 ? (
                <span className="font-mono text-xs text-primary">{shortlist.length}</span>
              ) : (
                <span className="font-mono text-xs text-muted-foreground">0</span>
              )}
            </Link>
            <div className="flex items-center justify-between py-3.5">
              <span className="text-sm">Appearance</span>
              <ThemeToggle />
            </div>
            <Link
              href="/#wizard"
              onClick={() => setOpen(false)}
              className={cn(buttonVariants({ size: "md" }), "mb-3 mt-2 w-full")}
            >
              Build my brief
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <p className="pb-4 font-mono text-xs text-muted-foreground">
              {compare.length} selected to compare
            </p>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
