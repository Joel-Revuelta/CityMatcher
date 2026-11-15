import { cn } from "@/lib/utils";

export function MetricBar({
  label,
  score,
  icon,
  hint,
  compact = false,
  className,
}: {
  label: string;
  score: number;
  icon?: React.ReactNode;
  hint?: string;
  compact?: boolean;
  className?: string;
}) {
  const tone =
    score >= 75
      ? "var(--foreground)"
      : score >= 55
        ? "var(--primary)"
        : score >= 40
          ? "var(--warning)"
          : "var(--danger)";

  return (
    <div className={cn("border-b border-border/70 py-2.5 last:border-0", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-sm text-foreground">
          {icon ? (
            <span className="text-muted-foreground" aria-hidden="true">
              {icon}
            </span>
          ) : null}
          <span className="truncate">{label}</span>
        </span>
        <span className="shrink-0 font-mono text-xs tabular-nums text-foreground">
          {Math.round(score)}
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-3">
        <div
          className={cn("flex-1 overflow-hidden bg-muted", compact ? "h-1" : "h-1.5")}
          role="meter"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(score)}
          aria-valuetext={`${Math.round(score)} out of 100`}
          title={hint}
        >
          <div
            className="h-full transition-[width] duration-500"
            style={{ width: `${Math.max(1.5, Math.min(100, score))}%`, backgroundColor: tone }}
          />
        </div>
      </div>
      {hint ? (
        <p className="mt-1.5 text-xs leading-snug text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
