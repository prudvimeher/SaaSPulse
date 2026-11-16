import type { ChartDataPoint, ChartLegendItem } from "../components/dashboard/ChartPanel";

export const revenuePerformanceData: ChartDataPoint[] = [
  { month: "Jan", revenue: 31000 },
  { month: "Feb", revenue: 35500 },
  { month: "Mar", revenue: 39000 },
  { month: "Apr", revenue: 42800 },
  { month: "May", revenue: 45600 },
  { month: "Jun", revenue: 50000 },
];

export const revenuePlanData: ChartDataPoint[] = [
  { plan: "Pro", revenue: 24600 },
  { plan: "Starter", revenue: 12400 },
  { plan: "Business", revenue: 8400 },
  { plan: "Enterprise", revenue: 2800 },
];

export const revenuePlanLegend: ChartLegendItem[] = [
  { dataKey: "pro", label: "Pro", value: "$24,600", percentage: "51.0%", color: "#243f6b" },
  { dataKey: "starter", label: "Starter", value: "$12,400", percentage: "25.7%", color: "#536887" },
  { dataKey: "business", label: "Business", value: "$8,400", percentage: "17.4%", color: "#8b9ab3" },
  { dataKey: "enterprise", label: "Enterprise", value: "$2,800", percentage: "5.8%", color: "#c4ccda" },
];

export const revenueTrendData: ChartDataPoint[] = [
  { month: "Jan", mrr: 31000, arr: 372000 },
  { month: "Feb", mrr: 35500, arr: 426000 },
  { month: "Mar", mrr: 39000, arr: 468000 },
  { month: "Apr", mrr: 42800, arr: 513600 },
  { month: "May", mrr: 45600, arr: 547200 },
  { month: "Jun", mrr: 48200, arr: 578400 },
];

export const churnTrendData: ChartDataPoint[] = [
  { month: "Jan", churnRate: 5.6, retentionRate: 94.4 },
  { month: "Feb", churnRate: 5.1, retentionRate: 94.9 },
  { month: "Mar", churnRate: 5.2, retentionRate: 94.8 },
  { month: "Apr", churnRate: 4.8, retentionRate: 95.2 },
  { month: "May", churnRate: 4.5, retentionRate: 95.5 },
  { month: "Jun", churnRate: 4.2, retentionRate: 95.8 },
];

export const churnByPlanData: ChartDataPoint[] = [
  { plan: "Starter", churnRate: 6.2, churnedCustomers: 51 },
  { plan: "Pro", churnRate: 4.8, churnedCustomers: 60 },
  { plan: "Business", churnRate: 3.6, churnedCustomers: 8 },
  { plan: "Enterprise", churnRate: 2.1, churnedCustomers: 1 },
];

export const customerGrowthData: ChartDataPoint[] = [
  { month: "Jan", newCustomers: 132, lostCustomers: 52, netGrowth: 80 },
  { month: "Feb", newCustomers: 141, lostCustomers: 48, netGrowth: 93 },
  { month: "Mar", newCustomers: 138, lostCustomers: 49, netGrowth: 89 },
  { month: "Apr", newCustomers: 152, lostCustomers: 45, netGrowth: 107 },
  { month: "May", newCustomers: 160, lostCustomers: 43, netGrowth: 117 },
  { month: "Jun", newCustomers: 178, lostCustomers: 38, netGrowth: 140 },
];

export const customerGrowthLegend: ChartLegendItem[] = [
  { dataKey: "newCustomers", label: "New customers", color: "#7654c7" },
  { dataKey: "lostCustomers", label: "Lost customers", color: "#b9a9e6" },
  { dataKey: "netGrowth", label: "Net growth", color: "#243f6b" },
];

export const customerDistributionData: ChartDataPoint[] = [
  { status: "Active", customers: 2268 },
  { status: "Churned", customers: 24 },
  { status: "Trial", customers: 14 },
];

export const customerDistributionLegend: ChartLegendItem[] = [
  { dataKey: "active", label: "Active", value: "2,268", percentage: "98.4%", color: "#7654c7" },
  { dataKey: "churned", label: "Churned", value: "24", percentage: "1.0%", color: "#a99add" },
  { dataKey: "trial", label: "Trial", value: "14", percentage: "0.6%", color: "#ded8f3" },
];

export const customerRevenueHistories: Record<string, ChartDataPoint[]> = {
  "acme-tech": [
    { month: "Jan", revenue: 199 }, { month: "Feb", revenue: 199 }, { month: "Mar", revenue: 249 },
    { month: "Apr", revenue: 249 }, { month: "May", revenue: 249 }, { month: "Jun", revenue: 249 },
  ],
  "nova-systems": [
    { month: "Jan", revenue: 399 }, { month: "Feb", revenue: 399 }, { month: "Mar", revenue: 449 },
    { month: "Apr", revenue: 499 }, { month: "May", revenue: 499 }, { month: "Jun", revenue: 499 },
  ],
  "cloudlift": [
    { month: "Jan", revenue: 149 }, { month: "Feb", revenue: 199 }, { month: "Mar", revenue: 199 },
    { month: "Apr", revenue: 249 }, { month: "May", revenue: 249 }, { month: "Jun", revenue: 249 },
  ],
};

export const customerChartOptions = [
  { id: "acme-tech", name: "Acme Tech" },
  { id: "nova-systems", name: "Nova Systems" },
  { id: "cloudlift", name: "CloudLift" },
];
