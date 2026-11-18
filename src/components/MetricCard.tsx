import { useId } from 'react'
import type { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  comparisonLabel?: string
  icon: ReactNode
  sparklinePoints: number[]
  infoLabel?: string
}

export function MetricCard({
  title,
  value,
  change,
  trend,
  comparisonLabel = 'vs. previous period',
  icon,
  sparklinePoints,
  infoLabel,
}: MetricCardProps) {
  const sparkId = useId()
  const safePoints = sparklinePoints.length > 0 ? sparklinePoints : [0]
  const min = Math.min(...safePoints)
  const max = Math.max(...safePoints)
  const range = Math.max(max - min, 1)
  const width = 76
  const height = 28

  const coords = safePoints.map((pt, index) => {
    const x =
      safePoints.length === 1
        ? width / 2
        : (index / (safePoints.length - 1)) * width
    const y = height - 3 - ((pt - min) / range) * (height - 8)
    return `${x},${y}`
  })

  const polyline = coords.join(' ')
  const area = `0,${height} ${polyline} ${width},${height}`

  return (
    <div className="bg-white dark:bg-[#111827] border border-[#E6E8EF] dark:border-[#1F2937] rounded-xl px-4 py-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex items-end justify-between gap-3 transition-colors">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[#475467] dark:text-[#94A3B8]">
          <span
            className="shrink-0 text-[#475467] dark:text-[#94A3B8]"
            aria-hidden="true"
          >
            {icon}
          </span>
          <span className="text-[12.5px] font-medium text-[#344054] dark:text-[#CBD5E1] truncate">
            {title}
          </span>
          {infoLabel && (
            <span
              title={infoLabel}
              aria-label={infoLabel}
              className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-[#D0D5DD] dark:border-[#334155] text-[9px] font-semibold text-[#667085] dark:text-[#94A3B8]"
            >
              i
            </span>
          )}
        </div>

        <p className="mt-2 text-[22px] font-bold tracking-tight text-[#101828] dark:text-[#F8FAFC] font-tabular leading-none">
          {value}
        </p>

        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
          <span
            className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold font-tabular ${
              trend === 'up'
                ? 'bg-[#ECFDF3] dark:bg-[#064E3B]/50 text-[#067647] dark:text-[#6EE7B7]'
                : 'bg-[#F2F4F7] dark:bg-[#1E293B] text-[#344054] dark:text-[#CBD5E1]'
            }`}
          >
            <span aria-hidden="true">{trend === 'up' ? '↗' : '↘'}</span>
            <span>{change}</span>
          </span>
          <span className="text-[11px] text-[#667085] dark:text-[#94A3B8] whitespace-nowrap">
            {comparisonLabel}
          </span>
        </div>
      </div>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="shrink-0 overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={sparkId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#${sparkId})`} />
        <polyline
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polyline}
          className="stroke-[#475569] dark:stroke-[#94A3B8]"
        />
      </svg>
    </div>
  )
}
