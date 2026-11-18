import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AreaTrendChart } from './AreaTrendChart'
import { DonutBreakdownChart } from './DonutBreakdownChart'
import { GrowthComboChart } from './GrowthComboChart'

describe('Chart components', () => {
  it('renders empty state and single-point SVG without NaN in AreaTrendChart', () => {
    const { rerender, container } = render(
      <AreaTrendChart
        data={[]}
        valueLabel="MRR"
        formatValue={(v) => `$${v}`}
        formatYAxis={(v) => `$${v}`}
      />,
    )
    expect(
      screen.getByText('No trend data available for the selected date range.'),
    ).toBeInTheDocument()

    rerender(
      <AreaTrendChart
        data={[
          { month: 'May', fullLabel: 'May 2024', value: 12000 },
          { month: 'Jun', fullLabel: 'Jun 2024', value: 15000 },
        ]}
        valueLabel="MRR"
        defaultActiveIndex={1}
        formatValue={(v) => `$${v}`}
        formatYAxis={(v) => `$${v}`}
      />,
    )

    expect(screen.getByText('MRR: $15000')).toBeInTheDocument()
    const hitTargets = container.querySelectorAll('rect[fill="transparent"]')
    fireEvent.mouseEnter(hitTargets[0])
    expect(screen.getByText('MRR: $12000')).toBeInTheDocument()
    expect(container.innerHTML).not.toContain('NaN')

    rerender(
      <AreaTrendChart
        data={[{ month: 'Jun', fullLabel: 'Jun 2024', value: 15000 }]}
        valueLabel="MRR"
        formatValue={(v) => `$${v}`}
        formatYAxis={(v) => `$${v}`}
      />,
    )
    expect(container.innerHTML).not.toContain('NaN')
  })

  it('handles empty state and legend hover updates in DonutBreakdownChart', () => {
    const { rerender } = render(
      <DonutBreakdownChart
        slices={[]}
        centerValue="$0"
        centerLabel="Total MRR"
      />,
    )
    expect(
      screen.getByText(
        'No breakdown data available for the selected date range.',
      ),
    ).toBeInTheDocument()

    rerender(
      <DonutBreakdownChart
        slices={[
          { plan: 'Pro', amount: 4000, percentage: 80, color: '#64748B' },
          { plan: 'Starter', amount: 1000, percentage: 20, color: '#94A3B8' },
        ]}
        centerValue="$5,000"
        centerLabel="Total MRR"
      />,
    )

    expect(screen.getByText('$5,000')).toBeInTheDocument()
    expect(screen.getByText('Total MRR')).toBeInTheDocument()

    fireEvent.mouseEnter(screen.getByText('Starter'))
    expect(screen.queryByText('Total MRR')).not.toBeInTheDocument()
    expect(screen.queryByText('$5,000')).not.toBeInTheDocument()
    expect(screen.getAllByText('$1,000')).toHaveLength(2)
    expect(screen.getAllByText('Starter')).toHaveLength(2)

    fireEvent.mouseLeave(screen.getAllByText('Starter')[1])
    expect(screen.getByText('$5,000')).toBeInTheDocument()
    expect(screen.getByText('Total MRR')).toBeInTheDocument()
  })

  it('handles empty state and hover tooltip updates in GrowthComboChart', () => {
    const { rerender, container } = render(<GrowthComboChart data={[]} />)
    expect(
      screen.getByText(
        'No growth trend data available for the selected date range.',
      ),
    ).toBeInTheDocument()

    rerender(
      <GrowthComboChart
        data={[
          {
            month: 'May',
            fullLabel: 'May 2024',
            newCustomers: 10,
            lostCustomers: 2,
            netGrowth: 8,
          },
          {
            month: 'Jun',
            fullLabel: 'Jun 2024',
            newCustomers: 14,
            lostCustomers: 3,
            netGrowth: 11,
          },
        ]}
      />,
    )

    expect(screen.getByText('New: 14')).toBeInTheDocument()
    const hitTargets = container.querySelectorAll('rect[fill="transparent"]')
    fireEvent.mouseEnter(hitTargets[0])
    expect(screen.getByText('New: 10')).toBeInTheDocument()
    expect(screen.getByText('Net: +8')).toBeInTheDocument()
  })
})
