
import { Calendar, DollarSign, Layers, TrendingUp } from "lucide-react";
import { useState } from "react";
import ChartPanel from "../components/dashboard/ChartPanel";
import DataTable, { type DataTableColumn } from "../components/dashboard/DataTable";
import InsightsPanel from "../components/dashboard/InsightsPanel";
import PageHeader from "../components/dashboard/PageHeader";
import MetricGrid, { type Metric } from "../components/dashboard/MetricGrid";
import { revenuePlanData, revenuePlanLegend, revenueTrendData } from "../data/dashboardCharts";
import { revenueInsights } from "../data/dashboardInsights";
import { planPerformance, type PlanPerformance } from "../data/dashboardTables";

const metrics: Metric[] = [
  {
    id: "mrr",
    title: "MRR",
    value: "$48,200",
    icon: Layers,
    change: 12.5,
    changeLabel: "+12.5%",
    trend: "positive",
    sparklineData: [32, 36, 34, 40, 38, 45, 48],
  },
  {
    id: "arr",
    title: "ARR",
    value: "$578,400",
    icon: Calendar,
    change: 12.5,
    changeLabel: "+12.5%",
    trend: "positive",
    sparklineData: [380, 410, 398, 455, 430, 510, 578],
  },
  {
    id: "revenue-growth",
    title: "Revenue Growth",
    value: "12.5%",
    icon: TrendingUp,
    change: 2.1,
    changeLabel: "+2.1 pp",
    trend: "positive",
    sparklineData: [6.2, 7.8, 8.4, 9.1, 10.3, 11.2, 12.5],
  },
  {
    id: "average-revenue",
    title: "Avg. Revenue per Customer",
    value: "$20.90",
    icon: DollarSign,
    change: 3.8,
    changeLabel: "+3.8%",
    trend: "positive",
    sparklineData: [18.2, 18.4, 18.9, 19.1, 19.6, 20.1, 20.9],
  },
];

const planColumns: DataTableColumn<PlanPerformance>[] = [
  { key: "plan", label: "Plan", render: (row) => <span className="table-badge table-badge-plan">{row.plan}</span> },
  { key: "customers", label: "Customers", align: "right" },
  { key: "mrr", label: "MRR", align: "right" },
  { key: "arr", label: "ARR", align: "right" },
  { key: "growth", label: "MoM Growth", align: "right", render: (row) => <span className="table-badge table-badge-growth">↗ {row.growth}</span> },
  { key: "share", label: "% of MRR", align: "right" },
];

export default function Revenue() {
  const [selectedMetric, setSelectedMetric] = useState<"mrr" | "arr">("mrr");

  return (
    <>
      <PageHeader
        category="Revenue Analytics"
        title="Revenue Intelligence"
        description="Track MRR, ARR, and revenue performance across time and subscription plans."
        showComparison={true}
        showFilter={true}
      />

      <MetricGrid metrics={metrics} />

      <section className="dashboard-chart-grid dashboard-chart-grid-primary">
        <ChartPanel
          title="MRR & ARR Trend"
          description="Monthly recurring revenue and annual recurring revenue over time."
          chartType="line"
          chartData={revenueTrendData}
          dataKeys={[selectedMetric]}
          showTooltip={true}
          valueFormatter={(value) => `$${Number(value).toLocaleString()}`}
          headerAction={
            <div className="chart-toggle" aria-label="Revenue metric">
              <button className={selectedMetric === "mrr" ? "active" : ""} onClick={() => setSelectedMetric("mrr")}>MRR</button>
              <button className={selectedMetric === "arr" ? "active" : ""} onClick={() => setSelectedMetric("arr")}>ARR</button>
            </div>
          }
        />
        <ChartPanel
          title="Revenue Breakdown"
          description="MRR distribution by subscription plan."
          chartType="doughnut"
          chartData={revenuePlanData}
          dataKeys={["revenue"]}
          legend={revenuePlanLegend}
          showLegend={true}
          showTooltip={true}
          centerValue="$48,200"
          centerLabel="Total MRR"
        />
      </section>

      <section className="dashboard-bottom-grid">
        <DataTable
          title="Subscription Plan Performance"
          description="Revenue, customers, and growth by subscription plan."
          columns={planColumns}
          rows={planPerformance}
          rowKey="id"
          showHeader={true}
          emptyMessage="No subscription plan data to display."
        />
        <InsightsPanel
          title="Key Revenue Insights"
          description="Notable revenue changes and trends for the selected period."
          insights={revenueInsights}
        />
      </section>
    </>
  );
}
