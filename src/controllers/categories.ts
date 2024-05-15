import { Request, Response } from 'express'
import { categoryService } from '../services/categories'
import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../labels/labels'
import { CategoryType, CreateCategoryBodyType, DeleteCategoryParamsType, GetCategoryParamsType, GetCategoryQueryType, UpdateCategoryBodyType, UpdateCategoryParamsType } from '../schemas/categories'

const categoryController = {
  getAll: async (req: Request<{}, {}, {}, GetCategoryQueryType>, res: Response): Promise<Response> => {
    const { id } = req.query

    const filters = {
      $expr: {
        $and: [{ $eq: ['$_id', id] }]
      }
    }

    const categories: CategoryType[] = await categoryService.getAll((id !== null && id !== undefined) ? filters : {})

    return res.status(200).json({
      status: 200,
      total: categories.length,
      data: categories
    })
  },
  getOne: async (req: Request<GetCategoryParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const category: CategoryType = await categoryService.getOne({ _id: id })

    if (category === null || category === undefined) {
      return res.status(404).json({
        status: 404,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      data: category
    })
  },
  store: async (req: Request<{}, {}, CreateCategoryBodyType, {}>, res: Response): Promise<Response> => {
    if (req.body.name === null || req.body.name === undefined) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const categoryToStore = { ...req.body }
    categoryToStore.createdBy = req?.user?.id
    categoryToStore.updatedBy = req?.user?.id

    const categoryStored: CategoryType = await categoryService.store(categoryToStore)

    return res.status(201).json({
      status: 201,
      isStored: true,
      data: categoryStored
    })
  },
  delete: async (req: Request<DeleteCategoryParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const categoryDeleted = await categoryService.delete(id)

    if (categoryDeleted === null || categoryDeleted === undefined) {
      return res.status(404).json({
        status: 404,
        isDeleted: false,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      isDeleted: true,
      data: categoryDeleted
    })
  },
  update: async (req: Request<UpdateCategoryParamsType, {}, UpdateCategoryBodyType, {}>, res: Response): Promise<Response> => {
    if (req.body.name === null || req.body.name === undefined) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const { id } = req.params

    const oldCategory = await categoryService.getOne({ _id: id })

    if (oldCategory === null || oldCategory === undefined) {
      return res.status(404).json({
        status: 404,
        isUpdated: false,
        message: NOT_FOUND
      })
    }

    const newCategoryData = { ...oldCategory._doc, ...req.body }

    const categoriesUpdated = await categoryService.update(id, newCategoryData)

    return res.status(200).json({
      status: 200,
      isUpdated: true,
      data: categoriesUpdated
    })
  }
}

export default categoryController
