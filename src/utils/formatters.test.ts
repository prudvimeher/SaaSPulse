import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate } from './formatters'

describe('formatCurrency', () => {
  it('formats whole dollar amounts without decimals by default', () => {
    expect(formatCurrency(0)).toBe('$0')
    expect(formatCurrency(249)).toBe('$249')
    expect(formatCurrency(17988)).toBe('$17,988')
  })

  it('formats decimal currency amounts when showDecimals is true', () => {
    expect(formatCurrency(249, true)).toBe('$249.00')
    expect(formatCurrency(1234.5, true)).toBe('$1,234.50')
  })
})

describe('formatDate', () => {
  it('formats ISO dates in UTC without local timezone drift', () => {
    expect(formatDate('2024-01-01')).toBe('Jan 1, 2024')
    expect(formatDate('2024-06-18')).toBe('Jun 18, 2024')
    expect(formatDate('2024-12-31')).toBe('Dec 31, 2024')
  })
})
