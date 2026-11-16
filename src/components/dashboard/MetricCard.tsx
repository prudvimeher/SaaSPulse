
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change: number;
  changeLabel: string;
  trend: "positive" | "negative" | "neutral";
  sparklineData?: number[];
}

export default function MetricCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
  trend,
  sparklineData = [],
}: MetricCardProps) {
  const sparklinePoints = sparklineData
    .map((point, index) => {
      const x =
        (index / Math.max(sparklineData.length - 1, 1)) * 100;

      const min = Math.min(...sparklineData);
      const max = Math.max(...sparklineData);
      const range = max - min || 1;

      const y = 32 - ((point - min) / range) * 27;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <article className="metric-card">
      <div className="metric-card-main">

        <div className="metric-icon">
          <Icon size={23} strokeWidth={1.8} />
        </div>

        <div className="metric-details">
          <h3 className="metric-title">{title}</h3>

          <p className="metric-value">{value}</p>

          <div className="metric-comparison">
            <span
              className={`metric-change ${trend}`}
              aria-label={`${change}% change`}
            >
              {trend === "positive" ? "↗" :
               trend === "negative" ? "↘" : "→"}

              {changeLabel}
            </span>

            <span className="comparison-label">
              vs. previous period
            </span>
          </div>
        </div>

      </div>

      {sparklineData.length >= 2 && (
        <div className="metric-sparkline">
          <svg
            viewBox="0 0 100 36"
            preserveAspectRatio="none"
            role="img"
            aria-label={`Trend for ${title}`}
          >
            <polyline
              points={sparklinePoints}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

    </article>
  );
}
