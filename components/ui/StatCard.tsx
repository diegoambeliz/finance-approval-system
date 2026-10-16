import type { ReactNode } from "react";

export type StatTone = "accent" | "success" | "warning" | "danger" | "neutral";

const dotClasses: Record<StatTone, string> = {
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  neutral: "bg-neutral",
};

export function StatCard({
  label,
  value,
  tone = "accent",
}: {
  label: string;
  value: ReactNode;
  tone?: StatTone;
}) {
  return (
    <div className="rounded-card border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted">{label}</span>
        <span className={`h-2 w-2 rounded-full ${dotClasses[tone]}`} />
      </div>
      <div className="mt-3 text-[28px] font-bold text-ink">{value}</div>
    </div>
  );
}
