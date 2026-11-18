// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  activeMrrForMonth,
  CUSTOMER_RECORDS,
  isRetainedOn,
} from './dataset.ts'
import {
  ApiServiceError,
  getCustomerById,
  getCustomerGrowth,
  getCustomerRetention,
  getCustomerSummary,
  getExecutiveOverview,
  getRevenueIntelligence,
  listCustomers,
} from './services.ts'
import type { DateRangeKey } from '../src/types/analytics.ts'

describe('dataset retention and active MRR helpers', () => {
  it('excludes customers before signup, on/after cancel, or on/after pastDue in activeMrrForMonth', () => {
    const juneSignup = CUSTOMER_RECORDS.find((r) => r.customer.id === 'cust-001')!
    expect(activeMrrForMonth(juneSignup, '2024-05')).toBe(0)
    expect(activeMrrForMonth(juneSignup, '2024-06')).toBe(249)

    const canceledInJune = CUSTOMER_RECORDS.find((r) => r.customer.id === 'cust-007')!
    expect(activeMrrForMonth(canceledInJune, '2024-05')).toBe(49)
    expect(activeMrrForMonth(canceledInJune, '2024-06')).toBe(0)

    const pastDueInJune = CUSTOMER_RECORDS.find((r) => r.customer.id === 'cust-006')!
    expect(pastDueInJune.pastDueDate).toBe('2024-06-09')
    expect(activeMrrForMonth(pastDueInJune, '2024-06')).toBe(0)
  })

  it('tracks retention across signup and cancellation boundaries in isRetainedOn', () => {
    const record = CUSTOMER_RECORDS.find((r) => r.customer.id === 'cust-007')!
    expect(isRetainedOn(record, '2024-05-27')).toBe(false)
    expect(isRetainedOn(record, '2024-05-28')).toBe(true)
    expect(isRetainedOn(record, '2024-06-11')).toBe(true)
    expect(isRetainedOn(record, '2024-06-12')).toBe(false)
  })
})

describe('analytics service functions', () => {
  it('computes consistent executive overview metrics for Last 6 Months', () => {
    const res = getExecutiveOverview('Last 6 Months')
    expect(res.arr).toBe(res.mrr * 12)
    expect(res.revenueSeries).toHaveLength(6)
    expect(res.revenueSeries.map((p) => p.month)).toEqual([
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
    ])
    expect(res.planSlices).toHaveLength(4)
    expect(res.planSlices.reduce((sum, s) => sum + s.amount, 0)).toBe(res.mrr)
    expect(res.recentCustomers.length).toBeLessThanOrEqual(4)
    expect(res.recentCustomers[0]?.name).toBe('Acme Tech')
    expect(res.limitationNote).toBeNull()
  })

  it('returns preset comparison labels and limitation notes for 7d and 12m windows', () => {
    const sevenDays = getExecutiveOverview('Last 7 Days')
    expect(sevenDays.comparisonLabel).toBe('Jun 12 – Jun 18, 2024')
    expect(sevenDays.limitationNote).toContain('Jun 12–18')
    expect(sevenDays.revenueSeries).toHaveLength(1)

    const twelveMonths = getExecutiveOverview('Last 12 Months')
    expect(twelveMonths.comparisonLabel).toBe('vs. Available 2024 Baseline')
    expect(twelveMonths.limitationNote).toContain('2023 baseline')
    expect(twelveMonths.revenueSeries).toHaveLength(6)
  })

  it('handles custom date ranges inside, partially outside, and completely outside dataset bounds', () => {
    const singleMonth = getExecutiveOverview(
      'Custom Date Range',
      '2024-03-01',
      '2024-03-31',
    )
    expect(singleMonth.revenueSeries).toHaveLength(1)
    expect(singleMonth.revenueSeries[0]?.month).toBe('Mar')
    expect(singleMonth.limitationNote).toContain('selected month')

    const partial = getExecutiveOverview(
      'Custom Date Range',
      '2023-12-15',
      '2024-02-15',
    )
    expect(partial.revenueSeries.map((p) => p.month)).toEqual(['Jan', 'Feb'])
    expect(partial.limitationNote).toContain('Jan 1 – Jun 18, 2024')

    const emptyExec = getExecutiveOverview(
      'Custom Date Range',
      '2025-01-01',
      '2025-01-31',
    )
    expect(emptyExec.mrr).toBe(0)
    expect(emptyExec.arr).toBe(0)
    expect(emptyExec.totalCustomers).toBe(0)
    expect(emptyExec.revenueSeries).toEqual([])
    expect(emptyExec.insights[0]?.id).toBe('exec-empty')
    expect(emptyExec.limitationNote).toContain('No records exist')
  })

  it('throws 400 ApiServiceError for invalid or missing custom date ranges', () => {
    expect(() => getExecutiveOverview('Custom Date Range')).toThrowError(
      ApiServiceError,
    )
    try {
      getExecutiveOverview('Custom Date Range', '2024-02-30', '2024-03-01')
    } catch (err) {
      expect(err).toBeInstanceOf(ApiServiceError)
      expect((err as ApiServiceError).status).toBe(400)
    }
    expect(() =>
      getExecutiveOverview('Custom Date Range', '2024-05-01', '2024-04-01'),
    ).toThrowError('Start date cannot be later than end date.')
    expect(() =>
      getExecutiveOverview('Invalid Range' as DateRangeKey),
    ).toThrowError('Unsupported date_range')
  })

  it('computes revenue intelligence metrics, ARPU, and plan breakdown totals', () => {
    const rev = getRevenueIntelligence('Last 6 Months')
    const exec = getExecutiveOverview('Last 6 Months')
    expect(rev.mrr).toBe(exec.mrr)
    expect(rev.arr).toBe(exec.arr)
    expect(rev.arpu).toBe(
      Math.round((rev.mrr / exec.totalCustomers + Number.EPSILON) * 100) / 100,
    )
    const planTotalMrr = rev.planPerformance.reduce((sum, p) => sum + p.mrr, 0)
    expect(planTotalMrr).toBe(rev.mrr)

    const emptyRev = getRevenueIntelligence(
      'Custom Date Range',
      '2023-01-01',
      '2023-02-01',
    )
    expect(emptyRev.mrr).toBe(0)
    expect(emptyRev.arpu).toBe(0)
    expect(emptyRev.insights[0]?.id).toBe('rev-empty')
  })

  it('computes customer retention rates and churned customer list', () => {
    const ret = getCustomerRetention('Last 6 Months')
    expect(ret.retentionRate).toBeCloseTo(100 - ret.churnRate, 1)
    expect(ret.lostCustomers).toBe(ret.recentlyChurned.length)
    for (let i = 1; i < ret.recentlyChurned.length; i += 1) {
      expect(
        ret.recentlyChurned[i - 1].churnedDate >=
          ret.recentlyChurned[i].churnedDate,
      ).toBe(true)
    }

    const emptyRet = getCustomerRetention(
      'Custom Date Range',
      '2025-02-01',
      '2025-02-15',
    )
    expect(emptyRet.churnRate).toBe(0)
    expect(emptyRet.recentlyChurned).toEqual([])
    expect(emptyRet.insights[0]?.id).toBe('ret-empty')
  })

  it('computes customer growth, status distribution slices, and summary KPIs', () => {
    const growth = getCustomerGrowth('Last 6 Months')
    expect(growth.netGrowth).toBe(growth.newCustomers - growth.lostCustomers)
    const sliceSum = growth.distributionSlices.reduce(
      (sum, s) => sum + s.amount,
      0,
    )
    expect(sliceSum).toBe(growth.totalCustomers)

    const summary = getCustomerSummary('Last 6 Months')
    expect(summary.newCustomers).toBe(growth.newCustomers)
    expect(summary.lostCustomers).toBe(growth.lostCustomers)
    expect(summary.totalCustomers).toBe(growth.totalCustomers)
    expect(summary.avgSubscriptionValue).toBeGreaterThan(0)

    const emptyGrowth = getCustomerGrowth(
      'Custom Date Range',
      '2025-03-01',
      '2025-03-10',
    )
    expect(emptyGrowth.totalCustomers).toBe(0)
    expect(emptyGrowth.distributionSlices).toEqual([])

    const emptySummary = getCustomerSummary(
      'Custom Date Range',
      '2025-03-01',
      '2025-03-10',
    )
    expect(emptySummary.totalCustomers).toBe(0)
    expect(emptySummary.avgSubscriptionValue).toBe(0)
  })
})

