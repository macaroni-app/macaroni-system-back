import mongoose from 'mongoose'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { INSUFFICIENT_INVENTORY, INVALID_ORDER_REQUEST_STATUS, ORDER_REQUEST_ALREADY_CONVERTED, ORDER_REQUEST_HAS_NO_ITEMS } from '../../labels/labels'
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
  status: OrderRequestStatus.DRAFT,
  reservedItems: [],
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

describe('orderRequestWorkflowService.confirm', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('confirms a draft order request and reserves the calculated inventory', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest()
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequest(orderRequest)
    mockReservationSources()
    const reserveInventory = vi.spyOn(Inventory, 'findOneAndUpdate').mockResolvedValue({ id: 'inventory-id' } as never)

    const result = await orderRequestWorkflowService.confirm('order-request-id', 'user-id')

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
    expect(orderRequest.status).toBe(OrderRequestStatus.CONFIRMED)
    expect(orderRequest.reservedItems).toEqual([
      {
        inventory: 'inventory-id',
        asset: 'asset-id',
        quantity: 6
      }
    ])
    expect(orderRequest.confirmedAt).toEqual(expect.any(Date))
    expect(orderRequest.updatedBy).toBe('user-id')
    expect(orderRequest.save).toHaveBeenCalledWith({ session })
    expect(session.endSession).toHaveBeenCalledOnce()
    expect(result).toBe(orderRequest)
  })

  it('releases previous reservations before reserving the current calculated inventory', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest({
      reservedItems: [
        {
          inventory: 'old-inventory-id',
          asset: 'old-asset-id',
          quantity: 4
        }
      ]
    })
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequest(orderRequest)
    mockReservationSources()
    const releaseInventory = vi.spyOn(Inventory, 'updateOne').mockResolvedValue({ acknowledged: true } as never)
    const reserveInventory = vi.spyOn(Inventory, 'findOneAndUpdate').mockResolvedValue({ id: 'inventory-id' } as never)

    await orderRequestWorkflowService.confirm('order-request-id', 'user-id')

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
    expect(releaseInventory.mock.invocationCallOrder[0]).toBeLessThan(reserveInventory.mock.invocationCallOrder[0])
    expect(session.endSession).toHaveBeenCalledOnce()
  })

  it('rejects a cancelled order request', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest({
      status: OrderRequestStatus.CANCELLED
    })
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequest(orderRequest)

    await expect(orderRequestWorkflowService.confirm('order-request-id', 'user-id')).rejects.toThrow(INVALID_ORDER_REQUEST_STATUS)

    expect(orderRequest.save).not.toHaveBeenCalled()
    expect(session.endSession).toHaveBeenCalledOnce()
  })

  it('rejects a converted order request', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest({
      status: OrderRequestStatus.CONVERTED
    })
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequest(orderRequest)

    await expect(orderRequestWorkflowService.confirm('order-request-id', 'user-id')).rejects.toThrow(ORDER_REQUEST_ALREADY_CONVERTED)

    expect(orderRequest.save).not.toHaveBeenCalled()
    expect(session.endSession).toHaveBeenCalledOnce()
  })

  it('rejects an order request without items', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest()
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequest(orderRequest)
    vi.spyOn(OrderRequestItem, 'find').mockReturnValue(mockSessionQuery([]) as never)

    await expect(orderRequestWorkflowService.confirm('order-request-id', 'user-id')).rejects.toThrow(ORDER_REQUEST_HAS_NO_ITEMS)

    expect(orderRequest.save).not.toHaveBeenCalled()
    expect(session.endSession).toHaveBeenCalledOnce()
  })

  it('rejects when sellable stock is not enough', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest()
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequest(orderRequest)
    mockReservationSources()
    vi.spyOn(Inventory, 'findOneAndUpdate').mockResolvedValue(null as never)

    await expect(orderRequestWorkflowService.confirm('order-request-id', 'user-id')).rejects.toThrow(INSUFFICIENT_INVENTORY)

    expect(orderRequest.save).not.toHaveBeenCalled()
    expect(session.endSession).toHaveBeenCalledOnce()
  })
})

describe('orderRequestWorkflowService.cancel', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('cancels a draft order request without releasing inventory', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest()
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequest(orderRequest)
    const releaseInventory = vi.spyOn(Inventory, 'updateOne')

    const result = await orderRequestWorkflowService.cancel('order-request-id', 'user-id')

    expect(releaseInventory).not.toHaveBeenCalled()
    expect(orderRequest.status).toBe(OrderRequestStatus.CANCELLED)
    expect(orderRequest.reservedItems).toEqual([])
    expect(orderRequest.cancelledAt).toEqual(expect.any(Date))
    expect(orderRequest.updatedBy).toBe('user-id')
    expect(orderRequest.save).toHaveBeenCalledWith({ session })
    expect(session.endSession).toHaveBeenCalledOnce()
    expect(result).toBe(orderRequest)
  })

  it('cancels a confirmed order request and releases reserved inventory', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest({
      status: OrderRequestStatus.CONFIRMED,
      reservedItems: [
        {
          inventory: 'inventory-id',
          asset: 'asset-id',
          quantity: 5
        }
      ]
    })
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequest(orderRequest)
    const releaseInventory = vi.spyOn(Inventory, 'updateOne').mockResolvedValue({ acknowledged: true } as never)

    await orderRequestWorkflowService.cancel('order-request-id', 'user-id')

    expect(releaseInventory).toHaveBeenCalledWith(
      { _id: 'inventory-id' },
      {
        $set: {
          updatedAt: expect.any(Date),
          updatedBy: 'user-id'
        },
        $inc: {
          quantityReserved: -5
        }
      },
      { session }
    )
    expect(orderRequest.status).toBe(OrderRequestStatus.CANCELLED)
    expect(orderRequest.reservedItems).toEqual([])
    expect(orderRequest.save).toHaveBeenCalledWith({ session })
    expect(session.endSession).toHaveBeenCalledOnce()
  })

  it('rejects a converted order request', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest({
      status: OrderRequestStatus.CONVERTED
    })
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequest(orderRequest)

    await expect(orderRequestWorkflowService.cancel('order-request-id', 'user-id')).rejects.toThrow(ORDER_REQUEST_ALREADY_CONVERTED)

    expect(orderRequest.save).not.toHaveBeenCalled()
    expect(session.endSession).toHaveBeenCalledOnce()
  })
})
