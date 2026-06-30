import { Request, Response } from 'express'
import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../labels/labels'
import { variantAttributeValueService } from '../services/variantAttributeValues'
import { ChangeIsActiveVariantAttributeValueBodyType, ChangeIsActiveVariantAttributeValueParamsType, CreateVariantAttributeValueBodyType, DeleteVariantAttributeValueParamsType, GetVariantAttributeValueQueryType, UpdateVariantAttributeValueBodyType, UpdateVariantAttributeValueParamsType, VariantAttributeValueType } from '../schemas/variantAttributeValues'

const variantAttributeValuesController = {
  getAll: async (req: Request<{}, {}, {}, GetVariantAttributeValueQueryType>, res: Response): Promise<Response> => {
    const { id, attribute } = req.query
    let filters: Record<string, unknown> = {}

    if (id !== null && id !== undefined) {
      filters = {
        $expr: {
          $and: [{ $eq: ['$_id', id] }]
        }
      }
    } else if (attribute !== undefined) {
      filters = { attribute }
    }

    const data: VariantAttributeValueType[] = await variantAttributeValueService.getAll(filters)

    return res.status(200).json({ status: 200, total: data.length, data })
  },
  getOne: async (req: Request<{ id: string }, {}, {}, {}>, res: Response): Promise<Response> => {
    const data = await variantAttributeValueService.getOne({ _id: req.params.id })
    if (data === null || data === undefined) {
      return res.status(404).json({ status: 404, message: NOT_FOUND })
    }
    return res.status(200).json({ status: 200, data })
  },
  store: async (req: Request<{}, {}, CreateVariantAttributeValueBodyType, {}>, res: Response): Promise<Response> => {
    if (
      (req.body.name === null || req.body.name === undefined) ||
      (req.body.attribute === null || req.body.attribute === undefined)
    ) {
      return res.status(400).json({ status: 400, isStored: false, message: MISSING_FIELDS_REQUIRED })
    }

    const recordToStore = { ...req.body, createdBy: req?.user?.id, updatedBy: req?.user?.id }
    const data = await variantAttributeValueService.store(recordToStore)

    return res.status(201).json({ status: 201, isStored: true, data })
  },
  update: async (req: Request<UpdateVariantAttributeValueParamsType, {}, UpdateVariantAttributeValueBodyType, {}>, res: Response): Promise<Response> => {
    if (
      (req.body.name === null || req.body.name === undefined) ||
      (req.body.attribute === null || req.body.attribute === undefined)
    ) {
      return res.status(400).json({ status: 400, isStored: false, message: MISSING_FIELDS_REQUIRED })
    }

    const oldRecord = await variantAttributeValueService.getOne({ _id: req.params.id })
    if (oldRecord === null || oldRecord === undefined) {
      return res.status(404).json({ status: 404, isUpdated: false, message: NOT_FOUND })
    }

    const newData = { ...oldRecord._doc, ...req.body }
    const data = await variantAttributeValueService.update(req.params.id, newData)

    return res.status(200).json({ status: 200, isUpdated: true, data })
  },
  delete: async (req: Request<DeleteVariantAttributeValueParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const data = await variantAttributeValueService.delete(req.params.id)

    if (data === null || data === undefined) {
      return res.status(404).json({ status: 404, isDeleted: false, message: NOT_FOUND })
    }

    return res.status(200).json({ status: 200, isDeleted: true, data })
  },
  changeIsActive: async (req: Request<ChangeIsActiveVariantAttributeValueParamsType, {}, ChangeIsActiveVariantAttributeValueBodyType, {}>, res: Response): Promise<Response> => {
    if (req.body.isActive === null || req.body.isActive === undefined) {
      return res.status(400).json({ status: 400, isStored: false, message: MISSING_FIELDS_REQUIRED })
    }

    const oldRecord = await variantAttributeValueService.getOne({ _id: req.params.id })
    if (oldRecord === null || oldRecord === undefined) {
      return res.status(404).json({ status: 404, isUpdated: false, message: NOT_FOUND })
    }

    const data = await variantAttributeValueService.updateIsActive(req.params.id, req.body.isActive)

    return res.status(200).json({ status: 200, isUpdated: true, data })
  }
}

export default variantAttributeValuesController
