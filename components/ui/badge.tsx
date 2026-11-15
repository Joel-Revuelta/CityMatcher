import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "outline";

const tones: Record<Tone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  primary: "border-primary/30 bg-primary-soft text-primary",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/35 bg-warning/10 text-warning",
  danger: "border-danger/30 bg-danger/10 text-danger",
  outline: "border-border bg-transparent text-foreground",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-1 text-xs font-medium leading-none",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
