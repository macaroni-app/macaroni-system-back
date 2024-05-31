import { Request, Response } from 'express'
import { fixedCostService } from '../services/fixedCosts'
import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../labels/labels'
import { CreateFixedCostBodyType, DeleteFixedCostParamsType, FixedCostType, GetFixedCostParamsType, GetFixedCostQueryType, UpdateFixedCostBodyType, UpdateFixedCostParamsType } from '../schemas/fixedCosts'

const fixedCostController = {
  getAll: async (req: Request<{}, {}, {}, GetFixedCostQueryType>, res: Response): Promise<Response> => {
    const { id } = req.query

    const filters = {
      $expr: {
        $and: [{ $eq: ['$_id', id] }]
      }
    }

    const fixedCosts: FixedCostType[] = await fixedCostService.getAll((id !== null && id !== undefined) ? filters : {})

    return res.status(200).json({
      status: 200,
      total: fixedCosts.length,
      data: fixedCosts
    })
  },
  getOne: async (req: Request<GetFixedCostParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const fixedCost: FixedCostType = await fixedCostService.getOne({ _id: id })

    if (fixedCost === null || fixedCost === undefined) {
      return res.status(404).json({
        status: 404,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      data: fixedCost
    })
  },
  store: async (req: Request<{}, {}, CreateFixedCostBodyType, {}>, res: Response): Promise<Response> => {
    if (req.body.name === null || req.body.name === undefined) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const fixedCostToStore = { ...req.body }
    fixedCostToStore.createdBy = req?.user?.id
    fixedCostToStore.updatedBy = req?.user?.id

    const fixedCostStored: FixedCostType = await fixedCostService.store(fixedCostToStore)

    return res.status(201).json({
      status: 201,
      isStored: true,
      data: fixedCostStored
    })
  },
  delete: async (req: Request<DeleteFixedCostParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const fixedCostDeleted = await fixedCostService.delete(id)

    if (fixedCostDeleted === null || fixedCostDeleted === undefined) {
      return res.status(404).json({
        status: 404,
        isDeleted: false,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      isDeleted: true,
      data: fixedCostDeleted
    })
  },
  update: async (req: Request<UpdateFixedCostParamsType, {}, UpdateFixedCostBodyType, {}>, res: Response): Promise<Response> => {
    if (req.body.name === null || req.body.name === undefined) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const { id } = req.params

    const oldFixedCost = await fixedCostService.getOne({ _id: id })

    if (oldFixedCost === null || oldFixedCost === undefined) {
      return res.status(404).json({
        status: 404,
        isUpdated: false,
        message: NOT_FOUND
      })
    }

    const newFixedCostData = { ...oldFixedCost._doc, ...req.body }

    const fixedCostsUpdated = await fixedCostService.update(id, newFixedCostData)

    return res.status(200).json({
      status: 200,
      isUpdated: true,
      data: fixedCostsUpdated
    })
  }
}

export default fixedCostController
