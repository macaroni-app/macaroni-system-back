import { afterEach, describe, expect, it, vi } from 'vitest'

import { calculateDates } from '../utils'

describe('calculateDates', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the first day of the start month for the requested history length', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 14, 12, 0, 0, 0))

    const result = calculateDates(12)

    expect(result.startDate).toEqual(new Date(2025, 4, 1, 0, 0, 0, 0))
  })

  it('returns the last day of the current month as end date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 14, 12, 0, 0, 0))

    const result = calculateDates(12)

    expect(result.endDate).toEqual(new Date(2026, 4, 0, 12, 0, 0, 0))
  })

  it('normalizes the start date time to midnight', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 14, 18, 45, 30, 0))

    const result = calculateDates(3)

    expect(result.startDate.getHours()).toBe(0)
    expect(result.startDate.getMinutes()).toBe(0)
    expect(result.startDate.getSeconds()).toBe(0)
    expect(result.startDate.getMilliseconds()).toBe(0)
  })
})
