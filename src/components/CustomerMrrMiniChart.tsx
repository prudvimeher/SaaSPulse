import { useId, useState } from 'react'
import type { RevenueHistoryPoint } from '../types/customer'
import { formatCurrency } from '../utils/formatters'

interface CustomerMrrMiniChartProps {
  customerName: string
  history: RevenueHistoryPoint[]
}

export function CustomerMrrMiniChart({
  customerName,
  history,
}: CustomerMrrMiniChartProps) {
  const gradId = useId()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const maxVal = Math.max(...history.map((point) => point.value), 100)
  const yMax = Math.ceil((maxVal * 1.2) / 50) * 50
  const yTicks = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax]

  const chartWidth = 280
  const chartHeight = 128
  const padLeft = 36
  const padRight = 14
  const padTop = 14
  const padBottom = 22
  const innerWidth = chartWidth - padLeft - padRight
  const innerHeight = chartHeight - padTop - padBottom

  const points = history.map((point, index) => {
    const x =
      history.length === 1
        ? padLeft + innerWidth / 2
        : padLeft + (index / (history.length - 1)) * innerWidth
    const y = padTop + innerHeight - (point.value / yMax) * innerHeight
    return { ...point, x, y }
  })

  const linePath = points
    .map((point, idx) => `${idx === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${padTop + innerHeight} L ${points[0].x} ${padTop + innerHeight} Z`
      : ''

  const activePointIndex =
    hoveredIndex !== null && hoveredIndex < points.length
      ? hoveredIndex
      : points.length - 1
  const activePoint = points[activePointIndex]

  return (
    <div className="rounded-xl border border-[#EAECF0] dark:border-[#1F2937] bg-white dark:bg-[#161F33] p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="text-[13px] font-semibold text-[#101828] dark:text-[#F8FAFC]">
          Revenue (MRR)
        </h3>
        {activePoint && (
          <div className="rounded-md border border-[#E4E7EC] dark:border-[#334155] bg-[#FCFCFD] dark:bg-[#0F172A] px-2 py-1 text-right shadow-2xs">
            <div className="text-[10px] text-[#667085] dark:text-[#94A3B8] leading-tight">
              {activePoint.label}
            </div>
            <div className="text-[11.5px] font-semibold text-[#101828] dark:text-[#F8FAFC] font-tabular leading-tight">
              {formatCurrency(activePoint.value)}
            </div>
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label={`Monthly recurring revenue trend for ${customerName}`}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5B4DF0" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#5B4DF0" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => {
          const y = padTop + innerHeight - (tick / yMax) * innerHeight
          return (
            <g key={tick}>
              <line
                x1={padLeft}
                y1={y}
                x2={chartWidth - padRight}
                y2={y}
                strokeWidth="1"
                className="stroke-[#F2F4F7] dark:stroke-[#1F2937]"
              />
              <text
                x={padLeft - 6}
                y={y + 3}
                textAnchor="end"
                className="fill-[#667085] dark:fill-[#94A3B8] text-[9px] font-tabular"
              >
                ${Math.round(tick)}
              </text>
            </g>
          )
        })}

        {areaPath && <path d={areaPath} fill={`url(#${gradId})`} />}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="#5B4DF0"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {points.map((point, index) => {
          const isActive = index === activePointIndex
          return (
            <g key={point.month}>
              <text
                x={point.x}
                y={chartHeight - 5}
                textAnchor="middle"
                className="fill-[#667085] dark:fill-[#94A3B8] text-[9px]"
              >
                {point.month}
              </text>
              <circle
                cx={point.x}
                cy={point.y}
                r={isActive ? 4 : 2.75}
                fill={isActive ? '#5B4DF0' : undefined}
                stroke="#5B4DF0"
                strokeWidth="1.75"
                className={`cursor-pointer ${
                  isActive ? '' : 'fill-white dark:fill-[#161F33]'
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
