import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Customer360Page } from './Customer360Page'
import type {
  CustomerListResponse,
  CustomerSummaryResponse,
} from '../types/analytics'
import type { Customer } from '../types/customer'

const CUSTOMERS: Customer[] = [
  {
    id: 'cust-001',
    name: 'Acme Tech',
    email: 'billing@acme.tech',
    initials: 'AT',
    plan: 'Pro',
    mrr: 249,
    status: 'Active',
    signupDate: '2024-06-18',
    billingCycle: 'Monthly',
    totalRevenue: 249,
    seats: 12,
    nextBillingDate: '2024-07-18',
    paymentMethod: 'Visa ending in 4242',
    mrrHistory: [{ month: 'Jun', label: 'Jun 2024', value: 249 }],
    recentActivity: [
      { id: 'a1', title: 'Paid $249', timestamp: 'Jun 18, 2024' },
    ],
    notes: 'Pro account',
  },
  {
    id: 'cust-002',
    name: 'Nova Systems',
    email: 'hello@novasystems.io',
    initials: 'NS',
    plan: 'Business',
    mrr: 499,
    status: 'Active',
    signupDate: '2024-06-16',
    billingCycle: 'Annual',
    totalRevenue: 5988,
    seats: 28,
    nextBillingDate: '2025-06-16',
    paymentMethod: 'Mastercard ending in 8819',
    mrrHistory: [{ month: 'Jun', label: 'Jun 2024', value: 499 }],
    recentActivity: [],
    notes: 'Annual Business contract',
  },
]

const SUMMARY_RESPONSE: CustomerSummaryResponse = {
  totalCustomers: 67,
  newCustomers: 29,
  lostCustomers: 4,
  avgSubscriptionValue: 382.5,
  totalChange: '+5.1%',
  totalTrend: 'up',
  newChange: '+10.0%',
  newTrend: 'up',
  lostChange: '-20.0%',
  lostTrend: 'down',
  avgValueChange: '+3.2%',
  avgValueTrend: 'up',
  totalSparkline: [60, 67],
  newSparkline: [12, 29],
  lostSparkline: [2, 4],
  avgValueSparkline: [370, 382.5],
  comparisonLabel: 'Jan – Jun 2024',
  limitationNote: null,
  startDate: '2024-01-01',
  endDate: '2024-06-18',
}

describe('Customer360Page integration', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads summary, table, and auto-selected customer detail, then recovers on error retry', async () => {
    const user = userEvent.setup()
    let failSummaryOnce = true

    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async (input) => {
        const url = String(input)
        if (url.startsWith('/api/customers/summary')) {
          if (failSummaryOnce) {
            failSummaryOnce = false
            return new Response(
              JSON.stringify({ detail: 'Summary service timeout' }),
              { status: 500, headers: { 'content-type': 'application/json' } },
            )
          }
          return new Response(JSON.stringify(SUMMARY_RESPONSE), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          })
        }

        if (url.startsWith('/api/customers/cust-')) {
          const id = url.split('/').pop()
          const found = CUSTOMERS.find((c) => c.id === id) ?? CUSTOMERS[0]
          return new Response(JSON.stringify(found), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          })
        }

        const listResponse: CustomerListResponse = {
          items: url.includes('plan=Business') ? [CUSTOMERS[1]] : CUSTOMERS,
          total: url.includes('plan=Business') ? 1 : 2,
          page: 1,
          pageSize: url.includes('page_size=200') ? 200 : 7,
          totalPages: 1,
        }
        return new Response(JSON.stringify(listResponse), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      })

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <Customer360Page
          dateRange="Last 6 Months"
          onDateRangeChange={vi.fn()}
          customRange={{ startDate: '2024-01-01', endDate: '2024-06-18' }}
          onCustomRangeChange={vi.fn()}
        />
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Summary service timeout')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    await waitFor(() => {
      expect(screen.getByText('$382.50')).toBeInTheDocument()
    })
    expect(screen.getByLabelText('Customer details for Acme Tech')).toBeInTheDocument()

    await user.selectOptions(
      screen.getByLabelText('Filter by subscription plan'),
      'Business',
    )

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([req]) =>
          String(req).includes('plan=Business&status=All&sort_by=signupDate&sort_dir=desc&page=1'),
        ),
      ).toBe(true)
    })
  })
})
