import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Customer } from '../types/customer'
import { CustomerDetailPanel } from './CustomerDetailPanel'

const CANCELED_CUSTOMER: Customer = {
  id: 'cust-007',
  name: 'TechMove',
  email: 'hello@techmove.io',
  initials: 'TM',
  plan: 'Starter',
  mrr: 49,
  status: 'Canceled',
  signupDate: '2024-05-28',
  billingCycle: 'Monthly',
  totalRevenue: 49,
  seats: 2,
  nextBillingDate: null,
  paymentMethod: 'Mastercard ending in 3398',
  mrrHistory: [
    { month: 'May', label: 'May 2024', value: 49 },
    { month: 'Jun', label: 'Jun 2024', value: 0 },
  ],
  recentActivity: [
    {
      id: 'act-1',
      title: 'Subscription canceled (Other)',
      timestamp: 'Jun 12, 2024',
    },
  ],
  notes: 'Paused subscription during internal restructuring.',
}

describe('CustomerDetailPanel', () => {
  it('renders loading, error, and empty states', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()

    const { rerender } = render(
      <CustomerDetailPanel customer={null} isLoading={true} />,
    )
    expect(screen.getByLabelText('Loading customer details')).toHaveAttribute(
      'aria-busy',
      'true',
    )

    rerender(
      <CustomerDetailPanel
        customer={null}
        errorMessage="Customer not found."
        onRetry={onRetry}
      />,
    )
    expect(screen.getByText('Customer not found.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledTimes(1)

    rerender(<CustomerDetailPanel customer={null} />)
    expect(screen.getByText('No customer selected')).toBeInTheDocument()
  })

  it('switches across all profile tabs and renders unscheduled billing state', async () => {
    const user = userEvent.setup()
    render(<CustomerDetailPanel customer={CANCELED_CUSTOMER} />)

    expect(screen.getByText('TechMove')).toBeInTheDocument()
    expect(screen.getByText('Starter')).toBeInTheDocument()
    expect(screen.getByText('May 28, 2024')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Subscription' }))
    expect(screen.getByText('2 seats')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Billing' }))
    expect(screen.getByText('Mastercard ending in 3398')).toBeInTheDocument()
    expect(screen.getByText('Not scheduled')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Activity' }))
    expect(
      screen.getByText('Subscription canceled (Other)'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Notes' }))
    expect(
      screen.getByText('Paused subscription during internal restructuring.'),
    ).toBeInTheDocument()
  })
})
