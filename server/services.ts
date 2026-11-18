import type {
  AccountStatus,
  Customer,
  SortDirection,
  SortField,
  SubscriptionPlan,
} from '../src/types/customer.ts'
import type {
  ChurnedCustomerRow,
  ChurnTrendPoint,
  CustomerGrowthResponse,
  CustomerListResponse,
  CustomerRetentionResponse,
  CustomerSummaryResponse,
  DateRangeKey,
  ExecutiveOverviewResponse,
  GrowthTrendPoint,
  InsightData,
  PlanBreakdownSlice,
  PlanChurnRow,
  PlanGrowthRow,
  PlanPerformanceRow,
  RecentCustomerRow,
  RevenueIntelligenceResponse,
  TrendDirection,
  TrendPoint,
} from '../src/types/analytics.ts'
import {
  activeMrrForMonth,
  CUSTOMER_RECORDS,
  DATASET_MAX_DATE,
  DATASET_MIN_DATE,
  isRetainedOn,
  MONTH_END_DATES,
  MONTH_FULL_LABELS,
  MONTH_KEYS,
  MONTH_SHORT_LABELS,
} from './dataset.ts'
import type { MonthKey } from './dataset.ts'

export class ApiServiceError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiServiceError'
    this.status = status
  }
}

const PLAN_ORDER: readonly SubscriptionPlan[] = [
  'Pro',
  'Starter',
  'Business',
  'Enterprise',
]
const CHURN_PLAN_ORDER: readonly SubscriptionPlan[] = [
  'Starter',
  'Pro',
  'Business',
  'Enterprise',
]

const EXEC_PLAN_COLORS: Record<SubscriptionPlan, string> = {
  Pro: '#64748B',
  Starter: '#94A3B8',
  Business: '#CBD5E1',
  Enterprise: '#E2E8F0',
}

const REV_PLAN_COLORS: Record<SubscriptionPlan, string> = {
  Pro: '#475569',
  Starter: '#94A3B8',
  Business: '#CBD5E1',
  Enterprise: '#E2E8F0',
}

const CHURN_PLAN_COLORS: Record<SubscriptionPlan, string> = {
  Starter: '#A59FF7',
  Pro: '#6356E5',
  Business: '#8177ED',
  Enterprise: '#9D95F2',
}

const GROWTH_PLAN_COLORS: Record<SubscriptionPlan, string> = {
  Pro: '#6D5CE8',
  Starter: '#8E83EE',
  Business: '#B5AEF5',
  Enterprise: '#D7D3FA',
}

interface DateWindow {
  startDate: string
  endDate: string
  effectiveStart: string
  effectiveEnd: string
  comparisonLabel: string
  limitationNote: string | null
  months: MonthKey[]
  previousMonth: MonthKey | null
}

function roundTo(val: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round((val + Number.EPSILON) * factor) / factor
}

function formatDisplayDate(isoDate: string): string {
  const [yearS, monthS, dayS] = isoDate.split('-')
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return `${months[Number(monthS) - 1]} ${Number(dayS)}, ${yearS}`
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const parsed = new Date(Date.UTC(y, m - 1, d))
  return (
    parsed.getUTCFullYear() === y &&
    parsed.getUTCMonth() === m - 1 &&
    parsed.getUTCDate() === d
  )
}

function resolveDateWindow(
  dateRange: DateRangeKey = 'Last 6 Months',
  startDate?: string,
  endDate?: string,
): DateWindow {
  let limitationNote: string | null = null
  let resolvedStart: string
  let resolvedEnd: string
  let comparisonLabel: string

  if (dateRange === 'Last 7 Days') {
    resolvedStart = '2024-06-12'
    resolvedEnd = '2024-06-18'
    comparisonLabel = 'Jun 12 – Jun 18, 2024'
    limitationNote =
      'Monthly trend charts reflect the Jun 2024 monthly snapshot; customer metrics and signups reflect exact Jun 12–18 records.'
  } else if (dateRange === 'Last 30 Days') {
    resolvedStart = '2024-05-20'
    resolvedEnd = '2024-06-18'
    comparisonLabel = 'vs. Previous 30 Days'
  } else if (dateRange === 'Last 90 Days') {
    resolvedStart = '2024-03-21'
    resolvedEnd = '2024-06-18'
    comparisonLabel = 'vs. Previous 90 Days'
  } else if (dateRange === 'Last 6 Months') {
    resolvedStart = DATASET_MIN_DATE
    resolvedEnd = DATASET_MAX_DATE
    comparisonLabel = 'Jan – Jun 2024'
  } else if (dateRange === 'Last 12 Months') {
    resolvedStart = '2023-06-19'
    resolvedEnd = DATASET_MAX_DATE
    comparisonLabel = 'vs. Available 2024 Baseline'
    limitationNote =
      'Seeded ledger spans Jan 1 – Jun 18, 2024 (with 2023 baseline cohorts); monthly series begins in Jan 2024.'
  } else if (dateRange === 'Custom Date Range') {
    if (!startDate || !endDate) {
      throw new ApiServiceError(
        400,
        'Both start_date and end_date are required for Custom Date Range.',
      )
    }
    if (!isValidIsoDate(startDate) || !isValidIsoDate(endDate)) {
      throw new ApiServiceError(
        400,
        'Invalid date format. Expected YYYY-MM-DD.',
      )
    }
    if (startDate > endDate) {
      throw new ApiServiceError(
        400,
        'Start date cannot be later than end date.',
      )
    }
    resolvedStart = startDate
    resolvedEnd = endDate
    comparisonLabel = `${formatDisplayDate(resolvedStart)} – ${formatDisplayDate(resolvedEnd)}`
    if (resolvedEnd < DATASET_MIN_DATE || resolvedStart > DATASET_MAX_DATE) {
      limitationNote =
        'No records exist in the selected custom range. Historical data spans Jan 1 – Jun 18, 2024.'
    } else if (
      resolvedStart < DATASET_MIN_DATE ||
      resolvedEnd > DATASET_MAX_DATE
    ) {
      limitationNote =
        'Results reflect available history within Jan 1 – Jun 18, 2024.'
    } else if (resolvedStart.slice(0, 7) === resolvedEnd.slice(0, 7)) {
      limitationNote =
        'Monthly trend charts reflect the selected month; customer totals reflect exact dates within the window.'
    }
  } else {
    throw new ApiServiceError(400, `Unsupported date_range: ${String(dateRange)}`)
  }

  const startMk = resolvedStart.slice(0, 7)
  const endMk = resolvedEnd.slice(0, 7)
  const months = MONTH_KEYS.filter((mk) => startMk <= mk && mk <= endMk)

  let previousMonth: MonthKey | null = null
  if (months.length > 0) {
    const firstIdx = MONTH_KEYS.indexOf(months[0])
    previousMonth = firstIdx > 0 ? MONTH_KEYS[firstIdx - 1] : null
  }

  const effectiveStart =
    resolvedStart > DATASET_MIN_DATE ? resolvedStart : DATASET_MIN_DATE
  const effectiveEnd =
    resolvedEnd < DATASET_MAX_DATE ? resolvedEnd : DATASET_MAX_DATE

  return {
    startDate: resolvedStart,
    endDate: resolvedEnd,
    effectiveStart,
    effectiveEnd,
    comparisonLabel,
    limitationNote,
    months,
    previousMonth,
  }
}

