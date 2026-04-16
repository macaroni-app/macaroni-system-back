import mongoose from 'mongoose'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { INSUFFICIENT_INVENTORY, NOT_FOUND } from '../../labels/labels'
import Inventory from '../../models/inventories'
import { inventoryService } from '../inventories'

const buildSession = () => ({
  withTransaction: vi.fn(async (callback: () => Promise<void>) => {
    await callback()
  }),
  endSession: vi.fn()
})

const mockFindById = (handler: (id: string) => unknown) => {
  vi.spyOn(Inventory, 'findById').mockImplementation(((id: string) => ({
    session: vi.fn().mockResolvedValue(handler(id))
  })) as never)
}

describe('inventoryService.updateAtomic', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('increments stock without sellable stock validation when quantity delta is positive', async () => {
    const updatedInventory = { id: 'inventory-id', quantityAvailable: 15 }
    const findOneAndUpdate = vi
      .spyOn(Inventory, 'findOneAndUpdate')
      .mockResolvedValue(updatedInventory as never)

    const result = await inventoryService.updateAtomic('inventory-id', {
      asset: 'asset-id',
      quantityDelta: 5,
      updatedBy: 'user-id'
    })

    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'inventory-id' },
      {
        $set: {
          updatedAt: expect.any(Date),
          updatedBy: 'user-id',
          asset: 'asset-id'
        },
        $inc: { quantityAvailable: 5 }
      },
      { new: true }
    )
    expect(result).toBe(updatedInventory)
  })

  it('validates sellable stock when quantity delta is negative', async () => {
    const updatedInventory = { id: 'inventory-id', quantityAvailable: 7 }
    const findOneAndUpdate = vi
      .spyOn(Inventory, 'findOneAndUpdate')
      .mockResolvedValue(updatedInventory as never)

    const result = await inventoryService.updateAtomic('inventory-id', {
      quantityDelta: -3,
      updatedBy: 'user-id'
    })

    expect(findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: 'inventory-id',
        $expr: {
          $gte: [
            {
              $subtract: [
                '$quantityAvailable',
                { $ifNull: ['$quantityReserved', 0] }
              ]
            },
            3
          ]
        }
      },
      {
        $set: {
          updatedAt: expect.any(Date),
          updatedBy: 'user-id'
        },
        $inc: { quantityAvailable: -3 }
      },
      { new: true }
    )
    expect(result).toBe(updatedInventory)
  })

  it('returns model errors without throwing', async () => {
    const error = new Error('database error')
    vi.spyOn(Inventory, 'findOneAndUpdate').mockRejectedValue(error)

    const result = await inventoryService.updateAtomic('inventory-id', {
      quantityDelta: 5
    })

    expect(result).toBe(error)
  })
})

describe('inventoryService.updateManyAtomic', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('updates multiple inventories atomically', async () => {
    const session = buildSession()
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockFindById((id) => ({ id }))
    vi.spyOn(Inventory, 'findOneAndUpdate').mockImplementation((async (filter: { _id: string }) => ({
      id: filter._id,
      quantityAvailable: 10
    })) as never)

    const result = await inventoryService.updateManyAtomic([
      {
        id: 'inventory-one',
        quantityDelta: -2,
        updatedBy: 'user-id'
      },
      {
        id: 'inventory-two',
        asset: 'asset-two',
        quantityDelta: 5,
        updatedBy: 'user-id'
      }
    ])

    expect(result).toEqual({
      updated: [
        {
          id: 'inventory-one',
          asset: undefined,
          oldQuantityAvailable: 10,
          currentQuantityAvailable: 8,
          quantityAvailable: 8
        },
        {
          id: 'inventory-two',
          asset: 'asset-two',
          oldQuantityAvailable: 10,
          currentQuantityAvailable: 15,
          quantityAvailable: 15
        }
      ],
      failed: []
    })
    expect(session.endSession).toHaveBeenCalledOnce()
  })

  it('returns not found failure when an inventory does not exist', async () => {
    const session = buildSession()
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockFindById(() => null)
    const findOneAndUpdate = vi.spyOn(Inventory, 'findOneAndUpdate')

    const result = await inventoryService.updateManyAtomic([
      {
        id: 'missing-inventory',
        quantityDelta: -2
      }
    ])

    expect(result).toEqual({
      updated: [],
      failed: [
        {
          id: 'missing-inventory',
          message: NOT_FOUND
        }
      ]
    })
    expect(findOneAndUpdate).not.toHaveBeenCalled()
    expect(session.endSession).toHaveBeenCalledOnce()
  })

  it('returns insufficient inventory failure when sellable stock is not enough', async () => {
    const session = buildSession()
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockFindById((id) => ({ id }))
    vi.spyOn(Inventory, 'findOneAndUpdate').mockResolvedValue(null as never)

    const result = await inventoryService.updateManyAtomic([
      {
        id: 'inventory-id',
        quantityDelta: -20
      }
    ])

    expect(result).toEqual({
      updated: [],
      failed: [
        {
          id: 'inventory-id',
          message: INSUFFICIENT_INVENTORY
        }
      ]
    })
    expect(session.endSession).toHaveBeenCalledOnce()
  })

  it('does not return partial updates when one operation fails', async () => {
    const session = buildSession()
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockFindById((id) => ({ id }))
    vi.spyOn(Inventory, 'findOneAndUpdate')
      .mockResolvedValueOnce({
        id: 'inventory-one',
        quantityAvailable: 10
      } as never)
      .mockResolvedValueOnce(null as never)

    const result = await inventoryService.updateManyAtomic([
      {
        id: 'inventory-one',
        quantityDelta: -2
      },
      {
        id: 'inventory-two',
        quantityDelta: -20
      }
    ])

    expect(result).toEqual({
      updated: [],
      failed: [
        {
          id: 'inventory-two',
          message: INSUFFICIENT_INVENTORY
        }
      ]
    })
    expect(session.endSession).toHaveBeenCalledOnce()
  })
})
