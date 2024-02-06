import { Request, Response } from 'express'
import { RequestExt } from '../middlewares/validate-token'
import { packItemsService } from '../services/packItems'
import { IPackItem } from '../models/packItems'
import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../labels/labels'

const packItemsController = {
  getAll: async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.query

    const filters = {
      $expr: {
        $and: [{ $eq: ['$_id', id] }]
      }
    }

    const packItems: IPackItem[] = await packItemsService.getAll((id !== null && id !== undefined) ? filters : {})

    return res.status(200).json({
      status: 200,
      total: packItems.length,
      data: packItems
    })
  },
  getOne: async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params

    const packItem: IPackItem = await packItemsService.getOne({ _id: id })

    if (packItem === null || packItem === undefined) {
      return res.status(404).json({
        status: 404,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      data: packItem
    })
  },
  store: async (req: RequestExt, res: Response): Promise<Response> => {
    if (
      (req.body.product === null || req.body.product === undefined) ||
      (req.body.pack === null || req.body.pack === undefined) ||
      (req.body.quantity === null || req.body.quantity === undefined)
    ) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const packItemToStore = { ...req.body }
    packItemToStore.createdBy = req?.user?.id
    packItemToStore.updatedBy = req?.user?.id

    const packItemStored: IPackItem = await packItemsService.store(packItemToStore)

    return res.status(201).json({
      status: 201,
      isStored: true,
      data: packItemStored
    })
  },
  delete: async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params

    const packItemDeleted = await packItemsService.delete(id)

    if (packItemDeleted === null || packItemDeleted === undefined) {
      return res.status(404).json({
        status: 404,
        isDeleted: false,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      isDeleted: true,
      data: packItemDeleted
    })
  },
  update: async (req: Request, res: Response): Promise<Response> => {
    if (
      (req.body.product === null || req.body.product === undefined) ||
      (req.body.pack === null || req.body.pack === undefined) ||
      (req.body.quantity === null || req.body.quantity === undefined)
    ) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const { id } = req.params

    const oldPackItem = await packItemsService.getOne({ _id: id })

    if (oldPackItem === null || oldPackItem === undefined) {
      return res.status(404).json({
        status: 404,
        isUpdated: false,
        message: NOT_FOUND
      })
    }

    const newPackItemData = { ...oldPackItem._doc, ...req.body }

    const packItemUpdated = await packItemsService.update(id, newPackItemData)

    return res.status(200).json({
      status: 200,
      isUpdated: true,
      data: packItemUpdated
    })
  }
  // updateMany: async (req: Request, res: Response): Promise<Response> => {
  //   if ((req.body.products === null || req.body.products === undefined) && req.body.products.length > 0) {
  //     return res.status(400).json({
  //       status: 400,
  //       isStored: false,
  //       message: MISSING_FIELDS_REQUIRED
  //     })
  //   }

  //   const baseProducts = req.body.products as IProduct[]

  //   const baseProductsToUpdate = baseProducts.map((product) => {
  //     return {
  //       ...product
  //     }
  //   })

  //   const data = await productsService.updateMany(baseProducts)

  //   return res.status(200).json({
  //     status: 200,
  //     isUpdated: true,
  //     data
  //   })
  // }
}

export default packItemsController