function formatPercentDelta(
  current: number,
  baseline: number,
): { label: string; trend: TrendDirection; rounded: number } {
  if (baseline <= 0) {
    return { label: '0.0%', trend: 'up', rounded: 0 }
  }
  const pct = ((current - baseline) / baseline) * 100
  const rounded = roundTo(pct, 1)
  const sign = rounded > 0 ? '+' : ''
  const trend: TrendDirection = rounded >= 0 ? 'up' : 'down'
  return { label: `${sign}${rounded.toFixed(1)}%`, trend, rounded }
}

function formatPpDelta(
  current: number,
  baseline: number,
): { label: string; trend: TrendDirection; diff: number } {
  const diff = roundTo(current - baseline, 1)
  const sign = diff > 0 ? '+' : ''
  const trend: TrendDirection = diff >= 0 ? 'up' : 'down'
  return { label: `${sign}${diff.toFixed(1)} pp`, trend, diff }
}

interface MonthStats {
  mrr: number
  arr: number
  activeCustomers: number
  retainedStart: number
  retainedEnd: number
  newCustomers: number
  lostCustomers: number
  churnRate: number
  retentionRate: number
}

function monthStats(
  monthKey: MonthKey,
  plan?: SubscriptionPlan,
): MonthStats {
  const monthStart = `${monthKey}-01`
  const monthEnd = MONTH_END_DATES[monthKey]

  const records =
    plan !== undefined
      ? CUSTOMER_RECORDS.filter((r) => r.customer.plan === plan)
      : CUSTOMER_RECORDS

  let mrr = 0
  let activeCustomers = 0
  let retainedStart = 0
  let retainedEnd = 0
  let newCustomers = 0
  let lostCustomers = 0

  for (const r of records) {
    const activeMrr = activeMrrForMonth(r, monthKey)
    mrr += activeMrr
    if (activeMrr > 0) activeCustomers += 1
    if (
      r.customer.signupDate < monthStart &&
      (r.canceledDate === null || r.canceledDate >= monthStart)
    ) {
      retainedStart += 1
    }
    if (isRetainedOn(r, monthEnd)) retainedEnd += 1
    if (r.customer.signupDate >= monthStart && r.customer.signupDate <= monthEnd) {
      newCustomers += 1
    }
    if (
      r.canceledDate !== null &&
      r.canceledDate >= monthStart &&
      r.canceledDate <= monthEnd
    ) {
      lostCustomers += 1
    }
  }

  const churnRate =
    retainedStart > 0 ? roundTo((lostCustomers / retainedStart) * 100, 1) : 0
  const retentionRate = retainedStart > 0 ? roundTo(100 - churnRate, 1) : 0

  return {
    mrr,
    arr: mrr * 12,
    activeCustomers,
    retainedStart,
    retainedEnd,
    newCustomers,
    lostCustomers,
    churnRate,
    retentionRate,
  }
}

interface PeriodCounts {
  retainedStart: number
  retainedEnd: number
  newCustomers: number
  lostCustomers: number
  churnRate: number
  retentionRate: number
}

