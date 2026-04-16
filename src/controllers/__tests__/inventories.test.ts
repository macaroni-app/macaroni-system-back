import { afterEach, describe, expect, it, vi } from 'vitest'

import { INSUFFICIENT_INVENTORY, MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../../labels/labels'
import { inventoryService } from '../../services/inventories'
import inventoriesController from '../inventories'

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

describe('inventoriesController', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects updating inventory without quantity delta', async () => {
    const req = buildRequest({
      params: {
        id: 'inventory-id'
      },
      body: {}
    })
    const res = buildResponse()

    await inventoriesController.update(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      isUpdated: false,
      message: MISSING_FIELDS_REQUIRED
    })
  })

  it('updates inventory successfully', async () => {
    const req = buildRequest({
      params: {
        id: 'inventory-id'
      },
      body: {
        asset: 'asset-id',
        quantityDelta: -2
      }
    })
    const res = buildResponse()
    vi.spyOn(inventoryService, 'updateAtomic').mockResolvedValue({ id: 'inventory-id' } as never)

    await inventoriesController.update(req as never, res as never)

    expect(inventoryService.updateAtomic).toHaveBeenCalledWith('inventory-id', {
      asset: 'asset-id',
      quantityDelta: -2,
      updatedBy: 'user-id'
    })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      isUpdated: true,
      data: { id: 'inventory-id' }
    })
  })

  it('returns not found when atomic update fails and inventory does not exist', async () => {
    const req = buildRequest({
      params: {
        id: 'inventory-id'
      },
      body: {
        quantityDelta: -2
      }
    })
    const res = buildResponse()
    vi.spyOn(inventoryService, 'updateAtomic').mockResolvedValue(null as never)
    vi.spyOn(inventoryService, 'getOne').mockResolvedValue(null as never)

    await inventoriesController.update(req as never, res as never)

    expect(inventoryService.getOne).toHaveBeenCalledWith({ _id: 'inventory-id' })
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      isUpdated: false,
      message: NOT_FOUND
    })
  })

  it('returns insufficient inventory when atomic update fails but inventory exists', async () => {
    const req = buildRequest({
      params: {
        id: 'inventory-id'
      },
      body: {
        quantityDelta: -2
      }
    })
    const res = buildResponse()
    vi.spyOn(inventoryService, 'updateAtomic').mockResolvedValue(undefined as never)
    vi.spyOn(inventoryService, 'getOne').mockResolvedValue({ id: 'inventory-id' } as never)

    await inventoriesController.update(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({
      status: 409,
      isUpdated: false,
      message: INSUFFICIENT_INVENTORY
    })
  })

  it('rejects bulk update with an empty list', async () => {
    const req = buildRequest({
      body: {
        inventories: []
      }
    })
    const res = buildResponse()

    await inventoriesController.updateMany(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      isUpdated: false,
      message: MISSING_FIELDS_REQUIRED
    })
  })

  it('adds updatedBy to every inventory in a successful bulk update', async () => {
    const req = buildRequest({
      body: {
        inventories: [
          {
            id: 'inventory-one',
            quantityDelta: -1
          },
          {
            id: 'inventory-two',
            asset: 'asset-id',
            quantityDelta: 3
          }
        ]
      }
    })
    const res = buildResponse()
    vi.spyOn(inventoryService, 'updateManyAtomic').mockResolvedValue({
      updated: [{ id: 'inventory-one' }],
      failed: []
    } as never)

    await inventoriesController.updateMany(req as never, res as never)

    expect(inventoryService.updateManyAtomic).toHaveBeenCalledWith([
      {
        id: 'inventory-one',
        quantityDelta: -1,
        updatedBy: 'user-id'
      },
      {
        id: 'inventory-two',
        asset: 'asset-id',
        quantityDelta: 3,
        updatedBy: 'user-id'
      }
    ])
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('returns not found when bulk update reports a missing inventory', async () => {
    const req = buildRequest({
      body: {
        inventories: [
          {
            id: 'inventory-id',
            quantityDelta: -1
          }
        ]
      }
    })
    const res = buildResponse()
    const data = {
      updated: [],
      failed: [
        {
          id: 'inventory-id',
          message: NOT_FOUND
        }
      ]
    }
    vi.spyOn(inventoryService, 'updateManyAtomic').mockResolvedValue(data as never)

    await inventoriesController.updateMany(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      isUpdated: false,
      message: NOT_FOUND,
      data
    })
  })

  it('returns insufficient inventory when bulk update reports stock failure', async () => {
    const req = buildRequest({
      body: {
        inventories: [
          {
            id: 'inventory-id',
            quantityDelta: -1
          }
        ]
      }
    })
    const res = buildResponse()
    const data = {
      updated: [],
      failed: [
        {
          id: 'inventory-id',
          message: INSUFFICIENT_INVENTORY
        }
      ]
    }
    vi.spyOn(inventoryService, 'updateManyAtomic').mockResolvedValue(data as never)

    await inventoriesController.updateMany(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({
      status: 409,
      isUpdated: false,
      message: INSUFFICIENT_INVENTORY,
      data
    })
  })

  it('returns success when bulk update has no failures', async () => {
    const req = buildRequest({
      body: {
        inventories: [
          {
            id: 'inventory-id',
            quantityDelta: 1
          }
        ]
      }
    })
    const res = buildResponse()
    const data = {
      updated: [{ id: 'inventory-id' }],
      failed: []
    }
    vi.spyOn(inventoryService, 'updateManyAtomic').mockResolvedValue(data as never)

    await inventoriesController.updateMany(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      isUpdated: true,
      data
    })
  })
})
