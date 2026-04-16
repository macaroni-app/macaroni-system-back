import { afterEach, describe, expect, it, vi } from 'vitest'

import { INVALID_ORDER_REQUEST_STATUS, MISSING_FIELDS_REQUIRED, NOT_FOUND, ORDER_REQUEST_ALREADY_CONVERTED, ORDER_REQUEST_HAS_NO_ITEMS } from '../../labels/labels'
import OrderRequest, { OrderRequestStatus } from '../../models/orderRequests'
import OrderRequestItem from '../../models/orderRequestItems'
import orderRequestItemsController from '../orderRequestItems'
import { orderRequestItemsService } from '../../services/orderRequestItems'
import { orderRequestWorkflowService } from '../../services/orderRequestWorkflow'

const buildResponse = () => {
  const response = {
    status: vi.fn(),
    json: vi.fn()
  }
  response.status.mockReturnValue(response)
  response.json.mockReturnValue(response)
  return response
}

const buildRequest = (overrides: Record<string, unknown> = {}): Record<string, any> => ({
  body: {},
  params: {},
  query: {},
  user: {
    id: 'user-id'
  },
  ...overrides
})

describe('orderRequestItemsController', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('stores an item for a draft order request without syncing reservations', async () => {
    const req = buildRequest({
      body: {
        orderRequest: 'order-request-id',
        product: 'product-id',
        quantity: 2,
        unitPrice: 100,
        subtotal: 200
      }
    })
    const res = buildResponse()
    vi.spyOn(orderRequestItemsService, 'store').mockResolvedValue({ id: 'item-id' } as never)
    vi.spyOn(OrderRequest, 'findById').mockResolvedValue({ status: OrderRequestStatus.DRAFT } as never)
    const syncReservation = vi.spyOn(orderRequestWorkflowService, 'syncReservation')

    await orderRequestItemsController.store(req as never, res as never)

    expect(orderRequestItemsService.store).toHaveBeenCalledWith({
      orderRequest: 'order-request-id',
      product: 'product-id',
      quantity: 2,
      unitPrice: 100,
      subtotal: 200,
      createdBy: 'user-id',
      updatedBy: 'user-id'
    })
    expect(syncReservation).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({
      status: 201,
      isStored: true,
      data: { id: 'item-id' }
    })
  })

  it('stores an item for a confirmed order request and syncs reservations', async () => {
    const req = buildRequest({
      body: {
        orderRequest: 'order-request-id',
        product: 'product-id',
        quantity: 2,
        unitPrice: 100,
        subtotal: 200
      }
    })
    const res = buildResponse()
    vi.spyOn(orderRequestItemsService, 'store').mockResolvedValue({ id: 'item-id' } as never)
    vi.spyOn(OrderRequest, 'findById').mockResolvedValue({ status: OrderRequestStatus.CONFIRMED } as never)
    const syncReservation = vi.spyOn(orderRequestWorkflowService, 'syncReservation').mockResolvedValue({ id: 'order-request-id' } as never)

    await orderRequestItemsController.store(req as never, res as never)

    expect(syncReservation).toHaveBeenCalledWith('order-request-id', 'user-id')
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('updates an item for a confirmed order request and syncs reservations', async () => {
    const req = buildRequest({
      params: {
        id: 'item-id'
      },
      body: {
        orderRequest: 'order-request-id',
        product: 'product-id',
        quantity: 3,
        unitPrice: 100,
        subtotal: 300
      }
    })
    const res = buildResponse()
    vi.spyOn(orderRequestItemsService, 'getOne').mockResolvedValue({
      _doc: {
        id: 'item-id',
        orderRequest: 'order-request-id'
      }
    } as never)
    vi.spyOn(orderRequestItemsService, 'update').mockResolvedValue({ acknowledged: true } as never)
    vi.spyOn(OrderRequest, 'findById').mockResolvedValue({ status: OrderRequestStatus.CONFIRMED } as never)
    const syncReservation = vi.spyOn(orderRequestWorkflowService, 'syncReservation').mockResolvedValue({ id: 'order-request-id' } as never)

    await orderRequestItemsController.update(req as never, res as never)

    expect(orderRequestItemsService.update).toHaveBeenCalledWith('item-id', expect.objectContaining({
      product: 'product-id',
      quantity: 3,
      subtotal: 300,
      updatedBy: 'user-id'
    }))
    expect(syncReservation).toHaveBeenCalledWith('order-request-id', 'user-id')
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('deletes an item for a confirmed order request with more than one item and syncs reservations', async () => {
    const req = buildRequest({
      params: {
        id: 'item-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(OrderRequestItem, 'findById').mockResolvedValue({ orderRequest: 'order-request-id' } as never)
    vi.spyOn(OrderRequest, 'findById').mockResolvedValue({ id: 'order-request-id', status: OrderRequestStatus.CONFIRMED } as never)
    vi.spyOn(OrderRequestItem, 'countDocuments').mockResolvedValue(2)
    vi.spyOn(orderRequestItemsService, 'delete').mockResolvedValue({ deletedCount: 1 } as never)
    const syncReservation = vi.spyOn(orderRequestWorkflowService, 'syncReservation').mockResolvedValue({ id: 'order-request-id' } as never)

    await orderRequestItemsController.delete(req as never, res as never)

    expect(orderRequestItemsService.delete).toHaveBeenCalledWith('item-id')
    expect(syncReservation).toHaveBeenCalledWith('order-request-id', 'user-id')
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('blocks deleting the last item from a confirmed order request', async () => {
    const req = buildRequest({
      params: {
        id: 'item-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(OrderRequestItem, 'findById').mockResolvedValue({ orderRequest: 'order-request-id' } as never)
    vi.spyOn(OrderRequest, 'findById').mockResolvedValue({ id: 'order-request-id', status: OrderRequestStatus.CONFIRMED } as never)
    vi.spyOn(OrderRequestItem, 'countDocuments').mockResolvedValue(1)
    const deleteItem = vi.spyOn(orderRequestItemsService, 'delete')

    await orderRequestItemsController.delete(req as never, res as never)

    expect(deleteItem).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({
      status: 409,
      isDeleted: false,
      message: ORDER_REQUEST_HAS_NO_ITEMS
    })
  })

  it('returns conflict when storing an item for a cancelled order request', async () => {
    const req = buildRequest({
      body: {
        orderRequest: 'order-request-id',
        product: 'product-id',
        quantity: 2,
        unitPrice: 100,
        subtotal: 200
      }
    })
    const res = buildResponse()
    vi.spyOn(orderRequestItemsService, 'store').mockResolvedValue({ id: 'item-id' } as never)
    vi.spyOn(OrderRequest, 'findById').mockResolvedValue({ status: OrderRequestStatus.CANCELLED } as never)

    await orderRequestItemsController.store(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({
      status: 409,
      isStored: false,
      message: INVALID_ORDER_REQUEST_STATUS
    })
  })

  it('returns conflict when storing an item for a converted order request', async () => {
    const req = buildRequest({
      body: {
        orderRequest: 'order-request-id',
        product: 'product-id',
        quantity: 2,
        unitPrice: 100,
        subtotal: 200
      }
    })
    const res = buildResponse()
    vi.spyOn(orderRequestItemsService, 'store').mockResolvedValue({ id: 'item-id' } as never)
    vi.spyOn(OrderRequest, 'findById').mockResolvedValue({ status: OrderRequestStatus.CONVERTED } as never)

    await orderRequestItemsController.store(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({
      status: 409,
      isStored: false,
      message: ORDER_REQUEST_ALREADY_CONVERTED
    })
  })

  it('returns missing fields when storing an incomplete item', async () => {
    const req = buildRequest({
      body: {
        orderRequest: 'order-request-id'
      }
    })
    const res = buildResponse()

    await orderRequestItemsController.store(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      isStored: false,
      message: MISSING_FIELDS_REQUIRED
    })
  })

  it('returns not found when updating a missing item', async () => {
    const req = buildRequest({
      params: {
        id: 'item-id'
      },
      body: {
        orderRequest: 'order-request-id',
        product: 'product-id',
        quantity: 3,
        unitPrice: 100,
        subtotal: 300
      }
    })
    const res = buildResponse()
    vi.spyOn(orderRequestItemsService, 'getOne').mockResolvedValue(null as never)

    await orderRequestItemsController.update(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      isUpdated: false,
      message: NOT_FOUND
    })
  })
})