function periodCustomerCounts(
  effectiveStart: string,
  effectiveEnd: string,
  plan?: SubscriptionPlan,
): PeriodCounts {
  if (effectiveStart > effectiveEnd) {
    return {
      retainedStart: 0,
      retainedEnd: 0,
      newCustomers: 0,
      lostCustomers: 0,
      churnRate: 0,
      retentionRate: 0,
    }
  }

  const records =
    plan !== undefined
      ? CUSTOMER_RECORDS.filter((r) => r.customer.plan === plan)
      : CUSTOMER_RECORDS

  let retainedStart = 0
  let retainedEnd = 0
  let newCustomers = 0
  let lostCustomers = 0

  for (const r of records) {
    if (
      r.customer.signupDate < effectiveStart &&
      (r.canceledDate === null || r.canceledDate >= effectiveStart)
    ) {
      retainedStart += 1
    }
    if (isRetainedOn(r, effectiveEnd)) retainedEnd += 1
    if (
      r.customer.signupDate >= effectiveStart &&
      r.customer.signupDate <= effectiveEnd
    ) {
      newCustomers += 1
    }
    if (
      r.canceledDate !== null &&
      r.canceledDate >= effectiveStart &&
      r.canceledDate <= effectiveEnd
    ) {
      lostCustomers += 1
    }
  }

  const churnRate =
    retainedStart > 0 ? roundTo((lostCustomers / retainedStart) * 100, 1) : 0
  const retentionRate = retainedStart > 0 ? roundTo(100 - churnRate, 1) : 0

  return {
    retainedStart,
    retainedEnd,
    newCustomers,
    lostCustomers,
    churnRate,
    retentionRate,
  }
}

function activeDurationLabel(signupDate: string, canceledDate: string): string {
  const [sy, sm] = signupDate.split('-').map(Number)
  const [cy, cm] = canceledDate.split('-').map(Number)
  const months = Math.max(1, (cy - sy) * 12 + (cm - sm))
  return months === 1 ? '1 month' : `${months} months`
}

export function getExecutiveOverview(
  dateRange: DateRangeKey = 'Last 6 Months',
  startDate?: string,
  endDate?: string,
): ExecutiveOverviewResponse {
  const window = resolveDateWindow(dateRange, startDate, endDate)
  const months = window.months

  if (months.length === 0) {
    return {
      mrr: 0,
      arr: 0,
      totalCustomers: 0,
      churnRate: 0,
      mrrChange: '0.0%',
      mrrTrend: 'up',
      customersChange: '0.0%',
      customersTrend: 'up',
      churnChange: '0.0 pp',
      churnTrendDirection: 'up',
      mrrSparkline: [],
      arrSparkline: [],
      customersSparkline: [],
      churnSparkline: [],
      revenueSeries: [],
      planSlices: [],
      recentCustomers: [],
      insights: [
        {
          id: 'exec-empty',
          icon: 'chart',
          title: 'No snapshot data in selected range',
          description:
            'Adjust the custom date range to fall within Jan 1 – Jun 18, 2024.',
        },
      ],
      comparisonLabel: window.comparisonLabel,
      limitationNote: window.limitationNote,
      startDate: window.startDate,
      endDate: window.endDate,
    }
  }

  const statsList = months.map((mk) => monthStats(mk))
  const latestMk = months[months.length - 1]
  const latestStats = statsList[statsList.length - 1]

  const baselineMk = window.previousMonth ?? months[0]
  const baselineStats = monthStats(baselineMk)

  const mrr = latestStats.mrr
  const arr = mrr * 12
  const totalCustomers = latestStats.activeCustomers

  const periodCounts = periodCustomerCounts(
    window.effectiveStart,
    window.effectiveEnd,
  )
  const churnRate = periodCounts.churnRate
  const baselineChurn = baselineStats.churnRate

  const baselineMrr = baselineStats.mrr
  const baselineCustomers = baselineStats.activeCustomers

  const { label: mrrLabel, trend: mrrTrend } = formatPercentDelta(
    mrr,
    baselineMrr,
  )
  const { label: custLabel, trend: custTrend } = formatPercentDelta(
    totalCustomers,
    baselineCustomers,
  )
  const { label: churnLabel, trend: churnTrend, diff: churnDiff } =
    formatPpDelta(churnRate, baselineChurn)

  const revenueSeries: TrendPoint[] = months.map((mk, idx) => ({
    month: MONTH_SHORT_LABELS[mk],
    fullLabel: MONTH_FULL_LABELS[mk],
    mrr: statsList[idx].mrr,
    arr: statsList[idx].arr,
  }))

  const planSlices: PlanBreakdownSlice[] = PLAN_ORDER.map((plan) => {
    const planSt = monthStats(latestMk, plan)
    const planMrr = planSt.mrr
    const pct = roundTo((planMrr / Math.max(mrr, 1)) * 100, 1)
    return {
      plan,
      amount: planMrr,
      percentage: pct,
      color: EXEC_PLAN_COLORS[plan],
    }
  })

  const recentRecords = CUSTOMER_RECORDS.filter(
    (r) =>
      r.customer.signupDate >= window.effectiveStart &&
      r.customer.signupDate <= window.effectiveEnd,
  ).sort((a, b) => b.customer.signupDate.localeCompare(a.customer.signupDate))

  const recentCustomers: RecentCustomerRow[] = recentRecords
    .slice(0, 4)
    .map((r) => ({
      id: r.customer.id,
      name: r.customer.name,
      initials: r.customer.initials,
      plan: r.customer.plan,
      mrr: r.customer.mrr,
      status: r.customer.status,
      signedUp: formatDisplayDate(r.customer.signupDate),
    }))

  const periodNew = periodCounts.newCustomers
  const prevNewBase = baselineStats.newCustomers
  const avgNewPerMonth = periodNew / months.length
  const { label: newRateLabel } = formatPercentDelta(
    months.length === 1 ? periodNew : avgNewPerMonth,
    prevNewBase,
  )

  const insights: InsightData[] = [
    {
      id: 'exec-1',
      icon: mrrTrend === 'up' ? 'trendUp' : 'trendDown',
      title: `MRR changed by ${mrrLabel}`,
      description: `From $${baselineMrr.toLocaleString('en-US')} (${MONTH_FULL_LABELS[baselineMk]}) to $${mrr.toLocaleString('en-US')} (${MONTH_FULL_LABELS[latestMk]}).`,
    },
    {
      id: 'exec-2',
      icon: 'users',
      title: `${periodNew.toLocaleString('en-US')} new customers in period`,
      description: `${recentCustomers.length} recent signup${recentCustomers.length === 1 ? '' : 's'} matched in period (${newRateLabel} monthly pace).`,
    },
    {
      id: 'exec-3',
      icon: churnDiff <= 0 ? 'trendDown' : 'trendUp',
      title: `Period churn rate is ${churnRate.toFixed(1)}%`,
      description: `${periodCounts.lostCustomers} lost out of ${periodCounts.retainedStart} starting customers (${churnLabel} vs. ${MONTH_FULL_LABELS[baselineMk]}).`,
    },
  ]

  return {
    mrr,
    arr,
    totalCustomers,
    churnRate,
    mrrChange: mrrLabel,
    mrrTrend,
    customersChange: custLabel,
    customersTrend: custTrend,
    churnChange: churnLabel,
    churnTrendDirection: churnTrend,
    mrrSparkline: statsList.map((st) => st.mrr),
    arrSparkline: statsList.map((st) => st.arr),
    customersSparkline: statsList.map((st) => st.activeCustomers),
    churnSparkline: statsList.map((st) => st.churnRate),
    revenueSeries,
    planSlices,
    recentCustomers,
    insights,
    comparisonLabel: window.comparisonLabel,
    limitationNote: window.limitationNote,
    startDate: window.startDate,
    endDate: window.endDate,
  }
}

