import type { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  comparisonLabel?: string
  icon: ReactNode
  sparklinePoints: number[]
}

export function MetricCard({
  title,
  value,
  change,
  trend,
  comparisonLabel = 'vs. previous period',
  icon,
  sparklinePoints,
}: MetricCardProps) {
  const min = Math.min(...sparklinePoints)
  const max = Math.max(...sparklinePoints)
  const range = Math.max(max - min, 1)
  const width = 76
  const height = 28

  const coords = sparklinePoints.map((pt, index) => {
    const x =
      sparklinePoints.length === 1
        ? width / 2
        : (index / (sparklinePoints.length - 1)) * width
    const y = height - 3 - ((pt - min) / range) * (height - 8)
    return `${x},${y}`
  })

  const polyline = coords.join(' ')
  const area = `0,${height} ${polyline} ${width},${height}`

  return (
    <div className="bg-white border border-[#E6E8EF] rounded-xl px-4 py-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[#475467]">
          <span className="shrink-0 text-[#475467]" aria-hidden="true">
            {icon}
          </span>
          <span className="text-[12.5px] font-medium text-[#344054] truncate">
            {title}
          </span>
        </div>

        <p className="mt-2 text-[22px] font-bold tracking-tight text-[#101828] font-tabular leading-none">
          {value}
        </p>

        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
          <span
            className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold font-tabular ${
              trend === 'up'
                ? 'bg-[#ECFDF3] text-[#067647]'
                : 'bg-[#F2F4F7] text-[#344054]'
            }`}
          >
            <span aria-hidden="true">{trend === 'up' ? '↗' : '↘'}</span>
            <span>{change}</span>
          </span>
          <span className="text-[11px] text-[#667085] whitespace-nowrap">
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
          <linearGradient id={`spark-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={area}
          fill={`url(#spark-${title.replace(/\s+/g, '')})`}
        />
        <polyline
          fill="none"
          stroke="#475569"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polyline}
        />
      </svg>
    </div>
  )
}
