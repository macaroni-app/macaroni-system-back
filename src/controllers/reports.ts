import { Request, Response } from 'express'

// services
import { reportService } from '../services/reports'

// types
import { GetSaleQueryType, SaleType } from '../schemas/sales'
import { GetSaleItemQueryType, SaleItemType } from '../schemas/saleItems'

const reportsController = {
  getAllSales: async (req: Request<{}, {}, {}, GetSaleQueryType>, res: Response): Promise<Response> => {
    const { id } = req.query

    const all = req.query.all === 'true'

    let startDate = new Date()
    let endDate = new Date()

    if (req.query.startDate !== undefined) {
      startDate = new Date(req.query.startDate)
    }

    if (req.query.endDate !== undefined) {
      endDate = new Date(req.query.endDate)
    }

    const firstDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    const lastDayOfMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0)

    startDate = firstDayOfMonth
    endDate = lastDayOfMonth

    const filters = {
      $expr: {
        $and: [
          { $eq: ['$isDeleted', false] },
          { $gte: ['$createdAt', startDate] },
          { $lte: ['$createdAt', endDate] }
        ]
      }
    }

    const sales: SaleType[] = await reportService.getAllSales(
      (id === undefined || id === null)
        ? !all
            ? filters
            : {}
        : {
            $expr: {
              $and: [{ $eq: ['$_id', id] }]
            }
          }
    )

    return res.status(200).json({
      status: 200,
      total: sales.length,
      data: sales
    })
  },
  getAllSaleItems: async (req: Request<{}, {}, {}, GetSaleItemQueryType>, res: Response): Promise<Response> => {
    const { id } = req.query

    const all = req.query.all === 'true'

    let startDate = new Date()
    let endDate = new Date()

    if (req.query.startDate !== undefined) {
      startDate = new Date(req.query.startDate)
    }

    if (req.query.endDate !== undefined) {
      endDate = new Date(req.query.endDate)
    }

    const firstDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    const lastDayOfMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0)

    startDate = firstDayOfMonth
    endDate = lastDayOfMonth

    const filters = {
      $expr: {
        $and: [
          { $eq: ['$isDeleted', false] },
          { $gte: ['$createdAt', startDate] },
          { $lte: ['$createdAt', endDate] }
        ]
      }
    }

    const sales: SaleItemType[] = await reportService.getAllSaleItems(
      (id === undefined || id === null)
        ? !all
            ? filters
            : {}
        : {
            $expr: {
              $and: [{ $eq: ['$_id', id] }]
            }
          }
    )

    return res.status(200).json({
      status: 200,
      total: sales.length,
      data: sales
    })
  }
}

export default reportsController
