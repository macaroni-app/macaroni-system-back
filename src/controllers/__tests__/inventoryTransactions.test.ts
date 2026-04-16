import { afterEach, describe, expect, it, vi } from 'vitest'

import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../../labels/labels'
import { inventoryTransactionService } from '../../services/inventoryTransactions'
import inventoryTransactionController from '../inventoryTransactions'

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

const validTransactionBody = {
  asset: 'asset-id',
  transactionType: 'DOWN',
  transactionReason: 'SELL',
  affectedAmount: 2,
  oldQuantityAvailable: 10,
  currentQuantityAvailable: 8,
  unitCost: 50
}

describe('inventoryTransactionController', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('gets inventory transactions by date filters', async () => {
    const req = buildRequest({
      query: {
        startDate: '2026-02-10',
        endDate: '2026-02-20'
      }
    })
    const res = buildResponse()
    vi.spyOn(inventoryTransactionService, 'getAll').mockResolvedValue([] as never)

    await inventoryTransactionController.getAll(req as never, res as never)

    expect(inventoryTransactionService.getAll).toHaveBeenCalledWith({
      $expr: {
        $and: [
          { $gte: ['$createdAt', new Date('2026-02-10')] },
          { $lte: ['$createdAt', new Date('2026-02-21')] }
        ]
      }
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('gets inventory transaction by id when id is provided', async () => {
    const req = buildRequest({
      query: {
        id: 'transaction-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(inventoryTransactionService, 'getAll').mockResolvedValue([] as never)

    await inventoryTransactionController.getAll(req as never, res as never)

    expect(inventoryTransactionService.getAll).toHaveBeenCalledWith({
      $expr: {
        $and: [{ $eq: ['$_id', 'transaction-id'] }]
      }
    })
  })

  it('rejects storing transaction with missing fields', async () => {
    const req = buildRequest({
      body: {
        asset: 'asset-id'
      }
    })
    const res = buildResponse()

    await inventoryTransactionController.store(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      isStored: false,
      message: MISSING_FIELDS_REQUIRED
    })
  })

  it('stores transaction with audit fields', async () => {
    const req = buildRequest({
      body: validTransactionBody
    })
    const res = buildResponse()
    vi.spyOn(inventoryTransactionService, 'store').mockResolvedValue({ id: 'transaction-id' } as never)

    await inventoryTransactionController.store(req as never, res as never)

    expect(inventoryTransactionService.store).toHaveBeenCalledWith({
      ...validTransactionBody,
      createdBy: 'user-id',
      updatedBy: 'user-id'
    })
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('rejects bulk store with empty list', async () => {
    const req = buildRequest({
      body: {
        inventoryTransactions: []
      }
    })
    const res = buildResponse()

    await inventoryTransactionController.storeMany(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('stores many transactions with audit fields', async () => {
    const req = buildRequest({
      body: {
        inventoryTransactions: [validTransactionBody]
      }
    })
    const res = buildResponse()
    vi.spyOn(inventoryTransactionService, 'storeMany').mockResolvedValue([{ id: 'transaction-id' }] as never)

    await inventoryTransactionController.storeMany(req as never, res as never)

    expect(inventoryTransactionService.storeMany).toHaveBeenCalledWith([
      {
        ...validTransactionBody,
        createdBy: 'user-id',
        updatedBy: 'user-id'
      }
    ])
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('rejects updating transaction with missing fields', async () => {
    const req = buildRequest({
      params: {
        id: 'transaction-id'
      },
      body: {
        asset: 'asset-id'
      }
    })
    const res = buildResponse()

    await inventoryTransactionController.update(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns not found when updating a missing transaction', async () => {
    const req = buildRequest({
      params: {
        id: 'transaction-id'
      },
      body: validTransactionBody
    })
    const res = buildResponse()
    vi.spyOn(inventoryTransactionService, 'getOne').mockResolvedValue(null as never)

    await inventoryTransactionController.update(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      isUpdated: false,
      message: NOT_FOUND
    })
  })

  it('returns bad request when transaction update is not acknowledged', async () => {
    const req = buildRequest({
      params: {
        id: 'transaction-id'
      },
      body: validTransactionBody
    })
    const res = buildResponse()
    vi.spyOn(inventoryTransactionService, 'getOne').mockResolvedValue({ _doc: { asset: 'old-asset-id' } } as never)
    vi.spyOn(inventoryTransactionService, 'update').mockResolvedValue({ acknowledged: false } as never)

    await inventoryTransactionController.update(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('updates transaction successfully', async () => {
    const req = buildRequest({
      params: {
        id: 'transaction-id'
      },
      body: validTransactionBody
    })
    const res = buildResponse()
    vi.spyOn(inventoryTransactionService, 'getOne').mockResolvedValue({ _doc: { asset: 'old-asset-id' } } as never)
    vi.spyOn(inventoryTransactionService, 'update').mockResolvedValue({ acknowledged: true } as never)

    await inventoryTransactionController.update(req as never, res as never)

    expect(inventoryTransactionService.update).toHaveBeenCalledWith('transaction-id', {
      asset: 'asset-id',
      transactionType: 'DOWN',
      transactionReason: 'SELL',
      affectedAmount: 2,
      oldQuantityAvailable: 10,
      currentQuantityAvailable: 8,
      unitCost: 50
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('returns not found when deleting a missing transaction', async () => {
    const req = buildRequest({
      params: {
        id: 'transaction-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(inventoryTransactionService, 'delete').mockResolvedValue(null as never)

    await inventoryTransactionController.delete(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('deletes transaction successfully', async () => {
    const req = buildRequest({
      params: {
        id: 'transaction-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(inventoryTransactionService, 'delete').mockResolvedValue({ deletedCount: 1 } as never)

    await inventoryTransactionController.delete(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(200)
  })
})
