
import { Heart, RefreshCw, UserMinus, UserPlus } from "lucide-react";
import { useState } from "react";
import ChartPanel from "../components/dashboard/ChartPanel";
import DataTable, { type DataTableColumn } from "../components/dashboard/DataTable";
import InsightsPanel from "../components/dashboard/InsightsPanel";
import PageHeader from "../components/dashboard/PageHeader";
import MetricGrid, { type Metric } from "../components/dashboard/MetricGrid";
import { churnByPlanData, churnTrendData } from "../data/dashboardCharts";
import { retentionInsights } from "../data/dashboardInsights";
import { recentlyChurnedCustomers, type ChurnedCustomer } from "../data/dashboardTables";

const metrics: Metric[] = [
  {
    id: "churn-rate",
    title: "Churn Rate",
    value: "4.2%",
    icon: RefreshCw,
    change: -1.3,
    changeLabel: "-1.3 pp",
    trend: "negative",
    sparklineData: [5.6, 5.1, 5.2, 4.8, 4.6, 4.3, 4.2],
  },
  {
    id: "retention-rate",
    title: "Retention Rate",
    value: "95.8%",
    icon: Heart,
    change: 1.3,
    changeLabel: "+1.3 pp",
    trend: "positive",
    sparklineData: [94.4, 94.9, 94.8, 95.2, 95.4, 95.7, 95.8],
  },
  {
    id: "lost-customers",
    title: "Lost Customers",
    value: "38",
    icon: UserMinus,
    change: -12.8,
    changeLabel: "-12.8%",
    trend: "positive",
    sparklineData: [52, 48, 49, 45, 43, 41, 38],
  },
  {
    id: "new-customers",
    title: "New Customers",
    value: "178",
    icon: UserPlus,
    change: 8.4,
    changeLabel: "+8.4%",
    trend: "positive",
    sparklineData: [132, 141, 138, 152, 160, 169, 178],
  },
];

const churnedCustomerColumns: DataTableColumn<ChurnedCustomer>[] = [
  { key: "customer", label: "Customer" },
  { key: "plan", label: "Plan", render: (row) => <span className="table-badge table-badge-plan">{row.plan}</span> },
  { key: "mrr", label: "MRR", align: "right" },
  { key: "activeFor", label: "Active For", align: "right" },
  { key: "churnedOn", label: "Churned On", align: "right" },
  { key: "reason", label: "Reason", render: (row) => <span className="table-badge table-badge-reason">{row.reason}</span> },
];

export default function Retention() {
  const [selectedMetric, setSelectedMetric] = useState<"churnRate" | "retentionRate">("churnRate");

  return (
    <>
      <PageHeader
        category="Customer Analytics"
        title="Customer Retention"
        description="Analyze churn, retention, and customer health across subscription plans."
        showComparison={true}
        showFilter={true}
      />

      <MetricGrid metrics={metrics} />

      <section className="dashboard-chart-grid dashboard-chart-grid-primary">
        <ChartPanel
          title="Churn Rate Trend"
          description="Monthly churn and retention performance over time."
          chartType="line"
          chartData={churnTrendData}
          dataKeys={[selectedMetric]}
          showTooltip={true}
          valueFormatter={(value) => `${value}%`}
          headerAction={
            <div className="chart-toggle" aria-label="Retention metric">
              <button className={selectedMetric === "churnRate" ? "active" : ""} onClick={() => setSelectedMetric("churnRate")}>Churn</button>
              <button className={selectedMetric === "retentionRate" ? "active" : ""} onClick={() => setSelectedMetric("retentionRate")}>Retention</button>
            </div>
          }
        />
        <ChartPanel
          title="Churn by Subscription Plan"
          description="Churn rate by subscription plan."
          chartType="horizontal-bar"
          chartData={churnByPlanData}
          dataKeys={["churnRate"]}
          barLabelDataKey="churnedCustomers"
          barLabelFormatter={(value) => `${value} customers`}
          showTooltip={true}
          valueFormatter={(value) => `${value}%`}
        />
      </section>

      <section className="dashboard-bottom-grid">
        <DataTable
          title="Recently Churned Customers"
          description="Customers who cancelled their subscription in the selected period."
          columns={churnedCustomerColumns}
          rows={recentlyChurnedCustomers}
          rowKey="id"
          showHeader={true}
          emptyMessage="No churned customers to display."
        />
        <InsightsPanel
          title="Retention Insights"
          description="Key takeaways from your customer retention data."
          insights={retentionInsights}
        />
      </section>
    </>
  );
}
