import { afterEach, describe, expect, it, vi } from 'vitest'

import Counter from '../../models/counters'
import OrderRequest from '../../models/orderRequests'
import { orderRequestCodeService } from '../orderRequestCode'

describe('orderRequestCodeService.getNextOrderCode', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each([
    { sequence: 1, expectedCode: '001' },
    { sequence: 12, expectedCode: '012' },
    { sequence: 123, expectedCode: '123' }
  ])('returns a padded order code for sequence $sequence', async ({ sequence, expectedCode }) => {
    const findOneAndUpdate = vi
      .spyOn(Counter, 'findOneAndUpdate')
      .mockResolvedValue({ sequence } as never)
    const orderRequestFind = vi.spyOn(OrderRequest, 'find')

    const code = await orderRequestCodeService.getNextOrderCode()

    expect(code).toBe(expectedCode)
    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { key: 'orderRequest' },
      {
        $inc: { sequence: 1 },
        $setOnInsert: { key: 'orderRequest' }
      },
      {
        upsert: true,
        new: true
      }
    )
    expect(orderRequestFind).not.toHaveBeenCalled()
  })
})
