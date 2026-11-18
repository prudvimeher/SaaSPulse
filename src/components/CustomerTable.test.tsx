import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Customer } from '../types/customer'
import { CustomerTable } from './CustomerTable'

const SAMPLE_CUSTOMERS: Customer[] = [
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
    mrrHistory: [],
    recentActivity: [],
    notes: '',
  },
  {
    id: 'cust-006',
    name: 'DevX Systems',
    email: 'support@devx.com',
    initials: 'DX',
    plan: 'Business',
    mrr: 499,
    status: 'Past Due',
    signupDate: '2024-06-08',
    billingCycle: 'Monthly',
    totalRevenue: 499,
    seats: 24,
    nextBillingDate: '2024-06-22',
    paymentMethod: 'Visa ending in 1903',
    mrrHistory: [],
    recentActivity: [],
    notes: '',
  },
]

function makeProps(overrides: Partial<React.ComponentProps<typeof CustomerTable>> = {}) {
  return {
    customers: SAMPLE_CUSTOMERS,
    totalCount: 32,
    currentPage: 1,
    totalPages: 5,
    pageSize: 7,
    searchQuery: '',
    planFilter: 'All' as const,
    statusFilter: 'All' as const,
    sortField: 'signupDate' as const,
    sortDirection: 'desc' as const,
    onSearchChange: vi.fn(),
    onPlanChange: vi.fn(),
    onStatusChange: vi.fn(),
    onSortChange: vi.fn(),
    onPageChange: vi.fn(),
    onResetFilters: vi.fn(),
    onExportCsv: vi.fn().mockResolvedValue(32),
    selectedCustomerId: 'cust-001',
    onSelectCustomer: vi.fn(),
    ...overrides,
  }
}

describe('CustomerTable', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders rows, triggers sorting/filtering, and navigates pagination', async () => {
    const user = userEvent.setup()
    const props = makeProps()
    render(<CustomerTable {...props} />)

    expect(screen.getByText('Acme Tech')).toBeInTheDocument()
    expect(screen.getByText('$499')).toBeInTheDocument()
    expect(screen.getByText('Showing 1–7 of 32 customers')).toBeInTheDocument()

    await user.click(screen.getByText('DevX Systems'))
    expect(props.onSelectCustomer).toHaveBeenCalledWith('cust-006')

    await user.click(screen.getByRole('button', { name: 'MRR' }))
    expect(props.onSortChange).toHaveBeenCalledWith('mrr', 'desc')

    await user.selectOptions(
      screen.getByLabelText('Filter by subscription plan'),
      'Enterprise',
    )
    expect(props.onPlanChange).toHaveBeenCalledWith('Enterprise')

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(props.onPageChange).toHaveBeenCalledWith(2)
  })

  it('handles row action menu and clipboard fallback feedback', async () => {
    const user = userEvent.setup()
    const writeText = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Clipboard blocked'))
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    const props = makeProps()
    render(<CustomerTable {...props} />)

    await user.click(
      screen.getByRole('button', { name: 'Row actions for Acme Tech' }),
    )
    await user.click(screen.getByRole('menuitem', { name: 'Copy email address' }))
    expect(writeText).toHaveBeenCalledWith('billing@acme.tech')
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Email copied')
    })

    await user.click(
      screen.getByRole('button', { name: 'Row actions for DevX Systems' }),
    )
    await user.click(screen.getByRole('menuitem', { name: 'Copy customer ID' }))
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        'Customer ID: cust-006',
      )
    })
  })

  it('handles CSV export success/failure and empty/error states', async () => {
    const user = userEvent.setup()

    const failingExport = vi.fn().mockRejectedValue(new Error('Network error'))
    const { rerender } = render(
      <CustomerTable {...makeProps({ onExportCsv: failingExport })} />,
    )

    await user.click(screen.getByRole('button', { name: 'Export' }))
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Export failed')
    })

    const onResetFilters = vi.fn()
    rerender(
      <CustomerTable
        {...makeProps({
          customers: [],
          totalCount: 0,
          totalPages: 1,
          planFilter: 'Enterprise',
          onResetFilters,
        })}
      />,
    )

    expect(screen.getByRole('button', { name: 'Export' })).toBeDisabled()
    expect(screen.getByText('Showing 0 of 0 customers')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(onResetFilters).toHaveBeenCalledTimes(1)

    const onRetry = vi.fn()
    rerender(
      <CustomerTable
        {...makeProps({
          errorMessage: 'API unavailable',
          onRetry,
        })}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('API unavailable')
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
