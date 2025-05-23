import { Request, Response } from 'express'
import { salesService } from '../services/sales'
import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../labels/labels'
import { CreateSaleBodyType, DeleteSaleParamsType, GetSaleParamsType, GetSaleQueryType, SaleType, UpdateSaleBodyType, UpdateSaleQueryType } from '../schemas/sales'

const salesController = {
  getAll: async (req: Request<{}, {}, {}, GetSaleQueryType>, res: Response): Promise<Response> => {
    const { id } = req.query

    const all = req.query.all === 'true'

    let startDate = new Date()
    let endDate = new Date()

    if (req.query.startDate !== undefined) {
      startDate = new Date(req.query.startDate)
    }

    if (req.query.endDate !== undefined) {
      endDate = new Date(req.query.endDate)
      endDate.setDate(endDate.getDate() + 1)
    }

    const firstDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    const lastDayOfMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0)

    if (req.query.startDate === undefined && req.query.endDate === undefined) {
      startDate = firstDayOfMonth
      endDate = lastDayOfMonth
    }

    const filters = {
      $expr: {
        $and: [
          { $eq: ['$isDeleted', false] },
          { $gte: ['$createdAt', startDate] },
          { $lte: ['$createdAt', endDate] }
        ]
      }
    }

    const sales: SaleType[] = await salesService.getAll(
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
  getOne: async (req: Request<GetSaleParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const sale: SaleType = await salesService.getOne({ _id: id })

    if (sale === null || sale === undefined) {
      return res.status(404).json({
        status: 404,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      data: sale
    })
  },
  store: async (req: Request<{}, {}, CreateSaleBodyType, {}>, res: Response): Promise<Response> => {
    if (
      (req.body.isRetail === null || req.body.isRetail === undefined) ||
      (req.body.paymentMethod === null || req.body.paymentMethod === undefined) ||
      (req.body.client === null || req.body.client === undefined) ||
      (req.body.business === null || req.body.business === undefined) ||
      (req.body.costTotal === null || req.body.costTotal === undefined) ||
      (req.body.total === null || req.body.total === undefined)
    ) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const saleToStore = { ...req.body }
    saleToStore.createdBy = req?.user?.id
    saleToStore.updatedBy = req?.user?.id

    if (saleToStore.discount === undefined || saleToStore.discount === null) {
      saleToStore.discount = 0
    }

    const saleStored: SaleType = await salesService.store(saleToStore)

    return res.status(201).json({
      status: 201,
      isStored: true,
      data: saleStored
    })
  },
  delete: async (req: Request<DeleteSaleParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const saleDeleted = await salesService.delete(id)

    if (saleDeleted === null || saleDeleted === undefined) {
      return res.status(404).json({
        status: 404,
        isDeleted: false,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      isDeleted: true,
      data: saleDeleted
    })
  },
  update: async (req: Request<{}, {}, UpdateSaleBodyType, UpdateSaleQueryType>, res: Response): Promise<Response> => {
    if (
      (req.body.client === null || req.body.client === undefined) ||
      (req.body.paymentMethod === null || req.body.paymentMethod === undefined) ||
      (req.body.total === null || req.body.total === undefined)
    ) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const { id } = req.query

    const oldSale = await salesService.getOne({ _id: id })

    if (oldSale === null || oldSale === undefined) {
      return res.status(404).json({
        status: 404,
        isUpdated: false,
        message: NOT_FOUND
      })
    }

    if (oldSale.discount === undefined || oldSale.discount === null) {
      oldSale.discount = 0
    }

    const newSaleData = { ...oldSale._doc, ...req.body }

    const salesUpdated = await salesService.update(id, newSaleData)

    return res.status(200).json({
      status: 200,
      isUpdated: true,
      data: salesUpdated
    })
  },
  setBilled: async (req: Request<{}, {}, UpdateSaleBodyType, UpdateSaleQueryType>, res: Response): Promise<Response> => {
    if (
      (req.body.isBilled === null || req.body.isBilled === undefined)
    ) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const { id } = req.query

    const oldSale = await salesService.getOne({ _id: id })

    if (oldSale === null || oldSale === undefined) {
      return res.status(404).json({
        status: 404,
        isUpdated: false,
        message: NOT_FOUND
      })
    }

    if (oldSale.discount === undefined || oldSale.discount === null) {
      oldSale.discount = 0
    }

    const newSaleData = { ...oldSale._doc, ...req.body }

    const salesUpdated = await salesService.update(id, newSaleData)

    return res.status(200).json({
      status: 200,
      isUpdated: true,
      data: salesUpdated
    })
  }
}

export default salesController