export function getRevenueIntelligence(
  dateRange: DateRangeKey = 'Last 6 Months',
  startDate?: string,
  endDate?: string,
): RevenueIntelligenceResponse {
  const window = resolveDateWindow(dateRange, startDate, endDate)
  const months = window.months

  if (months.length === 0) {
    return {
      mrr: 0,
      arr: 0,
      revenueGrowth: '0.0%',
      revenueGrowthChange: '0.0 pp',
      revenueGrowthTrend: 'up',
      mrrChange: '0.0%',
      mrrTrend: 'up',
      arpu: 0,
      arpuChange: '0.0%',
      arpuTrend: 'up',
      mrrSparkline: [],
      arrSparkline: [],
      growthSparkline: [],
      arpuSparkline: [],
      revenueSeries: [],
      planSlices: [],
      planPerformance: [],
      insights: [
        {
          id: 'rev-empty',
          icon: 'chart',
          title: 'No revenue data in selected range',
          description:
            'Adjust the custom date range to fall within Jan 1 – Jun 18, 2024.',
        },
      ],
      comparisonLabel: window.comparisonLabel,
      limitationNote: window.limitationNote,
      startDate: window.startDate,
      endDate: window.endDate,
    }
  }

  const statsList = months.map((mk) => monthStats(mk))
  const latestMk = months[months.length - 1]
  const latestStats = statsList[statsList.length - 1]
  const baselineMk = window.previousMonth ?? months[0]
  const baselineStats = monthStats(baselineMk)

  const mrr = latestStats.mrr
  const arr = mrr * 12
  const activeCustomers = latestStats.activeCustomers
  const arpu =
    activeCustomers > 0 ? roundTo(mrr / activeCustomers, 2) : 0

  const baselineMrr = baselineStats.mrr
  const baselineCustomers = baselineStats.activeCustomers
  const baselineArpu =
    baselineCustomers > 0 ? baselineMrr / baselineCustomers : 0

  const { label: mrrLabel, trend: mrrTrend } = formatPercentDelta(
    mrr,
    baselineMrr,
  )
  const { label: arpuLabel, trend: arpuTrend } = formatPercentDelta(
    arpu,
    baselineArpu,
  )

  const growthSeries: number[] = statsList.map((st, idx) => {
    const prevSt =
      idx > 0
        ? statsList[idx - 1]
        : window.previousMonth
          ? monthStats(window.previousMonth)
          : null
    if (!prevSt || prevSt.mrr <= 0) return 0
    return roundTo(((st.mrr - prevSt.mrr) / prevSt.mrr) * 100, 1)
  })

  const latestGrowthPct = growthSeries[growthSeries.length - 1] ?? 0
  const prevGrowthPct =
    growthSeries.length > 1 ? growthSeries[growthSeries.length - 2] : 0
  const { label: growthDeltaLabel, trend: growthDeltaTrend } = formatPpDelta(
    latestGrowthPct,
    prevGrowthPct,
  )

  const revenueSeries: TrendPoint[] = months.map((mk, idx) => ({
    month: MONTH_SHORT_LABELS[mk],
    fullLabel: MONTH_FULL_LABELS[mk],
    mrr: statsList[idx].mrr,
    arr: statsList[idx].arr,
  }))

  const planBaselineMk =
    months.length > 1
      ? months[months.length - 2]
      : window.previousMonth ?? latestMk

  const planSlices: PlanBreakdownSlice[] = []
  const planPerformance: PlanPerformanceRow[] = []

  for (const plan of PLAN_ORDER) {
    const curP = monthStats(latestMk, plan)
    const prevP = monthStats(planBaselineMk, plan)
    const planMrr = curP.mrr
    const planArr = planMrr * 12
    const planCustomers = curP.activeCustomers
    const pct = roundTo((planMrr / Math.max(mrr, 1)) * 100, 1)
    const { label: momLabel } = formatPercentDelta(planMrr, prevP.mrr)

    planSlices.push({
      plan,
      amount: planMrr,
      percentage: pct,
      color: REV_PLAN_COLORS[plan],
    })
    planPerformance.push({
      plan,
      color: REV_PLAN_COLORS[plan],
      customers: planCustomers,
      mrr: planMrr,
      arr: planArr,
      momGrowth: momLabel,
      sharePercent: `${pct.toFixed(1)}%`,
    })
  }

  const topPlan = planPerformance.reduce((best, cur) =>
    cur.mrr > best.mrr ? cur : best,
  )
  const mrrDiff = mrr - baselineMrr
  const diffPrefix = mrrDiff >= 0 ? '+$' : '-$'

  const insights: InsightData[] = [
    {
      id: 'rev-1',
      icon: mrrTrend === 'up' ? 'trendUp' : 'trendDown',
      title: `Revenue changed by ${mrrLabel}`,
      description: `MRR moved from $${baselineMrr.toLocaleString('en-US')} to $${mrr.toLocaleString('en-US')} (${diffPrefix}${Math.abs(mrrDiff).toLocaleString('en-US')}).`,
    },
    {
      id: 'rev-2',
      icon: 'layers',
      title: `${topPlan.plan} plan contributes ${topPlan.sharePercent} of total MRR`,
      description: `$${topPlan.mrr.toLocaleString('en-US')} from ${topPlan.customers.toLocaleString('en-US')} active customers.`,
    },
    {
      id: 'rev-3',
      icon: 'users',
      title: `Average revenue per customer is $${arpu.toFixed(2)}`,
      description: `A change of ${arpuLabel} compared to ${MONTH_FULL_LABELS[baselineMk]}.`,
    },
  ]

  return {
    mrr,
    arr,
    revenueGrowth: mrrLabel,
    revenueGrowthChange: growthDeltaLabel,
    revenueGrowthTrend: growthDeltaTrend,
    mrrChange: mrrLabel,
    mrrTrend,
    arpu,
    arpuChange: arpuLabel,
    arpuTrend,
    mrrSparkline: statsList.map((st) => st.mrr),
    arrSparkline: statsList.map((st) => st.arr),
    growthSparkline: growthSeries,
    arpuSparkline: statsList.map((st) =>
      roundTo(st.mrr / Math.max(st.activeCustomers, 1), 2),
    ),
    revenueSeries,
    planSlices,
    planPerformance,
    insights,
    comparisonLabel: window.comparisonLabel,
    limitationNote: window.limitationNote,
    startDate: window.startDate,
    endDate: window.endDate,
  }
}

