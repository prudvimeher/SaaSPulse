import type {
  AccountStatus,
  Customer,
  SortDirection,
  SortField,
  SubscriptionPlan,
} from './customer.ts'

export type DateRangeKey =
  | 'Last 7 Days'
  | 'Last 30 Days'
  | 'Last 90 Days'
  | 'Last 6 Months'
  | 'Last 12 Months'
  | 'Custom Date Range'

export interface CustomDateRange {
  startDate: string
  endDate: string
}

export type DashboardPlan = SubscriptionPlan

export type TrendDirection = 'up' | 'down'

export interface TrendPoint {
  month: string
  fullLabel: string
  mrr: number
  arr: number
}

export interface PlanBreakdownSlice {
  plan: string
  amount: number
  percentage: number
  color: string
  countLabel?: string
}

export interface RecentCustomerRow {
  id: string
  name: string
  initials: string
  plan: SubscriptionPlan
  mrr: number
  status: AccountStatus
  signedUp: string
}

export interface InsightData {
  id: string
  icon: 'trendUp' | 'trendDown' | 'users' | 'layers' | 'chart'
  title: string
  description: string
}

export interface PlanPerformanceRow {
  plan: DashboardPlan
  color: string
  customers: number
  mrr: number
  arr: number
  momGrowth: string
  sharePercent: string
}

export interface ChurnTrendPoint {
  month: string
  fullLabel: string
  churnRate: number
  retentionRate: number
}

export interface PlanChurnRow {
  plan: DashboardPlan
  color: string
  churnRate: number
  customers: number
}

export type ChurnReason = 'Price' | 'Not using' | 'Missing features' | 'Other'

export interface ChurnedCustomerRow {
  id: string
  name: string
  initials: string
  plan: SubscriptionPlan
  mrr: number
  activeFor: string
  churnedOn: string
  churnedDate: string
  reason: ChurnReason
}

export interface GrowthTrendPoint {
  month: string
  fullLabel: string
  newCustomers: number
  lostCustomers: number
  netGrowth: number
}

export interface PlanGrowthRow {
  plan: DashboardPlan
  color: string
  startCustomers: number
  newCustomers: number
  lostCustomers: number
  endCustomers: number
  netGrowth: number
  growthPercent: string
}

export interface ExecutiveOverviewResponse {
  mrr: number
  arr: number
  totalCustomers: number
  churnRate: number
  mrrChange: string
  mrrTrend: TrendDirection
  customersChange: string
  customersTrend: TrendDirection
  churnChange: string
  churnTrendDirection: TrendDirection
  mrrSparkline: number[]
  arrSparkline: number[]
  customersSparkline: number[]
  churnSparkline: number[]
  revenueSeries: TrendPoint[]
  planSlices: PlanBreakdownSlice[]
  recentCustomers: RecentCustomerRow[]
  insights: InsightData[]
  comparisonLabel: string
  limitationNote: string | null
  startDate: string
  endDate: string
}

export interface RevenueIntelligenceResponse {
  mrr: number
  arr: number
  revenueGrowth: string
  revenueGrowthChange: string
  revenueGrowthTrend: TrendDirection
  mrrChange: string
  mrrTrend: TrendDirection
  arpu: number
  arpuChange: string
  arpuTrend: TrendDirection
  mrrSparkline: number[]
  arrSparkline: number[]
  growthSparkline: number[]
  arpuSparkline: number[]
  revenueSeries: TrendPoint[]
  planSlices: PlanBreakdownSlice[]
  planPerformance: PlanPerformanceRow[]
  insights: InsightData[]
  comparisonLabel: string
  limitationNote: string | null
  startDate: string
  endDate: string
}

export interface CustomerRetentionResponse {
  churnRate: number
  retentionRate: number
  lostCustomers: number
  newCustomers: number
  churnChange: string
  churnTrendDirection: TrendDirection
  retentionChange: string
  retentionTrendDirection: TrendDirection
  lostChange: string
  lostTrendDirection: TrendDirection
  newChange: string
  newTrendDirection: TrendDirection
  churnSparkline: number[]
  retentionSparkline: number[]
  lostSparkline: number[]
  newSparkline: number[]
  churnTrend: ChurnTrendPoint[]
  churnByPlan: PlanChurnRow[]
  recentlyChurned: ChurnedCustomerRow[]
  insights: InsightData[]
  comparisonLabel: string
  limitationNote: string | null
  startDate: string
  endDate: string
}

export interface CustomerGrowthResponse {
  newCustomers: number
  activeCustomers: number
  lostCustomers: number
  netGrowth: number
  totalCustomers: number
  newChange: string
  newTrendDirection: TrendDirection
  activeChange: string
  activeTrendDirection: TrendDirection
  lostChange: string
  lostTrendDirection: TrendDirection
  netChange: string
  netTrendDirection: TrendDirection
  newSparkline: number[]
  activeSparkline: number[]
  lostSparkline: number[]
  netSparkline: number[]
  growthTrend: GrowthTrendPoint[]
  distributionSlices: PlanBreakdownSlice[]
  planGrowth: PlanGrowthRow[]
  insights: InsightData[]
  comparisonLabel: string
  limitationNote: string | null
  startDate: string
  endDate: string
}

export interface CustomerSummaryResponse {
  totalCustomers: number
  newCustomers: number
  lostCustomers: number
  avgSubscriptionValue: number
  totalChange: string
  totalTrend: TrendDirection
  newChange: string
  newTrend: TrendDirection
  lostChange: string
  lostTrend: TrendDirection
  avgValueChange: string
  avgValueTrend: TrendDirection
  totalSparkline: number[]
  newSparkline: number[]
  lostSparkline: number[]
  avgValueSparkline: number[]
  comparisonLabel: string
  limitationNote: string | null
  startDate: string
  endDate: string
}

export interface CustomerListParams {
  search?: string
  plan?: 'All' | SubscriptionPlan
  status?: 'All' | AccountStatus
  sortBy?: SortField
  sortDir?: SortDirection
  page?: number
  pageSize?: number
  dateRange?: DateRangeKey
  startDate?: string
  endDate?: string
}

export interface CustomerListResponse {
  items: Customer[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
