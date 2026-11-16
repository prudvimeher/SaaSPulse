import type { LucideIcon } from "lucide-react";
import { Zap } from "lucide-react";

export type InsightTrend = "positive" | "negative" | "neutral";

export interface Insight {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  trend: InsightTrend;
}

interface InsightsPanelProps {
  title: string;
  description: string;
  insights: Insight[];
}

export default function InsightsPanel({
  title,
  description,
  insights,
}: InsightsPanelProps) {
  return (
    <section className="insights-panel" aria-label={title}>
      <header className="insights-panel-header">
        <div className="insights-panel-header-icon" aria-hidden="true">
          <Zap size={18} strokeWidth={2} />
        </div>
        <div>
          <h2 className="insights-panel-title">{title}</h2>
          <p className="insights-panel-description">{description}</p>
        </div>
      </header>

      <ul className="insights-list" aria-label="Insights">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <li key={insight.id} className="insight-item">
              <div
                className={`insight-icon-wrap insight-icon-wrap-${insight.trend}`}
                aria-hidden="true"
              >
                <Icon size={16} strokeWidth={2.2} />
              </div>
              <div className="insight-body">
                <p className="insight-title">{insight.title}</p>
                <p className="insight-description">{insight.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

