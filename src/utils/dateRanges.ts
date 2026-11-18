import type { CustomDateRange, DateRangeKey } from '../types/analytics'

export const DATE_RANGE_OPTIONS: readonly DateRangeKey[] = [
  'Last 7 Days',
  'Last 30 Days',
  'Last 90 Days',
  'Last 6 Months',
  'Last 12 Months',
  'Custom Date Range',
]

export const DATASET_MIN_DATE = '2024-01-01'
export const DATASET_MAX_DATE = '2024-06-18'

export const DEFAULT_CUSTOM_RANGE: CustomDateRange = {
  startDate: DATASET_MIN_DATE,
  endDate: DATASET_MAX_DATE,
}

export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [yearStr, monthStr, dayStr] = value.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

export function validateCustomDateRange(range: CustomDateRange): string | null {
  if (!isValidIsoDate(range.startDate) || !isValidIsoDate(range.endDate)) {
    return 'Please enter valid start and end dates.'
  }
  if (range.startDate > range.endDate) {
    return 'Start date cannot be later than end date.'
  }
  return null
}
