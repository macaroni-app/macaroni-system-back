import { Request, Response } from 'express'
import { productsService } from '../services/products'
import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../labels/labels'
import { CreateProductBodyType, DeleteProductParamsType, GetProductParamsType, GetProductQueryType, ProductType, UpdateProductBodyType, UpdateProductParamsType } from '../schemas/products'

const productsController = {
  getAll: async (req: Request<{}, {}, {}, GetProductQueryType>, res: Response): Promise<Response> => {
    const { id } = req.query

    const filters = {
      $expr: {
        $and: [{ $eq: ['$_id', id] }]
      }
    }

    const products: ProductType[] = await productsService.getAll((id !== null && id !== undefined) ? filters : {})

    return res.status(200).json({
      status: 200,
      total: products.length,
      data: products
    })
  },
  getOne: async (req: Request<GetProductParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const product: ProductType = await productsService.getOne({ _id: id })

    if (product === null || product === undefined) {
      return res.status(404).json({
        status: 404,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      data: product
    })
  },
  store: async (req: Request<{}, {}, CreateProductBodyType, {}>, res: Response): Promise<Response> => {
    if (
      (req.body.name === null || req.body.name === undefined) ||
      (req.body.costPrice === null || req.body.costPrice === undefined)
    ) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const productToStore = { ...req.body }
    productToStore.createdBy = req?.user?.id
    productToStore.updatedBy = req?.user?.id

    const productStored: ProductType = await productsService.store(productToStore)

    return res.status(201).json({
      status: 201,
      isStored: true,
      data: productStored
    })
  },
  delete: async (req: Request<DeleteProductParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const productDeleted = await productsService.delete(id)

    if (productDeleted === null || productDeleted === undefined) {
      return res.status(404).json({
        status: 404,
        isDeleted: false,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      isDeleted: true,
      data: productDeleted
    })
  },
  update: async (req: Request<UpdateProductParamsType, {}, UpdateProductBodyType, {}>, res: Response): Promise<Response> => {
    if (
      (req.body.name === null || req.body.name === undefined) ||
      (req.body.costPrice === null || req.body.costPrice === undefined)
    ) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const { id } = req.params

    const oldProduct = await productsService.getOne({ _id: id })

    if (oldProduct === null || oldProduct === undefined) {
      return res.status(404).json({
        status: 404,
        isUpdated: false,
        message: NOT_FOUND
      })
    }

    const newProductData = { ...oldProduct._doc, ...req.body }

    const productsUpdated = await productsService.update(id, newProductData)

    return res.status(200).json({
      status: 200,
      isUpdated: true,
      data: productsUpdated
    })
  }
}

export default productsController