export function getCustomerRetention(
  dateRange: DateRangeKey = 'Last 6 Months',
  startDate?: string,
  endDate?: string,
): CustomerRetentionResponse {
  const window = resolveDateWindow(dateRange, startDate, endDate)
  const months = window.months

  if (months.length === 0) {
    return {
      churnRate: 0,
      retentionRate: 0,
      lostCustomers: 0,
      newCustomers: 0,
      churnChange: '0.0 pp',
      churnTrendDirection: 'up',
      retentionChange: '0.0 pp',
      retentionTrendDirection: 'up',
      lostChange: '0.0%',
      lostTrendDirection: 'up',
      newChange: '0.0%',
      newTrendDirection: 'up',
      churnSparkline: [],
      retentionSparkline: [],
      lostSparkline: [],
      newSparkline: [],
      churnTrend: [],
      churnByPlan: [],
      recentlyChurned: [],
      insights: [
        {
          id: 'ret-empty',
          icon: 'chart',
          title: 'No retention data in selected range',
          description:
            'Adjust the custom date range to fall within Jan 1 – Jun 18, 2024.',
        },
      ],
      comparisonLabel: window.comparisonLabel,
      limitationNote: window.limitationNote,
      startDate: window.startDate,
      endDate: window.endDate,
    }
  }

  const statsList = months.map((mk) => monthStats(mk))
  const baselineMk = window.previousMonth ?? months[0]
  const baselineStats = monthStats(baselineMk)

  const periodCounts = periodCustomerCounts(
    window.effectiveStart,
    window.effectiveEnd,
  )
  const churnRate = periodCounts.churnRate
  const retentionRate = periodCounts.retentionRate
  const lostCustomers = periodCounts.lostCustomers
  const newCustomers = periodCounts.newCustomers

  const { label: churnLabel, trend: churnTrend, diff: churnDiff } =
    formatPpDelta(churnRate, baselineStats.churnRate)
  const { label: retLabel, trend: retTrend, diff: retDiff } = formatPpDelta(
    retentionRate,
    baselineStats.retentionRate,
  )

  const lostBaseline =
    baselineStats.lostCustomers * Math.max(months.length, 1)
  const newBaseline = baselineStats.newCustomers * Math.max(months.length, 1)
  const { label: lostLabel, trend: lostTrend } = formatPercentDelta(
    lostCustomers,
    lostBaseline,
  )
  const { label: newLabel, trend: newTrend } = formatPercentDelta(
    newCustomers,
    newBaseline,
  )

  const churnTrendPts: ChurnTrendPoint[] = months.map((mk, idx) => ({
    month: MONTH_SHORT_LABELS[mk],
    fullLabel: MONTH_FULL_LABELS[mk],
    churnRate: statsList[idx].churnRate,
    retentionRate: statsList[idx].retentionRate,
  }))

  const latestMk = months[months.length - 1]
  const churnByPlan: PlanChurnRow[] = CHURN_PLAN_ORDER.map((plan) => {
    const planPeriod = periodCustomerCounts(
      window.effectiveStart,
      window.effectiveEnd,
      plan,
    )
    const planLatest = monthStats(latestMk, plan)
    return {
      plan,
      color: CHURN_PLAN_COLORS[plan],
      churnRate: planPeriod.churnRate,
      customers: planLatest.activeCustomers,
    }
  })

  const churnedRecords = CUSTOMER_RECORDS.filter(
    (r) =>
      r.canceledDate !== null &&
      r.canceledDate >= window.effectiveStart &&
      r.canceledDate <= window.effectiveEnd,
  ).sort((a, b) =>
    (b.canceledDate ?? '').localeCompare(a.canceledDate ?? ''),
  )

  const recentlyChurned: ChurnedCustomerRow[] = churnedRecords.map((r) => ({
    id: r.customer.id,
    name: r.customer.name,
    initials: r.customer.initials,
    plan: r.customer.plan,
    mrr: r.customer.mrr,
    activeFor: activeDurationLabel(r.customer.signupDate, r.canceledDate ?? ''),
    churnedOn: formatDisplayDate(r.canceledDate ?? ''),
    churnedDate: r.canceledDate ?? '',
    reason: r.churnReason ?? 'Other',
  }))

  const highestChurn = churnByPlan.reduce((best, cur) =>
    cur.churnRate > best.churnRate ? cur : best,
  )
  const diffPp = Math.abs(highestChurn.churnRate - churnRate)
  const compWord = highestChurn.churnRate >= churnRate ? 'higher' : 'lower'

  const insights: InsightData[] = [
    {
      id: 'ret-1',
      icon: churnDiff <= 0 ? 'trendDown' : 'trendUp',
      title: `Period churn rate is ${churnRate.toFixed(1)}%`,
      description: `${lostCustomers} churned out of ${periodCounts.retainedStart} starting accounts (${churnLabel} vs. ${MONTH_FULL_LABELS[baselineMk]}).`,
    },
    {
      id: 'ret-2',
      icon: 'layers',
      title: `${highestChurn.plan} plan has the highest churn (${highestChurn.churnRate.toFixed(1)}%)`,
      description: `${diffPp.toFixed(1)} pp ${compWord} than your overall period churn (${churnRate.toFixed(1)}%).`,
    },
    {
      id: 'ret-3',
      icon: retDiff >= 0 ? 'trendUp' : 'trendDown',
      title: `Retention rate is ${retentionRate.toFixed(1)}%`,
      description: `100 − ${churnRate.toFixed(1)}% churn (${retLabel} vs. ${MONTH_FULL_LABELS[baselineMk]}).`,
    },
  ]

  return {
    churnRate,
    retentionRate,
    lostCustomers,
    newCustomers,
    churnChange: churnLabel,
    churnTrendDirection: churnTrend,
    retentionChange: retLabel,
    retentionTrendDirection: retTrend,
    lostChange: lostLabel,
    lostTrendDirection: lostTrend,
    newChange: newLabel,
    newTrendDirection: newTrend,
    churnSparkline: churnTrendPts.map((pt) => pt.churnRate),
    retentionSparkline: churnTrendPts.map((pt) => pt.retentionRate),
    lostSparkline: statsList.map((st) => st.lostCustomers),
    newSparkline: statsList.map((st) => st.newCustomers),
    churnTrend: churnTrendPts,
    churnByPlan,
    recentlyChurned,
    insights,
    comparisonLabel: window.comparisonLabel,
    limitationNote: window.limitationNote,
    startDate: window.startDate,
    endDate: window.endDate,
  }
}

