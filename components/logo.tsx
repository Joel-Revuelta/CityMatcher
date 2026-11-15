import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="CityMatcher home"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 shrink-0 text-primary"
        aria-hidden="true"
      >
        <path
          d="M12 2v5M12 17v5M2 12h5M17 12h5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect x="8" y="8" width="8" height="8" fill="currentColor" />
        <circle cx="12" cy="12" r="2.2" fill="var(--background)" />
      </svg>
      {showWordmark ? (
        <span className="text-[1.05rem] font-semibold tracking-[-0.035em]">
          CityMatcher
        </span>
      ) : null}
    </Link>
  );
}
