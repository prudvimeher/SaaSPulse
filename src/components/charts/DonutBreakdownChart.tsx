import { useState } from 'react'
import type { PlanBreakdownSlice } from '../../data/dashboardData'
import { formatCurrency } from '../../utils/formatters'

interface DonutBreakdownChartProps {
  slices: PlanBreakdownSlice[]
  centerValue: string
  centerLabel: string
  valueFormat?: 'currency' | 'count'
}

export function DonutBreakdownChart({
  slices,
  centerValue,
  centerLabel,
  valueFormat = 'currency',
}: DonutBreakdownChartProps) {
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null)

  const total = slices.reduce((sum, item) => sum + item.amount, 0)
  const size = 160
  const strokeWidth = 24
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  const segments = slices.reduce<
    (PlanBreakdownSlice & { dashLength: number; offset: number })[]
  >((acc, slice) => {
    const ratio = total > 0 ? slice.amount / total : 0
    const dashLength = ratio * circumference
    const prevUsed = acc.reduce((sum, item) => sum + item.dashLength, 0)
    acc.push({
      ...slice,
      dashLength,
      offset: -prevUsed,
    })
    return acc
  }, [])

  const activeSlice = hoveredPlan
    ? slices.find((slice) => slice.plan === hoveredPlan) ?? null
    : null

  const displayCenterValue = activeSlice
    ? valueFormat === 'currency'
      ? formatCurrency(activeSlice.amount)
      : activeSlice.amount.toLocaleString('en-US')
    : centerValue

  const displayCenterLabel = activeSlice ? activeSlice.plan : centerLabel

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          role="img"
          aria-label={centerLabel}
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#F2F4F7"
            strokeWidth={strokeWidth}
          />
          {segments.map((segment) => {
            if (segment.dashLength <= 0) return null
            const isDimmed = hoveredPlan !== null && hoveredPlan !== segment.plan
            return (
              <circle
                key={segment.plan}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${segment.dashLength} ${circumference}`}
                strokeDashoffset={segment.offset}
                className="transition-opacity duration-150 cursor-pointer"
                style={{ opacity: isDimmed ? 0.45 : 1 }}
                onMouseEnter={() => setHoveredPlan(segment.plan)}
                onMouseLeave={() => setHoveredPlan(null)}
              />
            )
          })}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="text-[17px] font-bold text-[#101828] font-tabular leading-tight">
            {displayCenterValue}
          </span>
          <span className="text-[11px] font-medium text-[#667085] mt-0.5 truncate max-w-[92px]">
            {displayCenterLabel}
          </span>
        </div>
      </div>

      <div className="flex-1 w-full space-y-2.5">
        {slices.map((slice) => {
          const isHovered = hoveredPlan === slice.plan
          return (
            <div
              key={slice.plan}
              onMouseEnter={() => setHoveredPlan(slice.plan)}
              onMouseLeave={() => setHoveredPlan(null)}
              className={`flex items-center justify-between gap-3 rounded-md px-2 py-1 text-[13px] transition-colors cursor-default ${
                isHovered ? 'bg-[#F9FAFB]' : ''
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="h-3 w-3 rounded-[3px] shrink-0"
                  style={{ backgroundColor: slice.color }}
                  aria-hidden="true"
                />
                <span className="font-medium text-[#344054] truncate">
                  {slice.plan}
                </span>
              </div>

              <div className="flex items-center gap-4 shrink-0 font-tabular">
                <span className="font-semibold text-[#101828]">
                  {valueFormat === 'currency'
                    ? formatCurrency(slice.amount)
                    : slice.amount.toLocaleString('en-US')}
                </span>
                <span className="w-11 text-right text-xs text-[#667085]">
                  {slice.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
