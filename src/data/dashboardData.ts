import type { AccountStatus, SubscriptionPlan } from '../types/customer'

export type DateRangeKey =
  | 'Last 30 Days'
  | 'Last 90 Days'
  | 'Last 6 Months'
  | 'Last 12 Months'

export const DATE_RANGE_OPTIONS: readonly DateRangeKey[] = [
  'Last 30 Days',
  'Last 90 Days',
  'Last 6 Months',
  'Last 12 Months',
]

export const COMPARISON_LABELS: Record<DateRangeKey, string> = {
  'Last 30 Days': 'vs. Previous 30 Days',
  'Last 90 Days': 'vs. Previous 90 Days',
  'Last 6 Months': 'vs. Previous 6 Months',
  'Last 12 Months': 'vs. Previous 12 Months',
}

export type DashboardPlan = SubscriptionPlan | 'Enterprise'

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

export interface ChurnedCustomerRow {
  id: string
  name: string
  initials: string
  plan: SubscriptionPlan
  mrr: number
  activeFor: string
  churnedOn: string
  reason: 'Price' | 'Not using' | 'Missing features' | 'Other'
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

const SCALE_MULTIPLIERS: Record<DateRangeKey, number> = {
  'Last 30 Days': 0.94,
  'Last 90 Days': 0.97,
  'Last 6 Months': 1,
  'Last 12 Months': 1.06,
}

export function getExecutiveOverviewData(dateRange: DateRangeKey) {
  const scale = SCALE_MULTIPLIERS[dateRange]
  const mrr = Math.round((48200 * scale) / 100) * 100
  const arr = mrr * 12
  const totalCustomers = Math.round(2306 * scale)
  const churnRate =
    dateRange === 'Last 30 Days'
      ? 3.9
      : dateRange === 'Last 90 Days'
        ? 4.1
        : dateRange === 'Last 12 Months'
          ? 4.5
          : 4.2

  const revenueSeries: TrendPoint[] = [
    { month: 'Jan', fullLabel: 'Jan 2024', mrr: Math.round(31200 * scale), arr: Math.round(31200 * scale) * 12 },
    { month: 'Feb', fullLabel: 'Feb 2024', mrr: Math.round(35600 * scale), arr: Math.round(35600 * scale) * 12 },
    { month: 'Mar', fullLabel: 'Mar 2024', mrr: Math.round(39400 * scale), arr: Math.round(39400 * scale) * 12 },
    { month: 'Apr', fullLabel: 'Apr 2024', mrr: Math.round(42800 * scale), arr: Math.round(42800 * scale) * 12 },
    { month: 'May', fullLabel: 'May 2024', mrr: Math.round(45600 * scale), arr: Math.round(45600 * scale) * 12 },
    { month: 'Jun', fullLabel: 'Jun 2024', mrr, arr },
  ]

  const planSlices: PlanBreakdownSlice[] = [
    { plan: 'Pro', amount: Math.round(24600 * scale), percentage: 51.0, color: '#64748B' },
    { plan: 'Starter', amount: Math.round(12400 * scale), percentage: 25.7, color: '#94A3B8' },
    { plan: 'Business', amount: Math.round(8400 * scale), percentage: 17.4, color: '#CBD5E1' },
    { plan: 'Enterprise', amount: Math.round(2800 * scale), percentage: 5.8, color: '#E2E8F0' },
  ]

  const recentCustomers: RecentCustomerRow[] = [
    {
      id: 'cust-001',
      name: 'Acme Tech',
      initials: 'AT',
      plan: 'Pro',
      mrr: 249,
      status: 'Active',
      signedUp: 'Jun 18, 2024',
    },
    {
      id: 'cust-002',
      name: 'Nova Systems',
      initials: 'NS',
      plan: 'Business',
      mrr: 499,
      status: 'Active',
      signedUp: 'Jun 16, 2024',
    },
    {
      id: 'cust-003',
      name: 'CloudLift',
      initials: 'CL',
      plan: 'Pro',
      mrr: 249,
      status: 'Active',
      signedUp: 'Jun 14, 2024',
    },
    {
      id: 'cust-004',
      name: 'Pioneer Dev',
      initials: 'PD',
      plan: 'Starter',
      mrr: 99,
      status: 'Active',
      signedUp: 'Jun 12, 2024',
    },
  ]

  const insights: InsightData[] = [
    {
      id: 'exec-1',
      icon: 'trendUp',
      title: 'MRR increased by 12.5%',
      description: `From $42,800 to $${mrr.toLocaleString('en-US')}.`,
    },
    {
      id: 'exec-2',
      icon: 'users',
      title: 'You added 178 new customers',
      description: 'A growth of 8.4% compared to the previous period.',
    },
    {
      id: 'exec-3',
      icon: 'trendDown',
      title: 'Churn rate decreased by 1.3 pp',
      description: `From 5.5% to ${churnRate.toFixed(1)}%.`,
    },
  ]

  return {
    mrr,
    arr,
    totalCustomers,
    churnRate,
    revenueSeries,
    planSlices,
    recentCustomers,
    insights,
  }
}

export function getRevenueIntelligenceData(dateRange: DateRangeKey) {
  const exec = getExecutiveOverviewData(dateRange)
  const scale = SCALE_MULTIPLIERS[dateRange]
  const arpu = Number((exec.mrr / exec.totalCustomers).toFixed(2))

  const planSlices: PlanBreakdownSlice[] = [
    { plan: 'Pro', amount: Math.round(24600 * scale), percentage: 51.0, color: '#475569' },
    { plan: 'Starter', amount: Math.round(12400 * scale), percentage: 25.7, color: '#94A3B8' },
    { plan: 'Business', amount: Math.round(8400 * scale), percentage: 17.4, color: '#CBD5E1' },
    { plan: 'Enterprise', amount: Math.round(2800 * scale), percentage: 5.8, color: '#E2E8F0' },
  ]

  const planPerformance: PlanPerformanceRow[] = [
    {
      plan: 'Pro',
      color: '#475569',
      customers: Math.round(1240 * scale),
      mrr: Math.round(24600 * scale),
      arr: Math.round(24600 * scale) * 12,
      momGrowth: '+14.2%',
      sharePercent: '51.0%',
    },
    {
      plan: 'Starter',
      color: '#94A3B8',
      customers: Math.round(820 * scale),
      mrr: Math.round(12400 * scale),
      arr: Math.round(12400 * scale) * 12,
      momGrowth: '+9.8%',
      sharePercent: '25.7%',
    },
    {
      plan: 'Business',
      color: '#CBD5E1',
      customers: Math.round(210 * scale),
      mrr: Math.round(8400 * scale),
      arr: Math.round(8400 * scale) * 12,
      momGrowth: '+11.9%',
      sharePercent: '17.4%',
    },
    {
      plan: 'Enterprise',
      color: '#E2E8F0',
      customers: Math.round(36 * scale),
      mrr: Math.round(2800 * scale),
      arr: Math.round(2800 * scale) * 12,
      momGrowth: '+7.7%',
      sharePercent: '5.8%',
    },
  ]

  const insights: InsightData[] = [
    {
      id: 'rev-1',
      icon: 'trendUp',
      title: 'Revenue increased by 12.5%',
      description: `MRR grew from $42,800 to $${exec.mrr.toLocaleString('en-US')} (+$5,400).`,
    },
    {
      id: 'rev-2',
      icon: 'layers',
      title: 'Pro plan contributes 51.0% of total MRR',
      description: `$${planPerformance[0].mrr.toLocaleString('en-US')} from ${planPerformance[0].customers.toLocaleString('en-US')} customers.`,
    },
    {
      id: 'rev-3',
      icon: 'users',
      title: `Average revenue per customer is $${arpu.toFixed(2)}`,
      description: 'An increase of 3.4% compared to the previous period.',
    },
  ]

  return {
    mrr: exec.mrr,
    arr: exec.arr,
    revenueGrowth: '+12.5%',
    arpu,
    revenueSeries: exec.revenueSeries,
    planSlices,
    planPerformance,
    insights,
  }
}

export function getCustomerRetentionData(dateRange: DateRangeKey) {
  const scale = SCALE_MULTIPLIERS[dateRange]
  const churnRate =
    dateRange === 'Last 30 Days'
      ? 3.9
      : dateRange === 'Last 90 Days'
        ? 4.1
        : dateRange === 'Last 12 Months'
          ? 4.5
          : 4.2
  const retentionRate = Number((100 - churnRate).toFixed(1))
  const lostCustomers = Math.round(98 * scale)
  const newCustomers = Math.round(276 * scale)

  const churnTrend: ChurnTrendPoint[] = [
    { month: 'Jan', fullLabel: 'Jan 2024', churnRate: 5.8, retentionRate: 94.2 },
    { month: 'Feb', fullLabel: 'Feb 2024', churnRate: 5.6, retentionRate: 94.4 },
    { month: 'Mar', fullLabel: 'Mar 2024', churnRate: 5.2, retentionRate: 94.8 },
    { month: 'Apr', fullLabel: 'Apr 2024', churnRate: 4.7, retentionRate: 95.3 },
    { month: 'May', fullLabel: 'May 2024', churnRate: 4.5, retentionRate: 95.5 },
    { month: 'Jun', fullLabel: 'Jun 2024', churnRate, retentionRate },
  ]

  const churnByPlan: PlanChurnRow[] = [
    { plan: 'Starter', color: '#A59FF7', churnRate: 6.8, customers: 820 },
    { plan: 'Pro', color: '#6356E5', churnRate: 3.9, customers: 1240 },
    { plan: 'Business', color: '#8177ED', churnRate: 4.7, customers: 210 },
    { plan: 'Enterprise', color: '#9D95F2', churnRate: 2.1, customers: 36 },
  ]

  const recentlyChurned: ChurnedCustomerRow[] = [
    {
      id: 'cust-005',
      name: 'BrightLayer',
      initials: 'BL',
      plan: 'Pro',
      mrr: 199,
      activeFor: '11 months',
      churnedOn: 'Jun 18, 2024',
      reason: 'Price',
    },
    {
      id: 'cust-006',
      name: 'DevX Systems',
      initials: 'DX',
      plan: 'Business',
      mrr: 499,
      activeFor: '18 months',
      churnedOn: 'Jun 16, 2024',
      reason: 'Not using',
    },
    {
      id: 'cust-003',
      name: 'CloudLink',
      initials: 'CL',
      plan: 'Pro',
      mrr: 199,
      activeFor: '7 months',
      churnedOn: 'Jun 14, 2024',
      reason: 'Missing features',
    },
    {
      id: 'cust-007',
      name: 'TechMove',
      initials: 'TM',
      plan: 'Starter',
      mrr: 49,
      activeFor: '5 months',
      churnedOn: 'Jun 12, 2024',
      reason: 'Other',
    },
  ]

  const insights: InsightData[] = [
    {
      id: 'ret-1',
      icon: 'trendDown',
      title: 'Churn rate decreased by 1.3 percentage points',
      description: `From 5.5% to ${churnRate.toFixed(1)}% in the selected period.`,
    },
    {
      id: 'ret-2',
      icon: 'layers',
      title: 'Starter plan has the highest churn (6.8%)',
      description: `2.9 pp higher than your overall churn rate (${churnRate.toFixed(1)}%).`,
    },
    {
      id: 'ret-3',
      icon: 'trendUp',
      title: `Retention rate improved to ${retentionRate.toFixed(1)}%`,
      description: 'An increase of 1.3 pp compared to the previous period.',
    },
  ]

  return {
    churnRate,
    retentionRate,
    lostCustomers,
    newCustomers,
    churnTrend,
    churnByPlan,
    recentlyChurned,
    insights,
  }
}

export function getCustomerGrowthData(dateRange: DateRangeKey) {
  const scale = SCALE_MULTIPLIERS[dateRange]
  const newCustomers = Math.round(276 * scale)
  const activeCustomers = Math.round(2306 * scale)
  const lostCustomers = Math.round(98 * scale)
  const netGrowth = newCustomers - lostCustomers
  const totalCustomers = activeCustomers + lostCustomers

  const growthTrend: GrowthTrendPoint[] = [
    { month: 'Jan', fullLabel: 'Jan 2024', newCustomers: 128, lostCustomers: 48, netGrowth: 80 },
    { month: 'Feb', fullLabel: 'Feb 2024', newCustomers: 146, lostCustomers: 52, netGrowth: 94 },
    { month: 'Mar', fullLabel: 'Mar 2024', newCustomers: 168, lostCustomers: 58, netGrowth: 110 },
    { month: 'Apr', fullLabel: 'Apr 2024', newCustomers: 196, lostCustomers: 66, netGrowth: 130 },
    { month: 'May', fullLabel: 'May 2024', newCustomers: 232, lostCustomers: 76, netGrowth: 156 },
    { month: 'Jun', fullLabel: 'Jun 2024', newCustomers, lostCustomers, netGrowth },
  ]

  const distributionSlices: PlanBreakdownSlice[] = [
    {
      plan: 'Active',
      amount: activeCustomers,
      percentage: Number(((activeCustomers / totalCustomers) * 100).toFixed(1)),
      color: '#6D5CE8',
      countLabel: activeCustomers.toLocaleString('en-US'),
    },
    {
      plan: 'Churned (Lost)',
      amount: lostCustomers,
      percentage: Number(((lostCustomers / totalCustomers) * 100).toFixed(1)),
      color: '#B8B1F5',
      countLabel: lostCustomers.toLocaleString('en-US'),
    },
    {
      plan: 'Trial',
      amount: 0,
      percentage: 0.0,
      color: '#E5E7EB',
      countLabel: '0',
    },
  ]

  const planGrowth: PlanGrowthRow[] = [
    {
      plan: 'Pro',
      color: '#6D5CE8',
      startCustomers: 1078,
      newCustomers: 132,
      lostCustomers: 34,
      endCustomers: 1176,
      netGrowth: 98,
      growthPercent: '+9.1%',
    },
    {
      plan: 'Starter',
      color: '#8E83EE',
      startCustomers: 692,
      newCustomers: 86,
      lostCustomers: 42,
      endCustomers: 736,
      netGrowth: 44,
      growthPercent: '+6.4%',
    },
    {
      plan: 'Business',
      color: '#B5AEF5',
      startCustomers: 348,
      newCustomers: 42,
      lostCustomers: 18,
      endCustomers: 372,
      netGrowth: 24,
      growthPercent: '+6.9%',
    },
    {
      plan: 'Enterprise',
      color: '#D7D3FA',
      startCustomers: 70,
      newCustomers: 16,
      lostCustomers: 4,
      endCustomers: 82,
      netGrowth: 12,
      growthPercent: '+17.1%',
    },
  ]

  const insights: InsightData[] = [
    {
      id: 'gro-1',
      icon: 'trendUp',
      title: 'Customer base grew by 8.1%',
      description: `From 2,188 to 2,366 customers (+${netGrowth}).`,
    },
    {
      id: 'gro-2',
      icon: 'users',
      title: `${newCustomers} new customers acquired`,
      description: 'An increase of 18.5% compared to the previous period.',
    },
    {
      id: 'gro-3',
      icon: 'chart',
      title: 'Enterprise plan grew the fastest',
      description: '+17.1% growth with 12 net new customers.',
    },
  ]

  return {
    newCustomers,
    activeCustomers,
    lostCustomers,
    netGrowth,
    totalCustomers,
    growthTrend,
    distributionSlices,
    planGrowth,
    insights,
  }
}
