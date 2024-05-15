import { Request, Response } from 'express'
import { productTypeService } from '../services/productTypes'
import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../labels/labels'
import { ProductTypeType, CreateProductTypeBodyType, DeleteProductTypeParamsType, GetProductTypeParamsType, GetProductTypeQueryType, UpdateProductTypeBodyType, UpdateProductTypeParamsType } from '../schemas/productTypes'

const productTypeController = {
  getAll: async (req: Request<{}, {}, {}, GetProductTypeQueryType>, res: Response): Promise<Response> => {
    const { id } = req.query

    const filters = {
      $expr: {
        $and: [{ $eq: ['$_id', id] }]
      }
    }

    const productTypes: ProductTypeType[] = await productTypeService.getAll((id !== null && id !== undefined) ? filters : {})

    return res.status(200).json({
      status: 200,
      total: productTypes.length,
      data: productTypes
    })
  },
  getOne: async (req: Request<GetProductTypeParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const productType: ProductTypeType = await productTypeService.getOne({ _id: id })

    if (productType === null || productType === undefined) {
      return res.status(404).json({
        status: 404,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      data: productType
    })
  },
  store: async (req: Request<{}, {}, CreateProductTypeBodyType, {}>, res: Response): Promise<Response> => {
    if (req.body.name === null || req.body.name === undefined) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const productTypeToStore = { ...req.body }
    productTypeToStore.createdBy = req?.user?.id
    productTypeToStore.updatedBy = req?.user?.id

    const productTypeStored: ProductTypeType = await productTypeService.store(productTypeToStore)

    return res.status(201).json({
      status: 201,
      isStored: true,
      data: productTypeStored
    })
  },
  delete: async (req: Request<DeleteProductTypeParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const productTypeDeleted = await productTypeService.delete(id)

    if (productTypeDeleted === null || productTypeDeleted === undefined) {
      return res.status(404).json({
        status: 404,
        isDeleted: false,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      isDeleted: true,
      data: productTypeDeleted
    })
  },
  update: async (req: Request<UpdateProductTypeParamsType, {}, UpdateProductTypeBodyType, {}>, res: Response): Promise<Response> => {
    if (req.body.name === null || req.body.name === undefined) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const { id } = req.params

    const oldProductType = await productTypeService.getOne({ _id: id })

    if (oldProductType === null || oldProductType === undefined) {
      return res.status(404).json({
        status: 404,
        isUpdated: false,
        message: NOT_FOUND
      })
    }

    const newProductTypeData = { ...oldProductType._doc, ...req.body }

    const productTypesUpdated = await productTypeService.update(id, newProductTypeData)

    return res.status(200).json({
      status: 200,
      isUpdated: true,
      data: productTypesUpdated
    })
  }
}

export default productTypeController
