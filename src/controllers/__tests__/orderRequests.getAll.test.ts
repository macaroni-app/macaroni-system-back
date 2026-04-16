import { afterEach, describe, expect, it, vi } from 'vitest'

import { OrderRequestStatus } from '../../models/orderRequests'
import orderRequestsController from '../orderRequests'
import { clientService } from '../../services/clients'
import { orderRequestItemsService } from '../../services/orderRequestItems'
import { orderRequestServices } from '../../services/orderRequests'

const buildResponse = () => {
  const response = {
    status: vi.fn(),
    json: vi.fn()
  }
  response.status.mockReturnValue(response)
  response.json.mockReturnValue(response)
  return response
}

const buildRequest = (query: Record<string, unknown> = {}): Record<string, any> => ({
  query,
  params: {},
  body: {}
})

const buildOrderRequest = (id: string, orderCode = '001') => ({
  _id: id,
  _doc: {
    _id: id,
    orderCode,
    status: OrderRequestStatus.DRAFT
  }
})

describe('orderRequestsController.getAll', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('prioritizes order code over date and client name filters', async () => {
    const req = buildRequest({
      orderCode: '001',
      clientName: 'Ana',
      startDate: '2026-01-01',
      endDate: '2026-01-31'
    })
    const res = buildResponse()
    vi.spyOn(orderRequestServices, 'getAll').mockResolvedValue([buildOrderRequest('order-request-id')] as never)
    vi.spyOn(orderRequestItemsService, 'getAll').mockResolvedValue([] as never)
    const clientSearch = vi.spyOn(clientService, 'getAll')

    await orderRequestsController.getAll(req as never, res as never)

    expect(clientSearch).not.toHaveBeenCalled()
    expect(orderRequestServices.getAll).toHaveBeenCalledWith({ orderCode: '001' })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      total: 1,
      data: [
        {
          _id: 'order-request-id',
          orderCode: '001',
          status: OrderRequestStatus.DRAFT,
          items: []
        }
      ]
    })
  })

  it('searches by client name and limits results to draft and confirmed order requests', async () => {
    const req = buildRequest({
      clientName: 'ana'
    })
    const res = buildResponse()
    vi.spyOn(clientService, 'getAll').mockResolvedValue([{ _id: 'client-id' }] as never)
    vi.spyOn(orderRequestServices, 'getAll').mockResolvedValue([buildOrderRequest('order-request-id')] as never)
    vi.spyOn(orderRequestItemsService, 'getAll').mockResolvedValue([] as never)

    await orderRequestsController.getAll(req as never, res as never)

    expect(clientService.getAll).toHaveBeenCalledWith({
      name: {
        $regex: 'ana',
        $options: 'i'
      }
    })
    expect(orderRequestServices.getAll).toHaveBeenCalledWith({
      client: {
        $in: ['client-id']
      },
      status: {
        $in: [OrderRequestStatus.DRAFT, OrderRequestStatus.CONFIRMED]
      },
      isDeleted: false
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('returns an empty successful response when client name has no matches', async () => {
    const req = buildRequest({
      clientName: 'cliente inexistente'
    })
    const res = buildResponse()
    vi.spyOn(clientService, 'getAll').mockResolvedValue([] as never)
    const orderRequestSearch = vi.spyOn(orderRequestServices, 'getAll')
    const itemSearch = vi.spyOn(orderRequestItemsService, 'getAll')

    await orderRequestsController.getAll(req as never, res as never)

    expect(orderRequestSearch).not.toHaveBeenCalled()
    expect(itemSearch).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      total: 0,
      data: []
    })
  })

  it('uses date filters when no order code or client name is provided', async () => {
    const req = buildRequest({
      startDate: '2026-02-10',
      endDate: '2026-02-20'
    })
    const res = buildResponse()
    vi.spyOn(orderRequestServices, 'getAll').mockResolvedValue([] as never)
    vi.spyOn(orderRequestItemsService, 'getAll').mockResolvedValue([] as never)

    await orderRequestsController.getAll(req as never, res as never)

    expect(orderRequestServices.getAll).toHaveBeenCalledWith({
      $expr: {
        $and: [
          { $eq: ['$isDeleted', false] },
          { $gte: ['$createdAt', new Date('2026-02-10')] },
          { $lte: ['$createdAt', new Date('2026-02-21')] }
        ]
      }
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('uses active order request filters without date limits when activeOnly=true', async () => {
    const req = buildRequest({
      activeOnly: 'true'
    })
    const res = buildResponse()
    vi.spyOn(orderRequestServices, 'getAll').mockResolvedValue([] as never)
    vi.spyOn(orderRequestItemsService, 'getAll').mockResolvedValue([] as never)

    await orderRequestsController.getAll(req as never, res as never)

    expect(orderRequestServices.getAll).toHaveBeenCalledWith({
      status: {
        $in: [OrderRequestStatus.DRAFT, OrderRequestStatus.CONFIRMED]
      },
      isDeleted: false
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('uses an empty filter when all=true and there are no specific filters', async () => {
    const req = buildRequest({
      all: 'true'
    })
    const res = buildResponse()
    vi.spyOn(orderRequestServices, 'getAll').mockResolvedValue([] as never)
    vi.spyOn(orderRequestItemsService, 'getAll').mockResolvedValue([] as never)

    await orderRequestsController.getAll(req as never, res as never)

    expect(orderRequestServices.getAll).toHaveBeenCalledWith({})
    expect(res.status).toHaveBeenCalledWith(200)
  })
})
