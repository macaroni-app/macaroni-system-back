import { afterEach, describe, expect, it, vi } from 'vitest'

import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../../labels/labels'
import { fixedCostService } from '../../services/fixedCosts'
import fixedCostController from '../fixedCosts'

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

describe('fixedCostController', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('gets fixed costs using operation date filters by default', async () => {
    const req = buildRequest({
      query: {
        startDate: '2026-02-10',
        endDate: '2026-02-20'
      }
    })
    const res = buildResponse()
    vi.spyOn(fixedCostService, 'getAll').mockResolvedValue([] as never)

    await fixedCostController.getAll(req as never, res as never)

    expect(fixedCostService.getAll).toHaveBeenCalledWith({
      $expr: {
        $and: [
          { $eq: ['$isDeleted', false] },
          { $gte: ['$operationDate', new Date('2026-02-10')] },
          { $lte: ['$operationDate', new Date('2026-02-21')] }
        ]
      }
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('gets all fixed costs with an empty filter when all=true', async () => {
    const req = buildRequest({
      query: {
        all: 'true'
      }
    })
    const res = buildResponse()
    vi.spyOn(fixedCostService, 'getAll').mockResolvedValue([] as never)

    await fixedCostController.getAll(req as never, res as never)

    expect(fixedCostService.getAll).toHaveBeenCalledWith({})
  })

  it('gets fixed costs by id with priority over other filters', async () => {
    const req = buildRequest({
      query: {
        id: 'fixed-cost-id',
        all: 'true',
        startDate: '2026-02-10'
      }
    })
    const res = buildResponse()
    vi.spyOn(fixedCostService, 'getAll').mockResolvedValue([] as never)

    await fixedCostController.getAll(req as never, res as never)

    expect(fixedCostService.getAll).toHaveBeenCalledWith({
      $expr: {
        $and: [{ $eq: ['$_id', 'fixed-cost-id'] }]
      }
    })
  })

  it('returns not found when one fixed cost does not exist', async () => {
    const req = buildRequest({
      params: {
        id: 'fixed-cost-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(fixedCostService, 'getOne').mockResolvedValue(null as never)

    await fixedCostController.getOne(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: NOT_FOUND
    })
  })

  it('returns one fixed cost when it exists', async () => {
    const req = buildRequest({
      params: {
        id: 'fixed-cost-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(fixedCostService, 'getOne').mockResolvedValue({ id: 'fixed-cost-id' } as never)

    await fixedCostController.getOne(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('rejects storing fixed cost without name', async () => {
    const req = buildRequest({
      body: {
        amount: 100
      }
    })
    const res = buildResponse()

    await fixedCostController.store(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      isStored: false,
      message: MISSING_FIELDS_REQUIRED
    })
  })

  it('stores fixed cost with audit fields', async () => {
    const req = buildRequest({
      body: {
        name: 'Alquiler',
        amount: 100
      }
    })
    const res = buildResponse()
    vi.spyOn(fixedCostService, 'store').mockResolvedValue({ id: 'fixed-cost-id' } as never)

    await fixedCostController.store(req as never, res as never)

    expect(fixedCostService.store).toHaveBeenCalledWith({
      name: 'Alquiler',
      amount: 100,
      createdBy: 'user-id',
      updatedBy: 'user-id'
    })
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('returns not found when delete does not find fixed cost', async () => {
    const req = buildRequest({
      params: {
        id: 'fixed-cost-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(fixedCostService, 'delete').mockResolvedValue(null as never)

    await fixedCostController.delete(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('deletes fixed cost successfully', async () => {
    const req = buildRequest({
      params: {
        id: 'fixed-cost-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(fixedCostService, 'delete').mockResolvedValue({ deletedCount: 1 } as never)

    await fixedCostController.delete(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('rejects updating fixed cost without name', async () => {
    const req = buildRequest({
      params: {
        id: 'fixed-cost-id'
      },
      body: {
        amount: 100
      }
    })
    const res = buildResponse()

    await fixedCostController.update(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns not found when updating missing fixed cost', async () => {
    const req = buildRequest({
      params: {
        id: 'fixed-cost-id'
      },
      body: {
        name: 'Alquiler',
        amount: 100
      }
    })
    const res = buildResponse()
    vi.spyOn(fixedCostService, 'getOne').mockResolvedValue(null as never)

    await fixedCostController.update(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('updates fixed cost by merging old document with request body', async () => {
    const req = buildRequest({
      params: {
        id: 'fixed-cost-id'
      },
      body: {
        name: 'Alquiler',
        amount: 150
      }
    })
    const res = buildResponse()
    vi.spyOn(fixedCostService, 'getOne').mockResolvedValue({
      _doc: {
        id: 'fixed-cost-id',
        untouched: true
      }
    } as never)
    vi.spyOn(fixedCostService, 'update').mockResolvedValue({ acknowledged: true } as never)

    await fixedCostController.update(req as never, res as never)

    expect(fixedCostService.update).toHaveBeenCalledWith('fixed-cost-id', {
      id: 'fixed-cost-id',
      untouched: true,
      name: 'Alquiler',
      amount: 150
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })
})
