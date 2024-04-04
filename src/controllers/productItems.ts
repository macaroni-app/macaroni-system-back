import { Request, Response } from 'express'
import { productItemsService } from '../services/productItems'
import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../labels/labels'
import { CreateProductItemsBodyType, DeleteProductItemsParamsType, GetProductItemsParamsType, GetProductItemsQueryType, ProductItemsType, UpdateProductItemsBodyType, UpdateProductItemsParamsType } from '../schemas/productItems'

const productItemsController = {
  getAll: async (req: Request<{}, {}, {}, GetProductItemsQueryType>, res: Response): Promise<Response> => {
    const { id } = req.query

    const filters = {
      $expr: {
        $and: [{ $eq: ['$_id', id] }]
      }
    }

    const productItems: ProductItemsType[] = await productItemsService.getAll((id !== null && id !== undefined) ? filters : {})

    return res.status(200).json({
      status: 200,
      total: productItems.length,
      data: productItems
    })
  },
  getOne: async (req: Request<GetProductItemsParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const productItem: ProductItemsType = await productItemsService.getOne({ _id: id })

    if (productItem === null || productItem === undefined) {
      return res.status(404).json({
        status: 404,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      data: productItem
    })
  },
  store: async (req: Request<{}, {}, CreateProductItemsBodyType, {}>, res: Response): Promise<Response> => {
    if (
      (req.body.product === null || req.body.product === undefined) ||
      (req.body.asset === null || req.body.asset === undefined) ||
      (req.body.quantity === null || req.body.quantity === undefined)
    ) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const productItemToStore = { ...req.body }
    productItemToStore.createdBy = req?.user?.id
    productItemToStore.updatedBy = req?.user?.id

    const productItemStored: ProductItemsType = await productItemsService.store(productItemToStore)

    return res.status(201).json({
      status: 201,
      isStored: true,
      data: productItemStored
    })
  },
  delete: async (req: Request<DeleteProductItemsParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const productItemDeleted = await productItemsService.delete(id)

    if (productItemDeleted === null || productItemDeleted === undefined) {
      return res.status(404).json({
        status: 404,
        isDeleted: false,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      isDeleted: true,
      data: productItemDeleted
    })
  },
  update: async (req: Request<UpdateProductItemsParamsType, {}, UpdateProductItemsBodyType, {}>, res: Response): Promise<Response> => {
    if (
      (req.body.product === null || req.body.product === undefined) ||
      (req.body.asset === null || req.body.asset === undefined) ||
      (req.body.quantity === null || req.body.quantity === undefined)
    ) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const { id } = req.params

    const oldProductItem = await productItemsService.getOne({ _id: id })

    if (oldProductItem === null || oldProductItem === undefined) {
      return res.status(404).json({
        status: 404,
        isUpdated: false,
        message: NOT_FOUND
      })
    }

    const newProductItemData = { ...oldProductItem._doc, ...req.body }

    const productItemUpdated = await productItemsService.update(id, newProductItemData)

    return res.status(200).json({
      status: 200,
      isUpdated: true,
      data: productItemUpdated
    })
  }
}

export default productItemsController
