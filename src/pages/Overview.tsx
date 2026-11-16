
import { Calendar, Layers, RefreshCw, Users } from "lucide-react";
import ChartPanel from "../components/dashboard/ChartPanel";
import DataTable, { type DataTableColumn } from "../components/dashboard/DataTable";
import InsightsPanel from "../components/dashboard/InsightsPanel";
import PageHeader from "../components/dashboard/PageHeader";
import MetricGrid, { type Metric } from "../components/dashboard/MetricGrid";
import { revenuePerformanceData, revenuePlanData, revenuePlanLegend } from "../data/dashboardCharts";
import { overviewInsights } from "../data/dashboardInsights";
import { recentCustomers, type RecentCustomer } from "../data/dashboardTables";

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
    id: "total-customers",
    title: "Total Customers",
    value: "2,306",
    icon: Users,
    change: 8.4,
    changeLabel: "+8.4%",
    trend: "positive",
    sparklineData: [1980, 2010, 2055, 2080, 2150, 2210, 2306],
  },
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
];

const recentCustomerColumns: DataTableColumn<RecentCustomer>[] = [
  { key: "customer", label: "Customer" },
  { key: "plan", label: "Plan", render: (row) => <span className="table-badge table-badge-plan">{row.plan}</span> },
  { key: "mrr", label: "MRR", align: "right" },
  { key: "status", label: "Status", render: (row) => <span className="table-badge table-badge-status active">{row.status}</span> },
  { key: "signedUp", label: "Signed Up", align: "right" },
];

export default function Overview() {
  return (
    <>
      <PageHeader
        category="Executive Dashboard"
        title="Executive Overview"
        description="A real-time snapshot of your business performance, revenue, and customers."
        showComparison={true}
        showFilter={true}
      />

      <MetricGrid metrics={metrics} />

      <section className="dashboard-chart-grid dashboard-chart-grid-primary">
        <ChartPanel
          title="Revenue Performance"
          description="Monthly recurring revenue (MRR) over time."
          chartType="line"
          chartData={revenuePerformanceData}
          dataKeys={["revenue"]}
          showTooltip={true}
        />
        <ChartPanel
          title="Revenue by Subscription Plan"
          description="MRR distribution across subscription plans."
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
          title="Recent Customers"
          description="Latest customers who signed up for a paid plan."
          columns={recentCustomerColumns}
          rows={recentCustomers}
          rowKey="id"
          showHeader={true}
          emptyMessage="No recent customers to display."
        />
        <InsightsPanel
          title="Key Insights"
          description="Notable changes from the previous period."
          insights={overviewInsights}
        />
      </section>
    </>
  );
}
