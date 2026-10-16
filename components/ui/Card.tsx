import type { HTMLAttributes, ReactNode } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-card border border-border bg-card shadow-card ${className}`} {...props} />;
}

export function CardHeader({
  title,
  action,
  className = "",
}: {
  title: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 border-b border-border px-5 py-4 ${className}`}>
      <div className="text-base font-semibold text-ink">{title}</div>
      {action}
    </div>
  );
}
