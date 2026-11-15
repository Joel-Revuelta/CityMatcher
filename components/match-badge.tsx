import { cn } from "@/lib/utils";
import type { MatchTier } from "@/lib/types";

const tierStyles: Record<MatchTier, string> = {
  Excellent:
    "bg-[color-mix(in_oklch,var(--success)_14%,transparent)] text-[var(--success)] ring-[color-mix(in_oklch,var(--success)_30%,transparent)]",
  Strong:
    "bg-primary-soft text-primary ring-[color-mix(in_oklch,var(--primary)_28%,transparent)]",
  Fair: "bg-[color-mix(in_oklch,var(--warning)_16%,transparent)] text-[color-mix(in_oklch,var(--warning)_72%,var(--foreground))] ring-[color-mix(in_oklch,var(--warning)_30%,transparent)]",
  Stretch: "bg-muted text-muted-foreground ring-border",
};

export function MatchBadge({
  score,
  tier,
  size = "md",
  className,
}: {
  score: number;
  tier: MatchTier;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 rounded-full font-bold ring-1 ring-inset",
        size === "sm" && "px-2.5 py-1 text-xs",
        size === "md" && "px-3 py-1.5 text-sm",
        size === "lg" && "px-4 py-2 text-base",
        tierStyles[tier],
        className,
      )}
      aria-label={`${Math.round(score)} out of 100 match, ${tier}`}
    >
      <span className="font-display text-[1.1em] leading-none tabular-nums">
        {Math.round(score)}
      </span>
      <span className="text-[0.72em] font-semibold opacity-80">/100</span>
      <span className="ml-1 text-[0.72em] font-semibold uppercase tracking-wide opacity-80">
        {tier}
      </span>
    </span>
  );
}
