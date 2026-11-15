import Link from "next/link";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="CityMatcher home"
    >
      <span className="relative flex h-9 w-9 items-center justify-center rounded-[0.9rem] bg-primary text-primary-foreground shadow-sm transition-transform duration-300 group-hover:-rotate-6">
        <MapPin className="h-[1.15rem] w-[1.15rem]" strokeWidth={2.2} />
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent ring-2 ring-background" />
      </span>
      {!compact ? (
        <span className="font-display text-[1.2rem] font-semibold leading-none tracking-tight">
          City<span className="text-primary">Matcher</span>
        </span>
      ) : null}
    </Link>
  );
}
