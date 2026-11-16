import { useId, useState } from 'react'

export interface AreaTrendPoint {
  month: string
  fullLabel: string
  value: number
}

interface AreaTrendChartProps {
  data: AreaTrendPoint[]
  valueLabel: string
  strokeColor?: string
  fillColor?: string
  formatValue: (value: number) => string
  formatYAxis: (value: number) => string
  defaultActiveIndex?: number
  yMin?: number
  yMaxOverride?: number
}

export function AreaTrendChart({
  data,
  valueLabel,
  strokeColor = '#475569',
  fillColor = '#64748B',
  formatValue,
  formatYAxis,
  defaultActiveIndex,
  yMin = 0,
  yMaxOverride,
}: AreaTrendChartProps) {
  const gradientId = useId()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const width = 560
  const height = 220
  const padLeft = 52
  const padRight = 22
  const padTop = 36
  const padBottom = 28
  const innerWidth = width - padLeft - padRight
  const innerHeight = height - padTop - padBottom

  const rawMax = Math.max(...data.map((point) => point.value), 1)
  const yMax = yMaxOverride ?? rawMax * 1.18
  const yRange = Math.max(yMax - yMin, 1)
  const yTickCount = 5
  const yTicks = Array.from({ length: yTickCount }, (_, idx) => {
    return yMin + ((yMax - yMin) * idx) / (yTickCount - 1)
  })

  const coords = data.map((point, index) => {
    const x =
      data.length <= 1
        ? padLeft + innerWidth / 2
        : padLeft + (index / (data.length - 1)) * innerWidth
    const y = padTop + innerHeight - ((point.value - yMin) / yRange) * innerHeight
    return { ...point, x, y }
  })

  const linePath = coords
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`)
    .join(' ')
  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1].x} ${padTop + innerHeight} L ${coords[0].x} ${padTop + innerHeight} Z`
      : ''

  const fallbackIndex =
    defaultActiveIndex !== undefined
      ? Math.min(defaultActiveIndex, Math.max(0, coords.length - 1))
      : Math.max(0, coords.length - 1)
  const activeIndex = hoveredIndex ?? fallbackIndex
  const activePoint = coords[activeIndex]

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label={`${valueLabel} trend chart`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity="0.22" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines */}
        {yTicks.map((tick, idx) => {
          const y = padTop + innerHeight - ((tick - yMin) / yRange) * innerHeight
          return (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="#EAECF0"
                strokeWidth="1"
              />
              <text
                x={padLeft - 10}
                y={y + 4}
                textAnchor="end"
                className="fill-[#667085] text-[11px] font-tabular"
              >
                {formatYAxis(tick)}
              </text>
            </g>
          )
        })}

        {/* Area and Line */}
        {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Active Vertical Guide */}
        {activePoint && (
          <line
            x1={activePoint.x}
            y1={padTop}
            x2={activePoint.x}
            y2={padTop + innerHeight}
            stroke="#98A2B3"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        )}

        {/* Data Points and Hover Hit Targets */}
        {coords.map((pt, index) => {
          const isActive = index === activeIndex
          return (
            <g key={pt.month}>
              <text
                x={pt.x}
                y={height - 6}
                textAnchor="middle"
                className="fill-[#667085] text-[11px] font-medium"
              >
                {pt.month}
              </text>

              <circle
                cx={pt.x}
                cy={pt.y}
                r={isActive ? 4.5 : 3.25}
                fill={isActive ? strokeColor : '#FFFFFF'}
                stroke={strokeColor}
                strokeWidth="2"
              />

              {/* Larger invisible hover area */}
              <rect
                x={pt.x - innerWidth / Math.max(coords.length * 2, 2)}
                y={padTop - 10}
                width={innerWidth / Math.max(coords.length, 1)}
                height={innerHeight + 28}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            </g>
          )
        })}

        {/* Floating Tooltip Callout */}
        {activePoint && (() => {
          const boxWidth = 118
          const boxHeight = 40
          const rawBoxX = activePoint.x - boxWidth / 2
          const boxX = Math.max(
            padLeft,
            Math.min(rawBoxX, width - padRight - boxWidth),
          )
          const boxY = Math.max(2, activePoint.y - boxHeight - 12)

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
                x={boxX + 10}
                y={boxY + 15}
                className="fill-[#667085] text-[10px] font-medium"
              >
                {activePoint.fullLabel}
              </text>
              <circle
                cx={boxX + 14}
                cy={boxY + 28}
                r="3"
                fill={strokeColor}
              />
              <text
                x={boxX + 22}
                y={boxY + 31}
                className="fill-[#101828] text-[11px] font-semibold font-tabular"
              >
                {valueLabel}: {formatValue(activePoint.value)}
              </text>
            </g>
          )
        })()}
      </svg>
    </div>
  )
}
