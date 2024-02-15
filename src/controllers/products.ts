import { Request, Response } from 'express'
import { productsService } from '../services/products'
import { IProduct } from '../models/products'
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

    const product: IProduct = await productsService.getOne({ _id: id })

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
      (req.body.costPrice === null || req.body.costPrice === undefined) ||
      (req.body.wholesalePrice === null || req.body.wholesalePrice === undefined) ||
      (req.body.retailsalePrice === null || req.body.retailsalePrice === undefined)
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
      (req.body.costPrice === null || req.body.costPrice === undefined) ||
      (req.body.wholesalePrice === null || req.body.wholesalePrice === undefined) ||
      (req.body.retailsalePrice === null || req.body.retailsalePrice === undefined)
    ) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const { id } = req.params

    const oldBaseProduct = await productsService.getOne({ _id: id })

    if (oldBaseProduct === null || oldBaseProduct === undefined) {
      return res.status(404).json({
        status: 404,
        isUpdated: false,
        message: NOT_FOUND
      })
    }

    const newProductData = { ...oldBaseProduct._doc, ...req.body }

    const productsUpdated = await productsService.update(id, newProductData)

    return res.status(200).json({
      status: 200,
      isUpdated: true,
      data: productsUpdated
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

  //   const products = req.body.products as IProduct[]

  //   // const baseProductsToUpdate = baseProducts.map((product) => {
  //   //   return {
  //   //     ...product
  //   //   }
  //   // })

  //   const data = await productsService.updateMany(products)

  //   return res.status(200).json({
  //     status: 200,
  //     isUpdated: true,
  //     data
  //   })
  // }
}

export default productsController