describe('listCustomers and getCustomerById', () => {
  it('filters by trimmed search, plan, status, and dateRange together', () => {
    const result = listCustomers({
      search: '  acme ',
      plan: 'Pro',
      status: 'Active',
      dateRange: 'Last 7 Days',
    })
    expect(result.total).toBe(1)
    expect(result.items[0]?.id).toBe('cust-001')

    const byEmail = listCustomers({ search: 'NOVASYSTEMS.IO' })
    expect(byEmail.items.map((c) => c.id)).toEqual(['cust-002'])
  })

  it('sorts by MRR and signupDate in both directions', () => {
    const highestMrr = listCustomers({
      sortBy: 'mrr',
      sortDir: 'desc',
      pageSize: 200,
    })
    for (let i = 1; i < highestMrr.items.length; i += 1) {
      expect(highestMrr.items[i - 1].mrr).toBeGreaterThanOrEqual(
        highestMrr.items[i].mrr,
      )
    }

    const oldestSignup = listCustomers({
      sortBy: 'signupDate',
      sortDir: 'asc',
      pageSize: 200,
    })
    for (let i = 1; i < oldestSignup.items.length; i += 1) {
      expect(
        oldestSignup.items[i - 1].signupDate <=
          oldestSignup.items[i].signupDate,
      ).toBe(true)
    }
  })

  it('clamps out-of-bounds page and pageSize values', () => {
    const highPage = listCustomers({ page: 999, pageSize: 7 })
    expect(highPage.page).toBe(highPage.totalPages)

    const lowPage = listCustomers({ page: -3, pageSize: 0 })
    expect(lowPage.page).toBe(1)
    expect(lowPage.pageSize).toBe(1)

    const maxPageSize = listCustomers({ pageSize: 500 })
    expect(maxPageSize.pageSize).toBe(200)

    const outOfRange = listCustomers({
      dateRange: 'Custom Date Range',
      startDate: '2025-01-01',
      endDate: '2025-01-10',
    })
    expect(outOfRange.total).toBe(0)
    expect(outOfRange.totalPages).toBe(1)
    expect(outOfRange.items).toEqual([])
  })

  it('returns a customer by id or throws 404 ApiServiceError', () => {
    const customer = getCustomerById('cust-002')
    expect(customer.name).toBe('Nova Systems')

    try {
      getCustomerById('cust-missing')
      expect.unreachable('Expected getCustomerById to throw')
    } catch (err) {
      expect(err).toBeInstanceOf(ApiServiceError)
      expect((err as ApiServiceError).status).toBe(404)
    }
  })
})
