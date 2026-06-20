import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium " +
  "transition-[transform,background-color,box-shadow,border-color,color] duration-200 ease-[var(--ease-out-soft)] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "disabled:pointer-events-none disabled:opacity-55 active:scale-[0.97]";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-600 text-white shadow-brand hover:bg-brand-700 hover:-translate-y-px",
  secondary:
    "border border-border bg-surface text-foreground shadow-soft hover:border-brand-300 hover:bg-brand-50/60",
  ghost: "text-muted hover:bg-brand-100/50 hover:text-foreground",
  danger:
    "border border-border text-muted hover:border-red-300 hover:bg-red-50 hover:text-red-600",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md") {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return <button className={`${buttonClass(variant, size)} ${className}`} {...props} />;
}

// Shared raised surface — warm hairline + tinted shadow, never border+shadow generic.
export function cardClass(className = "") {
  return `rounded-2xl border border-border bg-surface shadow-card ${className}`;
}

export function Card({
  as: Tag = "div",
  className = "",
  children,
}: {
  as?: "div" | "section" | "article" | "li" | "aside";
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={cardClass(className)}>{children}</Tag>;
}

type Tone = "brand" | "green" | "amber" | "red" | "blue" | "neutral";

const TONES: Record<Tone, string> = {
  brand: "bg-brand-100 text-brand-800 ring-brand-200",
  green: "bg-green-100 text-green-800 ring-green-200",
  amber: "bg-amber-100 text-amber-800 ring-amber-200",
  red: "bg-red-100 text-red-700 ring-red-200",
  blue: "bg-blue-100 text-blue-800 ring-blue-200",
  neutral: "bg-stone-100 text-stone-600 ring-stone-200",
};

export function Badge({
  tone = "neutral",
  className = "",
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
