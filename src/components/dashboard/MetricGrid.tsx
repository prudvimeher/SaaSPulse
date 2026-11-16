import type { LucideIcon } from "lucide-react";
import MetricCard from "./MetricCard";

export interface Metric {
  id: string;
  title: string;
  value: string | number;
  icon: LucideIcon;
  change: number;
  changeLabel: string;
  trend: "positive" | "negative" | "neutral";
  sparklineData: number[];
}

interface MetricGridProps {
  metrics: Metric[];
}

export default function MetricGrid({ metrics }: MetricGridProps) {
  return (
    <section className="metric-grid" aria-label="Key metrics">
      {metrics.map(({ id, ...metric }) => (
        <MetricCard key={id} {...metric} />
      ))}
    </section>
  );
}
