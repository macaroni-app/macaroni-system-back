import { afterEach, describe, expect, it, vi } from 'vitest'

import { INVALID_PRODUCT_PRICE, MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../../labels/labels'
import { productsService } from '../../services/products'
import productsController from '../products'

const buildResponse = () => {
  const response = {
    status: vi.fn(),
    json: vi.fn()
  }
  response.status.mockReturnValue(response)
  response.json.mockReturnValue(response)
  return response
}

const buildRequest = (body: Record<string, unknown> = {}): Record<string, any> => ({
  body,
  params: {},
  query: {},
  user: {
    id: 'user-id'
  }
})

const validProducts = [
  {
    id: '507f1f77bcf86cd799439011',
    retailsalePrice: 1200,
    wholesalePrice: 1000
  },
  {
    id: '507f1f77bcf86cd799439012',
    retailsalePrice: 2400,
    wholesalePrice: 2000
  }
]

describe('productsController.updateManyPrices', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('rechaza lista vacia', async () => {
    const req = buildRequest({ products: [] })
    const res = buildResponse()

    await productsController.updateManyPrices(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      isUpdated: false,
      message: MISSING_FIELDS_REQUIRED
    })
  })

  it('rechaza productos sin id', async () => {
    const req = buildRequest({
      products: [
        {
          retailsalePrice: 1200,
          wholesalePrice: 1000
        }
      ]
    })
    const res = buildResponse()

    await productsController.updateManyPrices(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      isUpdated: false,
      message: MISSING_FIELDS_REQUIRED
    })
  })

  it('rechaza precios negativos', async () => {
    const req = buildRequest({
      products: [
        {
          id: '507f1f77bcf86cd799439011',
          retailsalePrice: -1,
          wholesalePrice: 1000
        }
      ]
    })
    const res = buildResponse()

    await productsController.updateManyPrices(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      isUpdated: false,
      message: INVALID_PRODUCT_PRICE
    })
  })

  it('rechaza si algun producto no existe o esta inactivo', async () => {
    const req = buildRequest({ products: validProducts })
    const res = buildResponse()
    vi.spyOn(productsService, 'getAll').mockResolvedValue([{ _id: validProducts[0].id }] as never)
    const bulkUpdate = vi.spyOn(productsService, 'updateManyPrices')

    await productsController.updateManyPrices(req as never, res as never)

    expect(productsService.getAll).toHaveBeenCalledWith({
      _id: {
        $in: [validProducts[0].id, validProducts[1].id]
      },
      isActive: true
    })
    expect(bulkUpdate).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      isUpdated: false,
      message: NOT_FOUND
    })
  })

  it('actualiza multiples productos validos con auditoria y solo envia campos de precio', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-16T12:00:00.000Z'))
    const req = buildRequest({ products: validProducts })
    const res = buildResponse()
    vi.spyOn(productsService, 'getAll').mockResolvedValue([
      { _id: validProducts[0].id },
      { _id: validProducts[1].id }
    ] as never)
    vi.spyOn(productsService, 'updateManyPrices').mockResolvedValue({ modifiedCount: 2 } as never)

    await productsController.updateManyPrices(req as never, res as never)

    expect(productsService.updateManyPrices).toHaveBeenCalledWith([
      {
        id: validProducts[0].id,
        retailsalePrice: 1200,
        wholesalePrice: 1000,
        updatedAt: new Date('2026-04-16T12:00:00.000Z'),
        updatedBy: 'user-id'
      },
      {
        id: validProducts[1].id,
        retailsalePrice: 2400,
        wholesalePrice: 2000,
        updatedAt: new Date('2026-04-16T12:00:00.000Z'),
        updatedBy: 'user-id'
      }
    ])
    expect(productsService.updateManyPrices).not.toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          costPrice: expect.anything(),
          name: expect.anything(),
          category: expect.anything(),
          productType: expect.anything(),
          isActive: expect.anything()
        })
      ])
    )
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      isUpdated: true,
      total: 2,
      data: {
        modifiedCount: 2
      }
    })
  })
})