export function getCustomerGrowth(
  dateRange: DateRangeKey = 'Last 6 Months',
  startDate?: string,
  endDate?: string,
): CustomerGrowthResponse {
  const window = resolveDateWindow(dateRange, startDate, endDate)
  const months = window.months

  if (months.length === 0) {
    return {
      newCustomers: 0,
      activeCustomers: 0,
      lostCustomers: 0,
      netGrowth: 0,
      totalCustomers: 0,
      newChange: '0.0%',
      newTrendDirection: 'up',
      activeChange: '0.0%',
      activeTrendDirection: 'up',
      lostChange: '0.0%',
      lostTrendDirection: 'up',
      netChange: '0.0%',
      netTrendDirection: 'up',
      newSparkline: [],
      activeSparkline: [],
      lostSparkline: [],
      netSparkline: [],
      growthTrend: [],
      distributionSlices: [],
      planGrowth: [],
      insights: [
        {
          id: 'gro-empty',
          icon: 'chart',
          title: 'No growth data in selected range',
          description:
            'Adjust the custom date range to fall within Jan 1 – Jun 18, 2024.',
        },
      ],
      comparisonLabel: window.comparisonLabel,
      limitationNote: window.limitationNote,
      startDate: window.startDate,
      endDate: window.endDate,
    }
  }

  const statsList = months.map((mk) => monthStats(mk))
  const latestStats = statsList[statsList.length - 1]
  const baselineMk = window.previousMonth ?? months[0]
  const baselineStats = monthStats(baselineMk)

  const periodCounts = periodCustomerCounts(
    window.effectiveStart,
    window.effectiveEnd,
  )
  const newCustomers = periodCounts.newCustomers
  const lostCustomers = periodCounts.lostCustomers
  const activeCustomers = latestStats.activeCustomers
  const retainedEnd = periodCounts.retainedEnd
  const pastDueCustomers = Math.max(0, retainedEnd - activeCustomers)
  const netGrowth = newCustomers - lostCustomers
  const totalCustomers = retainedEnd + lostCustomers

  const newBaseline = baselineStats.newCustomers * Math.max(months.length, 1)
  const lostBaseline = baselineStats.lostCustomers * Math.max(months.length, 1)
  const activeBaseline = baselineStats.activeCustomers
  const netBaseline =
    (baselineStats.newCustomers - baselineStats.lostCustomers) *
    Math.max(months.length, 1)

  const { label: newLabel, trend: newTrend } = formatPercentDelta(
    newCustomers,
    newBaseline,
  )
  const { label: activeLabel, trend: activeTrend } = formatPercentDelta(
    activeCustomers,
    activeBaseline,
  )
  const { label: lostLabel, trend: lostTrend } = formatPercentDelta(
    lostCustomers,
    lostBaseline,
  )
  const { label: netLabel, trend: netTrend } = formatPercentDelta(
    netGrowth,
    netBaseline,
  )

  const growthTrend: GrowthTrendPoint[] = months.map((mk, idx) => ({
    month: MONTH_SHORT_LABELS[mk],
    fullLabel: MONTH_FULL_LABELS[mk],
    newCustomers: statsList[idx].newCustomers,
    lostCustomers: statsList[idx].lostCustomers,
    netGrowth: statsList[idx].newCustomers - statsList[idx].lostCustomers,
  }))

  const distributionSlices: PlanBreakdownSlice[] =
    totalCustomers > 0
      ? [
          {
            plan: 'Active',
            amount: activeCustomers,
            percentage: roundTo((activeCustomers / totalCustomers) * 100, 1),
            color: '#6D5CE8',
            countLabel: activeCustomers.toLocaleString('en-US'),
          },
          {
            plan: 'Churned (Lost)',
            amount: lostCustomers,
            percentage: roundTo((lostCustomers / totalCustomers) * 100, 1),
            color: '#B8B1F5',
            countLabel: lostCustomers.toLocaleString('en-US'),
          },
          {
            plan: 'Past Due',
            amount: pastDueCustomers,
            percentage: roundTo((pastDueCustomers / totalCustomers) * 100, 1),
            color: '#E5E7EB',
            countLabel: pastDueCustomers.toLocaleString('en-US'),
          },
        ]
      : []

  const planGrowth: PlanGrowthRow[] = PLAN_ORDER.map((plan) => {
    const pCounts = periodCustomerCounts(
      window.effectiveStart,
      window.effectiveEnd,
      plan,
    )
    const pStart = pCounts.retainedStart
    const pNew = pCounts.newCustomers
    const pLost = pCounts.lostCustomers
    const pEnd = pCounts.retainedEnd
    const pNet = pNew - pLost
    const pct = pStart > 0 ? roundTo((pNet / pStart) * 100, 1) : 0
    const sign = pNet >= 0 ? '+' : ''
    return {
      plan,
      color: GROWTH_PLAN_COLORS[plan],
      startCustomers: pStart,
      newCustomers: pNew,
      lostCustomers: pLost,
      endCustomers: pEnd,
      netGrowth: pNet,
      growthPercent: `${sign}${pct.toFixed(1)}%`,
    }
  })

  const fastestPlan = planGrowth.reduce((best, cur) =>
    Number(cur.growthPercent.replace('%', '')) >
    Number(best.growthPercent.replace('%', ''))
      ? cur
      : best,
  )
  const totalStartBase = planGrowth.reduce(
    (sum, row) => sum + row.startCustomers,
    0,
  )
  const { label: baseGrowthLabel } = formatPercentDelta(
    retainedEnd,
    totalStartBase,
  )

  const insights: InsightData[] = [
    {
      id: 'gro-1',
      icon: 'trendUp',
      title: `Customer base changed by ${baseGrowthLabel}`,
      description: `From ${totalStartBase.toLocaleString('en-US')} to ${retainedEnd.toLocaleString('en-US')} retained customers (${netGrowth >= 0 ? '+' : ''}${netGrowth} net).`,
    },
    {
      id: 'gro-2',
      icon: 'users',
      title: `${newCustomers.toLocaleString('en-US')} new customers acquired`,
      description: `${newLabel} compared to ${MONTH_FULL_LABELS[baselineMk]} monthly pace.`,
    },
    {
      id: 'gro-3',
      icon: 'chart',
      title: `${fastestPlan.plan} plan grew the fastest`,
      description: `${fastestPlan.growthPercent} growth with ${fastestPlan.netGrowth >= 0 ? '+' : ''}${fastestPlan.netGrowth} net customers.`,
    },
  ]

  return {
    newCustomers,
    activeCustomers,
    lostCustomers,
    netGrowth,
    totalCustomers,
    newChange: newLabel,
    newTrendDirection: newTrend,
    activeChange: activeLabel,
    activeTrendDirection: activeTrend,
    lostChange: lostLabel,
    lostTrendDirection: lostTrend,
    netChange: netLabel,
    netTrendDirection: netTrend,
    newSparkline: statsList.map((st) => st.newCustomers),
    activeSparkline: statsList.map((st) => st.activeCustomers),
    lostSparkline: statsList.map((st) => st.lostCustomers),
    netSparkline: growthTrend.map((pt) => pt.netGrowth),
    growthTrend,
    distributionSlices,
    planGrowth,
    insights,
    comparisonLabel: window.comparisonLabel,
    limitationNote: window.limitationNote,
    startDate: window.startDate,
    endDate: window.endDate,
  }
}

