import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "accent" | "soft";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "border border-primary bg-primary text-primary-foreground hover:bg-[color-mix(in_srgb,var(--primary)_88%,black)]",
  secondary:
    "border border-foreground bg-foreground text-background hover:bg-[color-mix(in_srgb,var(--foreground)_88%,white)]",
  outline:
    "border border-foreground/35 bg-transparent text-foreground hover:border-foreground hover:bg-muted",
  ghost: "border border-transparent text-foreground hover:bg-muted",
  accent:
    "border border-primary bg-primary text-primary-foreground hover:bg-[color-mix(in_srgb,var(--primary)_88%,black)]",
  soft: "border border-primary/25 bg-primary-soft text-primary hover:border-primary/50",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-11 w-11",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}): string {
  return cn(
    "inline-flex select-none items-center justify-center gap-2 rounded-none font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40",
    variants[variant],
    sizes[size],
    className,
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
}
