import { afterEach, describe, expect, it, vi } from 'vitest'

import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../../labels/labels'
import { productItemsService } from '../../services/productItems'
import productItemsController from '../productItems'

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

const validProductItemBody = {
  product: 'product-id',
  asset: 'asset-id',
  quantity: 2
}

describe('productItemsController', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('gets all product items with empty filter', async () => {
    const req = buildRequest()
    const res = buildResponse()
    vi.spyOn(productItemsService, 'getAll').mockResolvedValue([] as never)

    await productItemsController.getAll(req as never, res as never)

    expect(productItemsService.getAll).toHaveBeenCalledWith({})
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('gets product items by id when id is provided', async () => {
    const req = buildRequest({
      query: {
        id: 'product-item-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(productItemsService, 'getAll').mockResolvedValue([] as never)

    await productItemsController.getAll(req as never, res as never)

    expect(productItemsService.getAll).toHaveBeenCalledWith({
      $expr: {
        $and: [{ $eq: ['$_id', 'product-item-id'] }]
      }
    })
  })

  it('rejects storing product item with missing fields', async () => {
    const req = buildRequest({
      body: {
        product: 'product-id'
      }
    })
    const res = buildResponse()

    await productItemsController.store(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      isStored: false,
      message: MISSING_FIELDS_REQUIRED
    })
  })

  it('stores product item with audit fields', async () => {
    const req = buildRequest({
      body: validProductItemBody
    })
    const res = buildResponse()
    vi.spyOn(productItemsService, 'store').mockResolvedValue({ id: 'product-item-id' } as never)

    await productItemsController.store(req as never, res as never)

    expect(productItemsService.store).toHaveBeenCalledWith({
      ...validProductItemBody,
      createdBy: 'user-id',
      updatedBy: 'user-id'
    })
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('rejects bulk store with empty list', async () => {
    const req = buildRequest({
      body: {
        productItems: []
      }
    })
    const res = buildResponse()

    await productItemsController.storeMany(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('stores many product items with audit fields', async () => {
    const req = buildRequest({
      body: {
        productItems: [validProductItemBody]
      }
    })
    const res = buildResponse()
    vi.spyOn(productItemsService, 'storeMany').mockResolvedValue([{ id: 'product-item-id' }] as never)

    await productItemsController.storeMany(req as never, res as never)

    expect(productItemsService.storeMany).toHaveBeenCalledWith([
      {
        ...validProductItemBody,
        createdBy: 'user-id',
        updatedBy: 'user-id'
      }
    ])
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('rejects updating product item with missing fields', async () => {
    const req = buildRequest({
      params: {
        id: 'product-item-id'
      },
      body: {
        product: 'product-id'
      }
    })
    const res = buildResponse()

    await productItemsController.update(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns not found when updating a missing product item', async () => {
    const req = buildRequest({
      params: {
        id: 'product-item-id'
      },
      body: validProductItemBody
    })
    const res = buildResponse()
    vi.spyOn(productItemsService, 'getOne').mockResolvedValue(null as never)

    await productItemsController.update(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      isUpdated: false,
      message: NOT_FOUND
    })
  })

  it('updates product item by merging existing data with body', async () => {
    const req = buildRequest({
      params: {
        id: 'product-item-id'
      },
      body: {
        product: 'new-product-id',
        asset: 'asset-id',
        quantity: 3
      }
    })
    const res = buildResponse()
    vi.spyOn(productItemsService, 'getOne').mockResolvedValue({
      _doc: {
        product: 'old-product-id',
        asset: 'asset-id',
        quantity: 1
      }
    } as never)
    vi.spyOn(productItemsService, 'update').mockResolvedValue({ acknowledged: true } as never)

    await productItemsController.update(req as never, res as never)

    expect(productItemsService.update).toHaveBeenCalledWith('product-item-id', {
      product: 'new-product-id',
      asset: 'asset-id',
      quantity: 3
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('rejects bulk update with empty list', async () => {
    const req = buildRequest({
      body: {
        productItems: []
      }
    })
    const res = buildResponse()

    await productItemsController.updateMany(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('updates many product items through service', async () => {
    const req = buildRequest({
      body: {
        productItems: [
          {
            id: 'product-item-id',
            ...validProductItemBody
          }
        ]
      }
    })
    const res = buildResponse()
    vi.spyOn(productItemsService, 'updateMany').mockResolvedValue([{ id: 'product-item-id' }] as never)

    await productItemsController.updateMany(req as never, res as never)

    expect(productItemsService.updateMany).toHaveBeenCalledWith([
      {
        id: 'product-item-id',
        ...validProductItemBody
      }
    ])
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('rejects bulk delete with empty list', async () => {
    const req = buildRequest({
      body: {
        productItems: []
      }
    })
    const res = buildResponse()

    await productItemsController.deleteMany(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('bulk deletes valid product item ids', async () => {
    const req = buildRequest({
      body: {
        productItems: [
          { id: 'product-item-one' },
          { product: 'product-without-id' },
          { id: 'product-item-two' }
        ]
      }
    })
    const res = buildResponse()
    vi.spyOn(productItemsService, 'deleteMany').mockResolvedValue({ deletedCount: 2 } as never)

    await productItemsController.deleteMany(req as never, res as never)

    expect(productItemsService.deleteMany).toHaveBeenCalledWith(['product-item-one', 'product-item-two'])
    expect(res.status).toHaveBeenCalledWith(200)
  })
})
