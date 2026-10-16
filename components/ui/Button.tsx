import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "border border-transparent bg-accent text-white hover:bg-accent-hover",
  secondary: "border border-border bg-card text-ink hover:bg-canvas",
  danger: "border border-danger/30 bg-card text-danger hover:bg-danger-soft",
  ghost: "border border-transparent bg-transparent text-muted hover:bg-canvas",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "text-[13px] px-3 py-1.5",
  md: "text-sm px-4 py-2.5",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ variant = "secondary", size = "md", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function LinkButton({ href, variant = "secondary", size = "md", className = "", ...props }: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}