export function getCustomerSummary(
  dateRange: DateRangeKey = 'Last 6 Months',
  startDate?: string,
  endDate?: string,
): CustomerSummaryResponse {
  const window = resolveDateWindow(dateRange, startDate, endDate)
  const months = window.months

  if (months.length === 0) {
    return {
      totalCustomers: 0,
      newCustomers: 0,
      lostCustomers: 0,
      avgSubscriptionValue: 0,
      totalChange: '0.0%',
      totalTrend: 'up',
      newChange: '0.0%',
      newTrend: 'up',
      lostChange: '0.0%',
      lostTrend: 'up',
      avgValueChange: '0.0%',
      avgValueTrend: 'up',
      totalSparkline: [],
      newSparkline: [],
      lostSparkline: [],
      avgValueSparkline: [],
      comparisonLabel: window.comparisonLabel,
      limitationNote: window.limitationNote,
      startDate: window.startDate,
      endDate: window.endDate,
    }
  }

  const statsList = months.map((mk) => monthStats(mk))
  const latestStats = statsList[statsList.length - 1]
  const baselineMk = window.previousMonth ?? months[0]
  const baselineStats = monthStats(baselineMk)

  const periodCounts = periodCustomerCounts(
    window.effectiveStart,
    window.effectiveEnd,
  )
  const activeCustomers = latestStats.activeCustomers
  const lostCustomers = periodCounts.lostCustomers
  const newCustomers = periodCounts.newCustomers
  const totalCustomers = periodCounts.retainedEnd + lostCustomers
  const mrr = latestStats.mrr
  const avgSubVal =
    activeCustomers > 0 ? roundTo(mrr / activeCustomers, 2) : 0

  const baselineTotal =
    baselineStats.retainedEnd + baselineStats.lostCustomers
  const baselineLost =
    baselineStats.lostCustomers * Math.max(months.length, 1)
  const baselineNew = baselineStats.newCustomers * Math.max(months.length, 1)
  const baselineAvg =
    baselineStats.activeCustomers > 0
      ? baselineStats.mrr / baselineStats.activeCustomers
      : 0

  const { label: totalLabel, trend: totalTrend } = formatPercentDelta(
    totalCustomers,
    baselineTotal,
  )
  const { label: newLabel, trend: newTrend } = formatPercentDelta(
    newCustomers,
    baselineNew,
  )
  const { label: lostLabel, trend: lostTrend } = formatPercentDelta(
    lostCustomers,
    baselineLost,
  )
  const { label: avgLabel, trend: avgTrend } = formatPercentDelta(
    avgSubVal,
    baselineAvg,
  )

  return {
    totalCustomers,
    newCustomers,
    lostCustomers,
    avgSubscriptionValue: avgSubVal,
    totalChange: totalLabel,
    totalTrend,
    newChange: newLabel,
    newTrend,
    lostChange: lostLabel,
    lostTrend,
    avgValueChange: avgLabel,
    avgValueTrend: avgTrend,
    totalSparkline: statsList.map(
      (st) => st.retainedEnd + st.lostCustomers,
    ),
    newSparkline: statsList.map((st) => st.newCustomers),
    lostSparkline: statsList.map((st) => st.lostCustomers),
    avgValueSparkline: statsList.map((st) =>
      roundTo(st.mrr / Math.max(st.activeCustomers, 1), 2),
    ),
    comparisonLabel: window.comparisonLabel,
    limitationNote: window.limitationNote,
    startDate: window.startDate,
    endDate: window.endDate,
  }
}

