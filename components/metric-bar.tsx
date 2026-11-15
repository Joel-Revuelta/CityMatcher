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
      ? "var(--success)"
      : score >= 55
        ? "var(--primary)"
        : score >= 40
          ? "var(--warning)"
          : "var(--danger)";

  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-foreground/85">
          {icon ? (
            <span className="text-muted-foreground" aria-hidden="true">
              {icon}
            </span>
          ) : null}
          <span className="truncate">{label}</span>
        </span>
        <span className="shrink-0 text-xs font-bold tabular-nums text-foreground">
          {Math.round(score)}
        </span>
      </div>
      <div
        className={cn(
          "overflow-hidden rounded-full bg-muted",
          compact ? "h-1.5" : "h-2",
        )}
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(score)}
        aria-valuetext={`${Math.round(score)} out of 100`}
        title={hint}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${Math.max(2, Math.min(100, score))}%`, backgroundColor: tone }}
        />
      </div>
      {hint ? (
        <p className="mt-1.5 text-[0.7rem] leading-snug text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
