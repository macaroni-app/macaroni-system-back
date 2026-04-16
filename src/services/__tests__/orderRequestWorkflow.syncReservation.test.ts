import mongoose from 'mongoose'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { INSUFFICIENT_INVENTORY, NOT_FOUND, ORDER_REQUEST_HAS_NO_ITEMS } from '../../labels/labels'
import Inventory from '../../models/inventories'
import OrderRequest, { OrderRequestStatus } from '../../models/orderRequests'
import OrderRequestItem from '../../models/orderRequestItems'
import ProductItem from '../../models/productItems'
import { orderRequestWorkflowService } from '../orderRequestWorkflow'

type ChainValue = Record<string, unknown> | Array<Record<string, unknown>> | null

const buildSession = () => ({
  withTransaction: vi.fn(async (callback: () => Promise<void>) => {
    await callback()
  }),
  endSession: vi.fn()
})

const mockSessionQuery = (value: ChainValue) => ({
  session: vi.fn().mockResolvedValue(value)
})

const buildOrderRequest = (overrides: Record<string, unknown> = {}): Record<string, any> => ({
  id: 'order-request-id',
  _id: 'order-request-id',
  status: OrderRequestStatus.CONFIRMED,
  reservedItems: [
    {
      inventory: 'old-inventory-id',
      asset: 'old-asset-id',
      quantity: 4
    }
  ],
  save: vi.fn().mockResolvedValue(undefined),
  ...overrides
})

const mockOrderRequest = (orderRequest: Record<string, unknown>) => {
  vi.spyOn(OrderRequest, 'findById').mockReturnValue(mockSessionQuery(orderRequest) as never)
}

const mockReservationSources = () => {
  vi.spyOn(OrderRequestItem, 'find').mockReturnValue(mockSessionQuery([
    {
      product: 'product-id',
      quantity: 2
    }
  ]) as never)
  vi.spyOn(ProductItem, 'find').mockReturnValue(mockSessionQuery([
    {
      product: 'product-id',
      asset: 'asset-id',
      quantity: 3
    }
  ]) as never)
  vi.spyOn(Inventory, 'find').mockReturnValue(mockSessionQuery([
    {
      _id: 'inventory-id',
      asset: 'asset-id'
    }
  ]) as never)
}

describe('orderRequestWorkflowService.syncReservation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns a draft order request without touching inventory or saving', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest({
      status: OrderRequestStatus.DRAFT,
      reservedItems: []
    })
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequest(orderRequest)
    const releaseInventory = vi.spyOn(Inventory, 'updateOne')
    const reserveInventory = vi.spyOn(Inventory, 'findOneAndUpdate')

    const result = await orderRequestWorkflowService.syncReservation('order-request-id', 'user-id')

    expect(result).toBe(orderRequest)
    expect(releaseInventory).not.toHaveBeenCalled()
    expect(reserveInventory).not.toHaveBeenCalled()
    expect(orderRequest.save).not.toHaveBeenCalled()
    expect(session.endSession).toHaveBeenCalledOnce()
  })

  it('releases previous reservations and stores the recalculated reservation', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest()
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequest(orderRequest)
    mockReservationSources()
    const releaseInventory = vi.spyOn(Inventory, 'updateOne').mockResolvedValue({ acknowledged: true } as never)
    const reserveInventory = vi.spyOn(Inventory, 'findOneAndUpdate').mockResolvedValue({ id: 'inventory-id' } as never)

    const result = await orderRequestWorkflowService.syncReservation('order-request-id', 'user-id')

    expect(releaseInventory).toHaveBeenCalledWith(
      { _id: 'old-inventory-id' },
      {
        $set: {
          updatedAt: expect.any(Date),
          updatedBy: 'user-id'
        },
        $inc: {
          quantityReserved: -4
        }
      },
      { session }
    )
    expect(reserveInventory).toHaveBeenCalledWith(
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
            6
          ]
        }
      },
      {
        $set: {
          updatedAt: expect.any(Date),
          updatedBy: 'user-id'
        },
        $inc: {
          quantityReserved: 6
        }
      },
      {
        new: true,
        session
      }
    )
    expect(releaseInventory.mock.invocationCallOrder[0]).toBeLessThan(reserveInventory.mock.invocationCallOrder[0])
    expect(orderRequest.reservedItems).toEqual([
      {
        inventory: 'inventory-id',
        asset: 'asset-id',
        quantity: 6
      }
    ])
    expect(orderRequest.updatedBy).toBe('user-id')
    expect(orderRequest.save).toHaveBeenCalledWith({ session })
    expect(session.endSession).toHaveBeenCalledOnce()
    expect(result).toBe(orderRequest)
  })

  it('rejects a confirmed order request without items', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest()
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequest(orderRequest)
    vi.spyOn(Inventory, 'updateOne').mockResolvedValue({ acknowledged: true } as never)
    vi.spyOn(OrderRequestItem, 'find').mockReturnValue(mockSessionQuery([]) as never)

    await expect(orderRequestWorkflowService.syncReservation('order-request-id', 'user-id')).rejects.toThrow(ORDER_REQUEST_HAS_NO_ITEMS)

    expect(orderRequest.save).not.toHaveBeenCalled()
    expect(session.endSession).toHaveBeenCalledOnce()
  })

  it('rejects when a product has no product items', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest()
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequest(orderRequest)
    vi.spyOn(Inventory, 'updateOne').mockResolvedValue({ acknowledged: true } as never)
    vi.spyOn(OrderRequestItem, 'find').mockReturnValue(mockSessionQuery([
      {
        product: 'product-id',
        quantity: 2
      }
    ]) as never)
    vi.spyOn(ProductItem, 'find').mockReturnValue(mockSessionQuery([]) as never)
    vi.spyOn(Inventory, 'find').mockReturnValue(mockSessionQuery([]) as never)

    await expect(orderRequestWorkflowService.syncReservation('order-request-id', 'user-id')).rejects.toThrow(NOT_FOUND)

    expect(orderRequest.save).not.toHaveBeenCalled()
    expect(session.endSession).toHaveBeenCalledOnce()
  })

  it('rejects when an asset has no inventory', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest()
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequest(orderRequest)
    vi.spyOn(Inventory, 'updateOne').mockResolvedValue({ acknowledged: true } as never)
    vi.spyOn(OrderRequestItem, 'find').mockReturnValue(mockSessionQuery([
      {
        product: 'product-id',
        quantity: 2
      }
    ]) as never)
    vi.spyOn(ProductItem, 'find').mockReturnValue(mockSessionQuery([
      {
        product: 'product-id',
        asset: 'asset-id',
        quantity: 3
      }
    ]) as never)
    vi.spyOn(Inventory, 'find').mockReturnValue(mockSessionQuery([]) as never)

    await expect(orderRequestWorkflowService.syncReservation('order-request-id', 'user-id')).rejects.toThrow(NOT_FOUND)

    expect(orderRequest.save).not.toHaveBeenCalled()
    expect(session.endSession).toHaveBeenCalledOnce()
  })

  it('rejects when sellable stock is not enough for the recalculated reservation', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest()
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequest(orderRequest)
    mockReservationSources()
    vi.spyOn(Inventory, 'updateOne').mockResolvedValue({ acknowledged: true } as never)
    vi.spyOn(Inventory, 'findOneAndUpdate').mockResolvedValue(null as never)

    await expect(orderRequestWorkflowService.syncReservation('order-request-id', 'user-id')).rejects.toThrow(INSUFFICIENT_INVENTORY)

    expect(orderRequest.save).not.toHaveBeenCalled()
    expect(session.endSession).toHaveBeenCalledOnce()
  })
})
