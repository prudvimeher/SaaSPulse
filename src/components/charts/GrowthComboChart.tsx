import { useState } from 'react'
import type { GrowthTrendPoint } from '../../data/dashboardData'

interface GrowthComboChartProps {
  data: GrowthTrendPoint[]
}

export function GrowthComboChart({ data }: GrowthComboChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const width = 560
  const height = 215
  const padLeft = 40
  const padRight = 18
  const padTop = 44
  const padBottom = 26
  const innerWidth = width - padLeft - padRight
  const innerHeight = height - padTop - padBottom

  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.newCustomers, d.lostCustomers, d.netGrowth)),
    250,
  )
  const yMax = Math.ceil(maxVal / 50) * 50
  const yTicks = [0, 50, 100, 150, 200, 250, 300].filter((t) => t <= yMax + 50)
  const effectiveYMax = yTicks[yTicks.length - 1] ?? 300

  const slotWidth = innerWidth / Math.max(data.length, 1)
  const barWidth = Math.min(20, slotWidth * 0.28)

  const points = data.map((point, index) => {
    const centerX = padLeft + slotWidth * index + slotWidth / 2
    const newHeight = (point.newCustomers / effectiveYMax) * innerHeight
    const lostHeight = (point.lostCustomers / effectiveYMax) * innerHeight
    const netY =
      padTop + innerHeight - (point.netGrowth / effectiveYMax) * innerHeight
    return {
      ...point,
      centerX,
      newX: centerX - barWidth - 2,
      newY: padTop + innerHeight - newHeight,
      newHeight,
      lostX: centerX + 2,
      lostY: padTop + innerHeight - lostHeight,
      lostHeight,
      netY,
    }
  })

  const netLinePath = points
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.centerX} ${pt.netY}`)
    .join(' ')

  const activeIndex = hoveredIndex ?? Math.max(0, points.length - 1)
  const activePoint = points[activeIndex]

  return (
    <div className="space-y-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label="Customer growth trend chart showing new, lost, and net customers"
      >
        {/* Gridlines */}
        {yTicks.map((tick) => {
          const y =
            padTop + innerHeight - (tick / effectiveYMax) * innerHeight
          return (
            <g key={tick}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="#EAECF0"
                strokeWidth="1"
              />
              <text
                x={padLeft - 8}
                y={y + 3.5}
                textAnchor="end"
                className="fill-[#667085] text-[10.5px] font-tabular"
              >
                {tick}
              </text>
            </g>
          )
        })}

        {/* Bars */}
        {points.map((pt, idx) => {
          const isActive = idx === activeIndex
          return (
            <g key={pt.month}>
              <rect
                x={pt.newX}
                y={pt.newY}
                width={barWidth}
                height={pt.newHeight}
                rx="3"
                fill={isActive ? '#8E83EE' : '#CBC6F9'}
              />
              <rect
                x={pt.lostX}
                y={pt.lostY}
                width={barWidth}
                height={pt.lostHeight}
                rx="3"
                fill={isActive ? '#CBD5E1' : '#E2E8F0'}
              />
              <text
                x={pt.centerX}
                y={height - 6}
                textAnchor="middle"
                className="fill-[#667085] text-[11px] font-medium"
              >
                {pt.month}
              </text>
            </g>
          )
        })}

        {/* Active Vertical Dashed Line */}
        {activePoint && (
          <line
            x1={activePoint.centerX}
            y1={padTop}
            x2={activePoint.centerX}
            y2={padTop + innerHeight}
            stroke="#98A2B3"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        )}

        {/* Net Growth Line */}
        {netLinePath && (
          <path
            d={netLinePath}
            fill="none"
            stroke="#312E81"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Line Dots and Hover Targets */}
        {points.map((pt, idx) => {
          const isActive = idx === activeIndex
          return (
            <g key={`net-${pt.month}`}>
              <circle
                cx={pt.centerX}
                cy={pt.netY}
                r={isActive ? 4.25 : 3.25}
                fill="#FFFFFF"
                stroke="#312E81"
                strokeWidth="2"
              />
              <rect
                x={pt.centerX - slotWidth / 2}
                y={padTop - 8}
                width={slotWidth}
                height={innerHeight + 24}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            </g>
          )
        })}

        {/* Tooltip Callout */}
        {activePoint && (() => {
          const boxWidth = 104
          const boxHeight = 62
          const boxX = Math.max(
            padLeft,
            Math.min(activePoint.centerX - boxWidth / 2, width - padRight - boxWidth),
          )
          const boxY = Math.max(2, activePoint.newY - boxHeight - 6)

          return (
            <g pointerEvents="none">
              <rect
                x={boxX}
                y={boxY}
                width={boxWidth}
                height={boxHeight}
                rx="8"
                fill="#FFFFFF"
                stroke="#E4E7EC"
                strokeWidth="1"
              />
              <text
                x={boxX + 9}
                y={boxY + 15}
                className="fill-[#101828] text-[10px] font-semibold"
              >
                {activePoint.fullLabel}
              </text>
              <circle cx={boxX + 13} cy={boxY + 27} r="2.5" fill="#8E83EE" />
              <text
                x={boxX + 20}
                y={boxY + 30}
                className="fill-[#475467] text-[9.5px] font-tabular"
              >
                New: {activePoint.newCustomers}
              </text>
              <circle cx={boxX + 13} cy={boxY + 40} r="2.5" fill="#CBD5E1" />
              <text
                x={boxX + 20}
                y={boxY + 43}
                className="fill-[#475467] text-[9.5px] font-tabular"
              >
                Lost: {activePoint.lostCustomers}
              </text>
              <circle
                cx={boxX + 13}
                cy={boxY + 53}
                r="2.5"
                fill="#FFFFFF"
                stroke="#312E81"
                strokeWidth="1.5"
              />
              <text
                x={boxX + 20}
                y={boxY + 56}
                className="fill-[#101828] text-[9.5px] font-semibold font-tabular"
              >
                Net: +{activePoint.netGrowth}
              </text>
            </g>
          )
        })()}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-5 text-[11.5px] font-medium text-[#475467]">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[2px] bg-[#A59FF7]" aria-hidden="true" />
          <span>New Customers</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[2px] bg-[#D1D5DB]" aria-hidden="true" />
          <span>Lost Customers</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex h-2.5 w-2.5 items-center justify-center rounded-full border-2 border-[#312E81] bg-white" aria-hidden="true" />
          <span>Net Growth</span>
        </div>
      </div>
    </div>
  )
}
