import { afterEach, describe, expect, it, vi } from 'vitest'

import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../../labels/labels'
import { salesService } from '../../services/sales'
import salesController from '../sales'

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

const validSaleBody = {
  isRetail: true,
  paymentMethod: 'payment-method-id',
  client: 'client-id',
  business: 'business-id',
  costTotal: 100,
  total: 250
}

const existingSale = {
  _doc: {
    id: 'sale-id',
    client: 'old-client-id',
    paymentMethod: 'old-payment-method-id',
    business: 'business-id',
    total: 200,
    costTotal: 100,
    discount: undefined,
    status: 'PAID',
    isBilled: false
  },
  discount: undefined
}

describe('salesController', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('rejects storing a sale with missing required fields', async () => {
    const req = buildRequest({
      body: {
        client: 'client-id'
      }
    })
    const res = buildResponse()

    await salesController.store(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      isStored: false,
      message: MISSING_FIELDS_REQUIRED
    })
  })

  it('stores a sale with user audit fields and default discount', async () => {
    const req = buildRequest({
      body: validSaleBody
    })
    const res = buildResponse()
    vi.spyOn(salesService, 'store').mockResolvedValue({ id: 'sale-id' } as never)

    await salesController.store(req as never, res as never)

    expect(salesService.store).toHaveBeenCalledWith({
      ...validSaleBody,
      createdBy: 'user-id',
      updatedBy: 'user-id',
      discount: 0
    })
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({
      status: 201,
      isStored: true,
      data: { id: 'sale-id' }
    })
  })

  it('keeps the provided discount when storing a sale', async () => {
    const req = buildRequest({
      body: {
        ...validSaleBody,
        discount: 15
      }
    })
    const res = buildResponse()
    vi.spyOn(salesService, 'store').mockResolvedValue({ id: 'sale-id' } as never)

    await salesController.store(req as never, res as never)

    expect(salesService.store).toHaveBeenCalledWith(expect.objectContaining({
      discount: 15
    }))
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('rejects updating a sale with missing required fields', async () => {
    const req = buildRequest({
      body: {
        total: 250
      },
      query: {
        id: 'sale-id'
      }
    })
    const res = buildResponse()

    await salesController.update(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      isStored: false,
      message: MISSING_FIELDS_REQUIRED
    })
  })

  it('returns not found when updating a missing sale', async () => {
    const req = buildRequest({
      body: {
        client: 'client-id',
        paymentMethod: 'payment-method-id',
        total: 250
      },
      query: {
        id: 'sale-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(salesService, 'getOne').mockResolvedValue(null as never)

    await salesController.update(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      isUpdated: false,
      message: NOT_FOUND
    })
  })

  it('updates a sale by merging existing data with the body and defaulting discount', async () => {
    const req = buildRequest({
      body: {
        client: 'client-id',
        paymentMethod: 'payment-method-id',
        total: 300
      },
      query: {
        id: 'sale-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(salesService, 'getOne').mockResolvedValue(existingSale as never)
    vi.spyOn(salesService, 'update').mockResolvedValue({ acknowledged: true } as never)

    await salesController.update(req as never, res as never)

    expect(salesService.update).toHaveBeenCalledWith('sale-id', {
      ...existingSale._doc,
      client: 'client-id',
      paymentMethod: 'payment-method-id',
      total: 300
    })
    expect(existingSale.discount).toBe(0)
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('rejects set billed when isBilled is missing', async () => {
    const req = buildRequest({
      body: {},
      query: {
        id: 'sale-id'
      }
    })
    const res = buildResponse()

    await salesController.setBilled(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      isStored: false,
      message: MISSING_FIELDS_REQUIRED
    })
  })

  it('returns not found when setting billed for a missing sale', async () => {
    const req = buildRequest({
      body: {
        isBilled: true
      },
      query: {
        id: 'sale-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(salesService, 'getOne').mockResolvedValue(null as never)

    await salesController.setBilled(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      isUpdated: false,
      message: NOT_FOUND
    })
  })

  it('sets billed by merging with the existing sale data', async () => {
    const req = buildRequest({
      body: {
        isBilled: true
      },
      query: {
        id: 'sale-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(salesService, 'getOne').mockResolvedValue(existingSale as never)
    vi.spyOn(salesService, 'update').mockResolvedValue({ acknowledged: true } as never)

    await salesController.setBilled(req as never, res as never)

    expect(salesService.update).toHaveBeenCalledWith('sale-id', {
      ...existingSale._doc,
      isBilled: true
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('gets sales using date filters when no id or all flag is provided', async () => {
    const req = buildRequest({
      query: {
        startDate: '2026-02-10',
        endDate: '2026-02-20'
      }
    })
    const res = buildResponse()
    vi.spyOn(salesService, 'getAll').mockResolvedValue([] as never)

    await salesController.getAll(req as never, res as never)

    expect(salesService.getAll).toHaveBeenCalledWith({
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

  it('gets all sales with an empty filter when all=true', async () => {
    const req = buildRequest({
      query: {
        all: 'true'
      }
    })
    const res = buildResponse()
    vi.spyOn(salesService, 'getAll').mockResolvedValue([] as never)

    await salesController.getAll(req as never, res as never)

    expect(salesService.getAll).toHaveBeenCalledWith({})
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('gets sales by id with priority over all and date filters', async () => {
    const req = buildRequest({
      query: {
        id: 'sale-id',
        all: 'true',
        startDate: '2026-02-10'
      }
    })
    const res = buildResponse()
    vi.spyOn(salesService, 'getAll').mockResolvedValue([] as never)

    await salesController.getAll(req as never, res as never)

    expect(salesService.getAll).toHaveBeenCalledWith({
      $expr: {
        $and: [{ $eq: ['$_id', 'sale-id'] }]
      }
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })
})
