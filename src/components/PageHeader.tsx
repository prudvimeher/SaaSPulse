import { useState } from 'react'
import type { CustomDateRange, DateRangeKey } from '../types/analytics'
import {
  DATE_RANGE_OPTIONS,
  DEFAULT_CUSTOM_RANGE,
  validateCustomDateRange,
} from '../utils/dateRanges'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description: string
  dateRange: DateRangeKey
  onDateRangeChange: (nextRange: DateRangeKey) => void
  customRange?: CustomDateRange
  onCustomRangeChange?: (nextRange: CustomDateRange) => void
  comparisonLabel?: string
  limitationNote?: string | null
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
  customRange = DEFAULT_CUSTOM_RANGE,
  onCustomRangeChange,
  comparisonLabel,
  limitationNote = null,
  showComparisonLabel = true,
  showFilterButton = true,
  onFilterToggle,
  isFilterActive = false,
}: PageHeaderProps) {
  const [draftStart, setDraftStart] = useState(customRange.startDate)
  const [draftEnd, setDraftEnd] = useState(customRange.endDate)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSelectChange = (nextKey: DateRangeKey) => {
    setValidationError(null)
    if (nextKey === 'Custom Date Range') {
      setDraftStart(customRange.startDate)
      setDraftEnd(customRange.endDate)
    }
    onDateRangeChange(nextKey)
  }

  const handleApplyCustomRange = (event: React.FormEvent) => {
    event.preventDefault()
    const nextRange: CustomDateRange = {
      startDate: draftStart,
      endDate: draftEnd,
    }
    const error = validateCustomDateRange(nextRange)
    if (error) {
      setValidationError(error)
      return
    }
    setValidationError(null)
    onCustomRangeChange?.(nextRange)
  }

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12.5px] font-medium text-[#667085] dark:text-[#94A3B8]">
            {eyebrow}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-[#101828] dark:text-[#F8FAFC] mt-0.5">
            {title}
          </h1>
          <p className="text-[13px] text-[#667085] dark:text-[#94A3B8] mt-1">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475467] dark:text-[#94A3B8]"
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
                handleSelectChange(event.target.value as DateRangeKey)
              }
              className="h-9 appearance-none rounded-lg border border-[#D0D5DD] dark:border-[#334155] bg-white dark:bg-[#111827] dark:[color-scheme:dark] pl-9 pr-9 text-[13px] font-medium text-[#344054] dark:text-[#E2E8F0] shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B] focus:border-[#5B4DF0] focus:outline-none focus:ring-2 focus:ring-[#5B4DF0]/15 cursor-pointer"
            >
              {DATE_RANGE_OPTIONS.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#667085] dark:text-[#94A3B8]"
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

          {showComparisonLabel && comparisonLabel && (
            <span className="hidden sm:inline text-[12.5px] font-medium text-[#667085] dark:text-[#94A3B8] whitespace-nowrap">
              {comparisonLabel}
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
                  ? 'border-[#5B4DF0] bg-[#F5F3FF] dark:bg-[#5B4DF0]/20 text-[#4F46E5] dark:text-[#A5B4FC]'
                  : 'border-[#D0D5DD] dark:border-[#334155] bg-white dark:bg-[#111827] text-[#475467] dark:text-[#CBD5E1] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B]'
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

      {dateRange === 'Custom Date Range' && (
        <form
          onSubmit={handleApplyCustomRange}
          className="bg-white dark:bg-[#111827] border border-[#E6E8EF] dark:border-[#1F2937] rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <label className="flex items-center gap-1.5 text-[#475467] dark:text-[#94A3B8] font-medium">
              <span>From</span>
              <input
                type="date"
                aria-label="Custom start date"
                value={draftStart}
                onChange={(event) => {
                  setDraftStart(event.target.value)
                  if (validationError) setValidationError(null)
                }}
                className="h-8 rounded-lg border border-[#D0D5DD] dark:border-[#334155] bg-[#F9FAFB] dark:bg-[#0F172A] dark:[color-scheme:dark] px-2.5 text-xs font-medium text-[#101828] dark:text-[#F1F5F9] focus:border-[#5B4DF0] focus:outline-none focus:ring-2 focus:ring-[#5B4DF0]/15 font-tabular"
              />
            </label>

            <label className="flex items-center gap-1.5 text-[#475467] dark:text-[#94A3B8] font-medium">
              <span>To</span>
              <input
                type="date"
                aria-label="Custom end date"
                value={draftEnd}
                onChange={(event) => {
                  setDraftEnd(event.target.value)
                  if (validationError) setValidationError(null)
                }}
                className="h-8 rounded-lg border border-[#D0D5DD] dark:border-[#334155] bg-[#F9FAFB] dark:bg-[#0F172A] dark:[color-scheme:dark] px-2.5 text-xs font-medium text-[#101828] dark:text-[#F1F5F9] focus:border-[#5B4DF0] focus:outline-none focus:ring-2 focus:ring-[#5B4DF0]/15 font-tabular"
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-8 items-center rounded-lg bg-[#5B4DF0] px-3 text-xs font-medium text-white hover:bg-[#4F46E5] transition-colors cursor-pointer"
            >
              Apply
            </button>
          </div>

          {validationError ? (
            <p
              role="alert"
              className="text-xs font-medium text-[#B42318] dark:text-[#FCA5A5]"
            >
              {validationError}
            </p>
          ) : (
            <p className="text-[11.5px] text-[#667085] dark:text-[#94A3B8]">
              Available historical data: Jan 1 – Jun 18, 2024
            </p>
          )}
        </form>
      )}

      {limitationNote && (
        <p className="text-[11.5px] text-[#667085] dark:text-[#94A3B8] bg-[#F2F4F7]/70 dark:bg-[#161F33] border border-[#EAECF0] dark:border-[#1F2937] rounded-lg px-3 py-1.5">
          {limitationNote}
        </p>
      )}
    </div>
  )
}
