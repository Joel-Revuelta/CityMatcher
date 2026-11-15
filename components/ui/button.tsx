import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "accent" | "soft";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-sm hover:brightness-110 active:brightness-95",
  secondary:
    "bg-foreground text-background shadow-sm hover:opacity-90 active:opacity-95",
  outline:
    "border border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted",
  ghost: "text-foreground hover:bg-muted",
  accent:
    "bg-accent text-accent-foreground shadow-sm hover:brightness-105 active:brightness-95",
  soft: "bg-primary-soft text-primary hover:brightness-[0.97]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 rounded-full px-3.5 text-sm gap-1.5",
  md: "h-11 rounded-full px-5 text-sm gap-2",
  lg: "h-12 rounded-full px-6 text-[0.95rem] gap-2",
  icon: "h-10 w-10 rounded-full",
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
    "inline-flex select-none items-center justify-center whitespace-nowrap font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-45",
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
