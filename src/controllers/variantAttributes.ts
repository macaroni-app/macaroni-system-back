import { Request, Response } from 'express'
import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../labels/labels'
import { variantAttributeService } from '../services/variantAttributes'
import { ChangeIsActiveVariantAttributeBodyType, ChangeIsActiveVariantAttributeParamsType, CreateVariantAttributeBodyType, DeleteVariantAttributeParamsType, GetVariantAttributeQueryType, VariantAttributeType, UpdateVariantAttributeBodyType, UpdateVariantAttributeParamsType } from '../schemas/variantAttributes'

const variantAttributesController = {
  getAll: async (req: Request<{}, {}, {}, GetVariantAttributeQueryType>, res: Response): Promise<Response> => {
    const { id } = req.query

    const filters = {
      $expr: {
        $and: [{ $eq: ['$_id', id] }]
      }
    }

    const data: VariantAttributeType[] = await variantAttributeService.getAll((id !== null && id !== undefined) ? filters : {})

    return res.status(200).json({
      status: 200,
      total: data.length,
      data
    })
  },
  getOne: async (req: Request<{ id: string }, {}, {}, {}>, res: Response): Promise<Response> => {
    const data = await variantAttributeService.getOne({ _id: req.params.id })

    if (data === null || data === undefined) {
      return res.status(404).json({ status: 404, message: NOT_FOUND })
    }

    return res.status(200).json({ status: 200, data })
  },
  store: async (req: Request<{}, {}, CreateVariantAttributeBodyType, {}>, res: Response): Promise<Response> => {
    if (req.body.name === null || req.body.name === undefined) {
      return res.status(400).json({ status: 400, isStored: false, message: MISSING_FIELDS_REQUIRED })
    }

    const recordToStore = { ...req.body, createdBy: req?.user?.id, updatedBy: req?.user?.id }
    const data = await variantAttributeService.store(recordToStore)

    return res.status(201).json({ status: 201, isStored: true, data })
  },
  update: async (req: Request<UpdateVariantAttributeParamsType, {}, UpdateVariantAttributeBodyType, {}>, res: Response): Promise<Response> => {
    if (req.body.name === null || req.body.name === undefined) {
      return res.status(400).json({ status: 400, isStored: false, message: MISSING_FIELDS_REQUIRED })
    }

    const oldRecord = await variantAttributeService.getOne({ _id: req.params.id })

    if (oldRecord === null || oldRecord === undefined) {
      return res.status(404).json({ status: 404, isUpdated: false, message: NOT_FOUND })
    }

    const newData = { ...oldRecord._doc, ...req.body }
    const data = await variantAttributeService.update(req.params.id, newData)

    return res.status(200).json({ status: 200, isUpdated: true, data })
  },
  delete: async (req: Request<DeleteVariantAttributeParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const data = await variantAttributeService.delete(req.params.id)

    if (data === null || data === undefined) {
      return res.status(404).json({ status: 404, isDeleted: false, message: NOT_FOUND })
    }

    return res.status(200).json({ status: 200, isDeleted: true, data })
  },
  changeIsActive: async (req: Request<ChangeIsActiveVariantAttributeParamsType, {}, ChangeIsActiveVariantAttributeBodyType, {}>, res: Response): Promise<Response> => {
    if (req.body.isActive === null || req.body.isActive === undefined) {
      return res.status(400).json({ status: 400, isStored: false, message: MISSING_FIELDS_REQUIRED })
    }

    const oldRecord = await variantAttributeService.getOne({ _id: req.params.id })
    if (oldRecord === null || oldRecord === undefined) {
      return res.status(404).json({ status: 404, isUpdated: false, message: NOT_FOUND })
    }

    const data = await variantAttributeService.updateIsActive(req.params.id, req.body.isActive)

    return res.status(200).json({ status: 200, isUpdated: true, data })
  }
}

export default variantAttributesController
