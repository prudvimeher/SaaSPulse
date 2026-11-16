
import { DollarSign, UserMinus, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import ChartPanel from "../components/dashboard/ChartPanel";
import CustomerTable, { type CustomerRecord } from "../components/dashboard/CustomerTable";
import PageHeader from "../components/dashboard/PageHeader";
import MetricGrid, { type Metric } from "../components/dashboard/MetricGrid";
import { customerChartOptions, customerRevenueHistories } from "../data/dashboardCharts";
import { availablePlans, availableStatuses, customers } from "../data/dashboardTables";

const metrics: Metric[] = [
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
    id: "average-subscription-value",
    title: "Avg. Subscription Value",
    value: "$20.90",
    icon: DollarSign,
    change: 3.8,
    changeLabel: "+3.8%",
    trend: "positive",
    sparklineData: [18.2, 18.4, 18.9, 19.1, 19.6, 20.1, 20.9],
  },
];

export default function Customers() {
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerChartOptions[0].id);
  const [selectedTableCustomerId, setSelectedTableCustomerId] = useState(customers[0].id);
  const selectedCustomer = customerChartOptions.find((customer) => customer.id === selectedCustomerId)
    ?? customerChartOptions[0];

  return (
    <>
      <PageHeader
        category="Customer Management"
        title="Customer 360"
        description="Search, filter, and inspect individual customers and their subscription details."
      />

      <MetricGrid metrics={metrics} />

      <section className="dashboard-table-section">
        <CustomerTable
          customers={customers}
          availablePlans={availablePlans}
          availableStatuses={availableStatuses}
          selectedCustomerId={selectedTableCustomerId}
          onSelectCustomer={(customer: CustomerRecord) => setSelectedTableCustomerId(customer.id)}
        />
      </section>

      <section className="dashboard-chart-grid dashboard-chart-grid-single">
        <ChartPanel
          title="Customer Revenue History"
          description={`Monthly revenue history for ${selectedCustomer.name}.`}
          chartType="line"
          chartData={customerRevenueHistories[selectedCustomer.id]}
          dataKeys={["revenue"]}
          showTooltip={true}
          valueFormatter={(value) => `$${Number(value).toLocaleString()}`}
          headerAction={
            <label className="chart-select-label">
              <span className="sr-only">Select customer</span>
              <select value={selectedCustomerId} onChange={(event) => setSelectedCustomerId(event.target.value)}>
                {customerChartOptions.map((customer) => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </label>
          }
        />
      </section>
    </>
  );
}
