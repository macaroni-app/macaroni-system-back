import { afterEach, describe, expect, it, vi } from 'vitest'

import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../../labels/labels'
import { saleItemsService } from '../../services/saleItems'
import saleItemsController from '../saleItems'

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

describe('saleItemsController', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('gets sale items using date filters by default', async () => {
    const req = buildRequest({
      query: {
        startDate: '2026-02-10',
        endDate: '2026-02-20'
      }
    })
    const res = buildResponse()
    vi.spyOn(saleItemsService, 'getAll').mockResolvedValue([] as never)

    await saleItemsController.getAll(req as never, res as never)

    expect(saleItemsService.getAll).toHaveBeenCalledWith({
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

  it('gets all sale items with empty filter when all=true', async () => {
    const req = buildRequest({
      query: {
        all: 'true'
      }
    })
    const res = buildResponse()
    vi.spyOn(saleItemsService, 'getAll').mockResolvedValue([] as never)

    await saleItemsController.getAll(req as never, res as never)

    expect(saleItemsService.getAll).toHaveBeenCalledWith({})
  })

  it('gets sale items by sale id when id is provided', async () => {
    const req = buildRequest({
      query: {
        id: 'sale-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(saleItemsService, 'getAll').mockResolvedValue([] as never)

    await saleItemsController.getAll(req as never, res as never)

    expect(saleItemsService.getAll).toHaveBeenCalledWith({
      $expr: {
        $and: [{ $eq: ['$sale', 'sale-id'] }]
      }
    })
  })

  it('rejects storing sale item with missing fields', async () => {
    const req = buildRequest({
      body: {
        sale: 'sale-id'
      }
    })
    const res = buildResponse()

    await saleItemsController.store(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      isStored: false,
      message: MISSING_FIELDS_REQUIRED
    })
  })

  it('stores sale item with audit fields', async () => {
    const req = buildRequest({
      body: {
        sale: 'sale-id',
        product: 'product-id',
        quantity: 2,
        subtotal: 100
      }
    })
    const res = buildResponse()
    vi.spyOn(saleItemsService, 'store').mockResolvedValue({ id: 'sale-item-id' } as never)

    await saleItemsController.store(req as never, res as never)

    expect(saleItemsService.store).toHaveBeenCalledWith({
      sale: 'sale-id',
      product: 'product-id',
      quantity: 2,
      subtotal: 100,
      createdBy: 'user-id',
      updatedBy: 'user-id'
    })
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('rejects updating sale item with missing fields', async () => {
    const req = buildRequest({
      params: {
        id: 'sale-item-id'
      },
      body: {
        sale: 'sale-id'
      }
    })
    const res = buildResponse()

    await saleItemsController.update(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns not found when updating a missing sale item', async () => {
    const req = buildRequest({
      params: {
        id: 'sale-item-id'
      },
      body: {
        sale: 'sale-id',
        product: 'product-id',
        quantity: 2
      }
    })
    const res = buildResponse()
    vi.spyOn(saleItemsService, 'getOne').mockResolvedValue(null as never)

    await saleItemsController.update(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      isUpdated: false,
      message: NOT_FOUND
    })
  })

  it('updates sale item by merging existing data with body', async () => {
    const req = buildRequest({
      params: {
        id: 'sale-item-id'
      },
      body: {
        sale: 'sale-id',
        product: 'new-product-id',
        quantity: 3
      }
    })
    const res = buildResponse()
    vi.spyOn(saleItemsService, 'getOne').mockResolvedValue({
      _doc: {
        sale: 'sale-id',
        product: 'old-product-id',
        quantity: 1,
        subtotal: 50
      }
    } as never)
    vi.spyOn(saleItemsService, 'update').mockResolvedValue({ acknowledged: true } as never)

    await saleItemsController.update(req as never, res as never)

    expect(saleItemsService.update).toHaveBeenCalledWith('sale-item-id', {
      sale: 'sale-id',
      product: 'new-product-id',
      quantity: 3,
      subtotal: 50
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('rejects bulk store with empty list', async () => {
    const req = buildRequest({
      body: {
        saleItems: []
      }
    })
    const res = buildResponse()

    await saleItemsController.storeMany(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('stores many sale items with audit fields', async () => {
    const req = buildRequest({
      body: {
        saleItems: [
          {
            sale: 'sale-id',
            product: 'product-id',
            quantity: 2
          }
        ]
      }
    })
    const res = buildResponse()
    vi.spyOn(saleItemsService, 'storeMany').mockResolvedValue([{ id: 'sale-item-id' }] as never)

    await saleItemsController.storeMany(req as never, res as never)

    expect(saleItemsService.storeMany).toHaveBeenCalledWith([
      {
        sale: 'sale-id',
        product: 'product-id',
        quantity: 2,
        createdBy: 'user-id',
        updatedBy: 'user-id'
      }
    ])
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('rejects bulk delete with empty list', async () => {
    const req = buildRequest({
      body: {
        saleItems: []
      }
    })
    const res = buildResponse()

    await saleItemsController.deleteMany(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('bulk deletes valid sale item ids', async () => {
    const req = buildRequest({
      body: {
        saleItems: [
          { id: 'sale-item-one' },
          { product: 'product-without-id' },
          { id: 'sale-item-two' }
        ]
      }
    })
    const res = buildResponse()
    vi.spyOn(saleItemsService, 'deleteMany').mockResolvedValue({ deletedCount: 2 } as never)

    await saleItemsController.deleteMany(req as never, res as never)

    expect(saleItemsService.deleteMany).toHaveBeenCalledWith(['sale-item-one', 'sale-item-two'])
    expect(res.status).toHaveBeenCalledWith(200)
  })
})
