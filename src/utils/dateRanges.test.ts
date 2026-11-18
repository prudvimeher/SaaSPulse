import { describe, expect, it } from 'vitest'
import { isValidIsoDate, validateCustomDateRange } from './dateRanges'

describe('isValidIsoDate', () => {
  it('accepts valid ISO calendar dates including leap day 2024-02-29', () => {
    expect(isValidIsoDate('2024-01-01')).toBe(true)
    expect(isValidIsoDate('2024-02-29')).toBe(true)
    expect(isValidIsoDate('2024-06-18')).toBe(true)
  })

  it('rejects impossible calendar dates and non-ISO formats', () => {
    expect(isValidIsoDate('2024-02-30')).toBe(false)
    expect(isValidIsoDate('2023-02-29')).toBe(false)
    expect(isValidIsoDate('2024-13-01')).toBe(false)
    expect(isValidIsoDate('06/18/2024')).toBe(false)
    expect(isValidIsoDate('')).toBe(false)
  })
})

describe('validateCustomDateRange', () => {
  it('returns null for valid single-day and multi-day ranges', () => {
    expect(
      validateCustomDateRange({
        startDate: '2024-06-18',
        endDate: '2024-06-18',
      }),
    ).toBeNull()
    expect(
      validateCustomDateRange({
        startDate: '2024-01-01',
        endDate: '2024-06-18',
      }),
    ).toBeNull()
  })

  it('returns an error when start or end date is invalid', () => {
    expect(
      validateCustomDateRange({
        startDate: '',
        endDate: '2024-06-18',
      }),
    ).toBe('Please enter valid start and end dates.')
    expect(
      validateCustomDateRange({
        startDate: '2024-02-30',
        endDate: '2024-06-18',
      }),
    ).toBe('Please enter valid start and end dates.')
  })

  it('returns an error when startDate is later than endDate', () => {
    expect(
      validateCustomDateRange({
        startDate: '2024-06-18',
        endDate: '2024-05-01',
      }),
    ).toBe('Start date cannot be later than end date.')
  })
})
