import { afterEach, describe, expect, it, vi } from 'vitest'

import { reportService } from '../../services/reports'
import reportsController from '../reports'

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

describe('reportsController', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('gets sales using the current month as default range', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 14, 12, 0, 0, 0))
    const req = buildRequest()
    const res = buildResponse()
    vi.spyOn(reportService, 'getAllSales').mockResolvedValue([{ id: 'sale-id' }] as never)

    await reportsController.getAllSales(req as never, res as never)

    expect(reportService.getAllSales).toHaveBeenCalledWith({
      $expr: {
        $and: [
          { $eq: ['$isDeleted', false] },
          { $gte: ['$createdAt', new Date(2026, 3, 1)] },
          { $lte: ['$createdAt', new Date(2026, 4, 0)] }
        ]
      }
    })
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      total: 1,
      data: [{ id: 'sale-id' }]
    })
  })

  it('gets sales using history month range when requested', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 14, 12, 0, 0, 0))
    const req = buildRequest({
      historyMonthToRetrieve: '12'
    })
    const res = buildResponse()
    vi.spyOn(reportService, 'getAllSales').mockResolvedValue([] as never)

    await reportsController.getAllSales(req as never, res as never)

    expect(reportService.getAllSales).toHaveBeenCalledWith({
      $expr: {
        $and: [
          { $eq: ['$isDeleted', false] },
          { $gte: ['$createdAt', new Date(2025, 4, 1, 0, 0, 0, 0)] },
          { $lte: ['$createdAt', new Date(2026, 4, 0, 12, 0, 0, 0)] }
        ]
      }
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('gets all sales with an empty filter when all=true', async () => {
    const req = buildRequest({
      all: 'true'
    })
    const res = buildResponse()
    vi.spyOn(reportService, 'getAllSales').mockResolvedValue([] as never)

    await reportsController.getAllSales(req as never, res as never)

    expect(reportService.getAllSales).toHaveBeenCalledWith({})
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('gets sale items using the same monthly filters as sales', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 14, 12, 0, 0, 0))
    const req = buildRequest()
    const res = buildResponse()
    vi.spyOn(reportService, 'getAllSaleItems').mockResolvedValue([{ id: 'sale-item-id' }] as never)

    await reportsController.getAllSaleItems(req as never, res as never)

    expect(reportService.getAllSaleItems).toHaveBeenCalledWith({
      $expr: {
        $and: [
          { $eq: ['$isDeleted', false] },
          { $gte: ['$createdAt', new Date(2026, 3, 1)] },
          { $lte: ['$createdAt', new Date(2026, 4, 0)] }
        ]
      }
    })
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      total: 1,
      data: [{ id: 'sale-item-id' }]
    })
  })

  it('gets fixed costs filtering by operation date', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 14, 12, 0, 0, 0))
    const req = buildRequest()
    const res = buildResponse()
    vi.spyOn(reportService, 'getAllFixedCosts').mockResolvedValue([{ id: 'fixed-cost-id' }] as never)

    await reportsController.getAllFixedCosts(req as never, res as never)

    expect(reportService.getAllFixedCosts).toHaveBeenCalledWith({
      $expr: {
        $and: [
          { $eq: ['$isDeleted', false] },
          { $gte: ['$operationDate', new Date(2026, 3, 1)] },
          { $lte: ['$operationDate', new Date(2026, 4, 0)] }
        ]
      }
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('gets inventory transactions filtering by created date', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 14, 12, 0, 0, 0))
    const req = buildRequest()
    const res = buildResponse()
    vi.spyOn(reportService, 'getAllInventoryTransactions').mockResolvedValue([{ id: 'transaction-id' }] as never)

    await reportsController.getAllInventoryTransactions(req as never, res as never)

    expect(reportService.getAllInventoryTransactions).toHaveBeenCalledWith({
      $expr: {
        $and: [
          { $gte: ['$createdAt', new Date(2026, 3, 1)] },
          { $lte: ['$createdAt', new Date(2026, 4, 0)] }
        ]
      }
    })
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      total: 1,
      data: [{ id: 'transaction-id' }]
    })
  })
})
