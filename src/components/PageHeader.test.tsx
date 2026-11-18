import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PageHeader } from './PageHeader'

describe('PageHeader', () => {
  it('calls onDateRangeChange when selecting a preset date range', async () => {
    const user = userEvent.setup()
    const onDateRangeChange = vi.fn()

    render(
      <PageHeader
        eyebrow="Analytics"
        title="Executive Overview"
        description="Snapshot"
        dateRange="Last 6 Months"
        onDateRangeChange={onDateRangeChange}
      />,
    )

    await user.selectOptions(
      screen.getByLabelText('Reporting date range'),
      'Last 30 Days',
    )
    expect(onDateRangeChange).toHaveBeenCalledWith('Last 30 Days')
  })

  it('validates custom date range input and submits only valid ranges', async () => {
    const user = userEvent.setup()
    const onCustomRangeChange = vi.fn()

    render(
      <PageHeader
        eyebrow="Analytics"
        title="Revenue Intelligence"
        description="Track revenue"
        dateRange="Custom Date Range"
        onDateRangeChange={vi.fn()}
        customRange={{ startDate: '2024-02-01', endDate: '2024-04-30' }}
        onCustomRangeChange={onCustomRangeChange}
        limitationNote="Results reflect available history."
      />,
    )

    expect(
      screen.getByText('Results reflect available history.'),
    ).toBeInTheDocument()

    const startInput = screen.getByLabelText('Custom start date')
    const endInput = screen.getByLabelText('Custom end date')

    await user.clear(startInput)
    await user.type(startInput, '2024-05-10')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Start date cannot be later than end date.',
    )
    expect(onCustomRangeChange).not.toHaveBeenCalled()

    await user.clear(endInput)
    await user.type(endInput, '2024-06-01')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Apply' }))
    expect(onCustomRangeChange).toHaveBeenCalledWith({
      startDate: '2024-05-10',
      endDate: '2024-06-01',
    })
  })

  it('toggles period filter button state', async () => {
    const user = userEvent.setup()
    const onFilterToggle = vi.fn()

    render(
      <PageHeader
        eyebrow="Analytics"
        title="Customer Retention"
        description="Analyze churn"
        dateRange="Last 6 Months"
        onDateRangeChange={vi.fn()}
        isFilterActive={true}
        onFilterToggle={onFilterToggle}
      />,
    )

    const filterBtn = screen.getByRole('button', {
      name: 'Toggle period filters',
    })
    expect(filterBtn).toHaveAttribute('aria-pressed', 'true')
    await user.click(filterBtn)
    expect(onFilterToggle).toHaveBeenCalledTimes(1)
  })
})
