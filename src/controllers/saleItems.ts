import { Request, Response } from 'express'
import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../labels/labels'
import { CreateManySaleItemsBodyType, CreateSaleItemBodyType, DeleteManySaleItemsBodyType, DeleteSaleItemParamsType, GetSaleItemParamsType, GetSaleItemQueryType, SaleItemType, UpdateSaleItemBodyType, UpdateSaleItemParamsType } from '../schemas/saleItems'
import { saleItemsService } from '../services/saleItems'
import { ISaleItem } from '../models/saleItems'

const saleItemsController = {
  getAll: async (req: Request<{}, {}, {}, GetSaleItemQueryType>, res: Response): Promise<Response> => {
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

    const sales: SaleItemType[] = await saleItemsService.getAll(
      (id === undefined || id === null)
        ? !all
            ? filters
            : {}
        : {
            $expr: {
              $and: [{ $eq: ['$sale', id] }]
            }
          }
    )

    return res.status(200).json({
      status: 200,
      total: sales.length,
      data: sales
    })
  },
  getOne: async (req: Request<GetSaleItemParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const sale: SaleItemType = await saleItemsService.getOne({ _id: id })

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
  store: async (req: Request<{}, {}, CreateSaleItemBodyType, {}>, res: Response): Promise<Response> => {
    if (
      (req.body.sale === null || req.body.sale === undefined) ||
      ((req.body.product === null || req.body.product === undefined)
      ) ||
      // (req.body.subtotal === null || req.body.subtotal === undefined) ||
      (req.body.quantity === null || req.body.quantity === undefined)
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

    const saleStored: SaleItemType = await saleItemsService.store(saleToStore)

    return res.status(201).json({
      status: 201,
      isStored: true,
      data: saleStored
    })
  },
  delete: async (req: Request<DeleteSaleItemParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const saleDeleted = await saleItemsService.delete(id)

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
  update: async (req: Request<UpdateSaleItemParamsType, {}, UpdateSaleItemBodyType, {}>, res: Response): Promise<Response> => {
    if (
      (req.body.sale === null || req.body.sale === undefined) ||
      ((req.body.product === null || req.body.product === undefined)
      ) ||
      // (req.body.subtotal === null || req.body.subtotal === undefined) ||
      (req.body.quantity === null || req.body.quantity === undefined)
    ) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const { id } = req.params

    const oldSale = await saleItemsService.getOne({ _id: id })

    if (oldSale === null || oldSale === undefined) {
      return res.status(404).json({
        status: 404,
        isUpdated: false,
        message: NOT_FOUND
      })
    }

    const newSaleData = { ...oldSale._doc, ...req.body }

    const salesUpdated = await saleItemsService.update(id, newSaleData)

    return res.status(200).json({
      status: 200,
      isUpdated: true,
      data: salesUpdated
    })
  },
  storeMany: async (req: Request<{}, {}, CreateManySaleItemsBodyType, {}>, res: Response): Promise<Response> => {
    if (req.body.saleItems !== undefined && req.body.saleItems.length === 0) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const saleItemsToUpdate = req.body.saleItems.map((saleItem) => {
      return {
        ...saleItem, createdBy: req.user?.id, updatedBy: req.user?.id
      }
    }) as unknown as ISaleItem[]

    const data = await saleItemsService.storeMany(saleItemsToUpdate)

    return res.status(200).json({
      status: 200,
      isUpdated: true,
      data
    })
  },
  deleteMany: async (req: Request<{}, {}, DeleteManySaleItemsBodyType, {}>, res: Response): Promise<Response> => {
    if (req.body.saleItems !== undefined && req.body.saleItems.length === 0) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const saleItemsIds: string[] = []

    req.body.saleItems.forEach(saleItem => {
      if (saleItem.id !== undefined) {
        saleItemsIds.push(saleItem.id)
      }
    })

    const data = await saleItemsService.deleteMany(saleItemsIds)

    return res.status(200).json({
      status: 200,
      isDeleted: true,
      data
    })
  }
}

export default saleItemsController