export interface ListCustomersArgs {
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

export function listCustomers(args: ListCustomersArgs = {}): CustomerListResponse {
  const {
    search = '',
    plan = 'All',
    status = 'All',
    sortBy = 'signupDate',
    sortDir = 'desc',
    page = 1,
    pageSize = 7,
    dateRange,
    startDate,
    endDate,
  } = args

  let records = [...CUSTOMER_RECORDS]

  if (dateRange !== undefined) {
    const window = resolveDateWindow(dateRange, startDate, endDate)
    if (window.months.length === 0) {
      records = []
    } else {
      records = records.filter(
        (r) =>
          r.customer.signupDate <= window.effectiveEnd &&
          (r.canceledDate === null || r.canceledDate >= window.effectiveStart),
      )
    }
  }

  const q = search.trim().toLowerCase()
  if (q.length > 0) {
    records = records.filter(
      (r) =>
        r.customer.name.toLowerCase().includes(q) ||
        r.customer.email.toLowerCase().includes(q),
    )
  }

  if (plan !== 'All') {
    records = records.filter((r) => r.customer.plan === plan)
  }

  if (status !== 'All') {
    records = records.filter((r) => r.customer.status === status)
  }

  const dirMultiplier = sortDir === 'desc' ? -1 : 1
  records.sort((a, b) => {
    if (sortBy === 'mrr') {
      if (a.customer.mrr !== b.customer.mrr) {
        return (a.customer.mrr - b.customer.mrr) * dirMultiplier
      }
    } else {
      const cmp = a.customer.signupDate.localeCompare(b.customer.signupDate)
      if (cmp !== 0) {
        return cmp * dirMultiplier
      }
    }
    return a.customer.name.toLowerCase().localeCompare(b.customer.name.toLowerCase())
  })

  const total = records.length
  const clampedPageSize = Math.min(200, Math.max(1, pageSize))
  const totalPages = Math.max(1, Math.ceil(total / clampedPageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const startIdx = (safePage - 1) * clampedPageSize
  const pageItems = records
    .slice(startIdx, startIdx + clampedPageSize)
    .map((r) => r.customer)

  return {
    items: pageItems,
    total,
    page: safePage,
    pageSize: clampedPageSize,
    totalPages,
  }
}

export function getCustomerById(customerId: string): Customer {
  const match = CUSTOMER_RECORDS.find((r) => r.customer.id === customerId)
  if (!match) {
    throw new ApiServiceError(404, `Customer "${customerId}" not found.`)
  }
  return match.customer
}
