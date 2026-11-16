import type { DateRangeKey } from '../data/dashboardData'
import { COMPARISON_LABELS, DATE_RANGE_OPTIONS } from '../data/dashboardData'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description: string
  dateRange: DateRangeKey
  onDateRangeChange: (nextRange: DateRangeKey) => void
  showComparisonLabel?: boolean
  showFilterButton?: boolean
  onFilterToggle?: () => void
  isFilterActive?: boolean
}

export function PageHeader({
  eyebrow,
  title,
  description,
  dateRange,
  onDateRangeChange,
  showComparisonLabel = true,
  showFilterButton = true,
  onFilterToggle,
  isFilterActive = false,
}: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[12.5px] font-medium text-[#667085]">{eyebrow}</p>
        <h1 className="text-2xl font-bold tracking-tight text-[#101828] mt-0.5">
          {title}
        </h1>
        <p className="text-[13px] text-[#667085] mt-1">{description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475467]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
          <select
            aria-label="Reporting date range"
            value={dateRange}
            onChange={(event) =>
              onDateRangeChange(event.target.value as DateRangeKey)
            }
            className="h-9 appearance-none rounded-lg border border-[#D0D5DD] bg-white pl-9 pr-9 text-[13px] font-medium text-[#344054] shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:bg-[#F9FAFB] focus:border-[#5B4DF0] focus:outline-none focus:ring-2 focus:ring-[#5B4DF0]/15 cursor-pointer"
          >
            {DATE_RANGE_OPTIONS.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#667085]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        {showComparisonLabel && (
          <span className="hidden sm:inline text-[12.5px] font-medium text-[#667085] whitespace-nowrap">
            {COMPARISON_LABELS[dateRange]}
          </span>
        )}

        {showFilterButton && (
          <button
            type="button"
            onClick={onFilterToggle}
            aria-label="Toggle period filters"
            aria-pressed={isFilterActive}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
              isFilterActive
                ? 'border-[#5B4DF0] bg-[#F5F3FF] text-[#4F46E5]'
                : 'border-[#D0D5DD] bg-white text-[#475467] hover:bg-[#F9FAFB]'
            }`}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
