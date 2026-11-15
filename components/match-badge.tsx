import { cn } from "@/lib/utils";
import type { MatchTier } from "@/lib/types";

const tierStyles: Record<MatchTier, string> = {
  Excellent: "text-primary",
  Strong: "text-foreground",
  Fair: "text-warning",
  Stretch: "text-muted-foreground",
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
    <div
      className={cn(
        "flex items-baseline border-l-2 border-primary pl-2.5",
        size === "sm" && "gap-1",
        size === "md" && "gap-1.5",
        size === "lg" && "gap-2 pl-3",
        className,
      )}
      aria-label={`${Math.round(score)} out of 100 match, ${tier}`}
    >
      <span
        className={cn(
          "font-mono font-medium leading-none tabular-nums",
          size === "sm" && "text-lg",
          size === "md" && "text-2xl",
          size === "lg" && "text-4xl",
        )}
      >
        {Math.round(score)}
      </span>
      <span className="font-mono text-[0.6em] leading-none text-muted-foreground">
        /100
      </span>
      <span
        className={cn(
          "font-medium leading-none",
          size === "sm" && "text-xs",
          size === "md" && "text-xs",
          size === "lg" && "text-sm",
          tierStyles[tier],
        )}
      >
        {tier}
      </span>
    </div>
  );
}
