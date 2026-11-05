import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-card/60 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: "safe" | "suspicious" | "dangerous" | "neutral";
  className?: string;
}

export function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  const variants: Record<string, string> = {
    safe: "bg-success/15 text-success border-success/30",
    suspicious: "bg-warning/15 text-warning border-warning/30",
    dangerous: "bg-danger/15 text-danger border-danger/30",
    neutral: "bg-primary/15 text-primary-light border-primary/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

interface RiskMeterProps {
  score: number;
  level: string;
}

export function RiskMeter({ score, level }: RiskMeterProps) {
  const color =
    level === "safe"
      ? "bg-success"
      : level === "suspicious"
        ? "bg-warning"
        : "bg-danger";
  const textColor =
    level === "safe"
      ? "text-success"
      : level === "suspicious"
        ? "text-warning"
        : "text-danger";

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className={`text-3xl font-bold ${textColor}`}>{score}</span>
        <span className="text-sm text-text-muted">/ 100</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${Math.max(score, 3)}%` }}
        />
      </div>
    </div>
  );
}
