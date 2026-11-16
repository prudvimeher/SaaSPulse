
import { TrendingUp, UserCheck, UserMinus, UserPlus } from "lucide-react";
import ChartPanel from "../components/dashboard/ChartPanel";
import DataTable, { type DataTableColumn } from "../components/dashboard/DataTable";
import InsightsPanel from "../components/dashboard/InsightsPanel";
import PageHeader from "../components/dashboard/PageHeader";
import MetricGrid, { type Metric } from "../components/dashboard/MetricGrid";
import { customerDistributionData, customerDistributionLegend, customerGrowthData, customerGrowthLegend } from "../data/dashboardCharts";
import { growthInsights } from "../data/dashboardInsights";
import { growthByPlan, type GrowthByPlan } from "../data/dashboardTables";

const metrics: Metric[] = [
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
  {
    id: "active-customers",
    title: "Active Customers",
    value: "2,268",
    icon: UserCheck,
    change: 9.1,
    changeLabel: "+9.1%",
    trend: "positive",
    sparklineData: [1960, 2010, 2050, 2110, 2175, 2230, 2268],
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
    id: "net-customer-growth",
    title: "Net Customer Growth",
    value: "+140",
    icon: TrendingUp,
    change: 16.7,
    changeLabel: "+16.7%",
    trend: "positive",
    sparklineData: [80, 93, 89, 107, 117, 128, 140],
  },
];

const growthColumns: DataTableColumn<GrowthByPlan>[] = [
  { key: "plan", label: "Plan", render: (row) => <span className="table-badge table-badge-plan">{row.plan}</span> },
  { key: "startingCustomers", label: "Customers (Start)", align: "right" },
  { key: "newCustomers", label: "New", align: "right" },
  { key: "lostCustomers", label: "Lost", align: "right" },
  { key: "endingCustomers", label: "Customers (End)", align: "right" },
  { key: "growth", label: "Growth", align: "right" },
  { key: "growthPercent", label: "Growth %", align: "right", render: (row) => <span className="table-badge table-badge-growth">↗ {row.growthPercent}</span> },
];

export default function Growth() {
  return (
    <>
      <PageHeader
        category="Customer Analytics"
        title="Customer Growth"
        description="Track customer acquisition, growth, and changes in your customer base over time."
        showComparison={true}
        showFilter={true}
      />

      <MetricGrid metrics={metrics} />

      <section className="dashboard-chart-grid dashboard-chart-grid-primary dashboard-chart-grid-growth">
        <ChartPanel
          title="Customer Growth Trend"
          description="New, lost, and net customer growth over time."
          chartType="composed"
          chartData={customerGrowthData}
          dataKeys={["newCustomers", "lostCustomers"]}
          lineDataKey="netGrowth"
          legend={customerGrowthLegend}
          showLegend={true}
          showTooltip={true}
        />
        <ChartPanel
          title="Customer Distribution"
          description="Customer distribution by account status."
          chartType="doughnut"
          chartData={customerDistributionData}
          dataKeys={["customers"]}
          legend={customerDistributionLegend}
          showLegend={true}
          showTooltip={true}
          centerValue="2,306"
          centerLabel="Total Customers"
        />
      </section>

      <section className="dashboard-bottom-grid">
        <DataTable
          title="Customer Growth by Subscription Plan"
          description="Change in customer count by subscription plan for the selected period."
          columns={growthColumns}
          rows={growthByPlan}
          rowKey="id"
          showHeader={true}
          emptyMessage="No subscription plan growth data to display."
        />
        <InsightsPanel
          title="Key Growth Insights"
          description="Important changes in your customer growth."
          insights={growthInsights}
        />
      </section>
    </>
  );
}
