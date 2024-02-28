import { Request, Response } from 'express'
import { salesService } from '../services/sales'
import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../labels/labels'
import { CreateSaleBodyType, GetSaleParamsType, GetSaleQueryType, SaleType, UpdateSaleBodyType, UpdateSaleParamsType } from '../schemas/sales'
import { DeleteClientParamsType } from '../schemas/clients'

const salesController = {
  getAll: async (req: Request<{}, {}, {}, GetSaleQueryType>, res: Response): Promise<Response> => {
    const { id } = req.query

    const filters = {
      $expr: {
        $and: [{ $eq: ['$_id', id] }]
      }
    }

    const sales: SaleType[] = await salesService.getAll((id !== null && id !== undefined) ? filters : {})

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

    const saleStored: SaleType = await salesService.store(saleToStore)

    return res.status(201).json({
      status: 201,
      isStored: true,
      data: saleStored
    })
  },
  delete: async (req: Request<DeleteClientParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
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
  update: async (req: Request<UpdateSaleParamsType, {}, UpdateSaleBodyType, {}>, res: Response): Promise<Response> => {
    if (
      (req.body.isRetail === null || req.body.isRetail === undefined) ||
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

    const { id } = req.params

    const oldSale = await salesService.getOne({ _id: id })

    if (oldSale === null || oldSale === undefined) {
      return res.status(404).json({
        status: 404,
        isUpdated: false,
        message: NOT_FOUND
      })
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
