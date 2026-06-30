import { Request, Response } from 'express'
import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../labels/labels'
import { assetVariantService } from '../services/assetVariants'
import { AssetVariantType, ChangeIsActiveAssetVariantBodyType, ChangeIsActiveAssetVariantParamsType, CreateAssetVariantBodyType, DeleteAssetVariantParamsType, GetAssetVariantQueryType, UpdateAssetVariantBodyType, UpdateAssetVariantParamsType } from '../schemas/assetVariants'

const assetVariantsController = {
  getAll: async (req: Request<{}, {}, {}, GetAssetVariantQueryType>, res: Response): Promise<Response> => {
    const { id, baseAsset } = req.query
    let filters: Record<string, unknown> = {}

    if (id !== null && id !== undefined) {
      filters = {
        $expr: {
          $and: [{ $eq: ['$_id', id] }]
        }
      }
    } else if (baseAsset !== undefined) {
      filters = { baseAsset }
    }

    const data: AssetVariantType[] = await assetVariantService.getAll(filters)

    return res.status(200).json({ status: 200, total: data.length, data })
  },
  getOne: async (req: Request<{ id: string }, {}, {}, {}>, res: Response): Promise<Response> => {
    const data = await assetVariantService.getOne({ _id: req.params.id })
    if (data === null || data === undefined) {
      return res.status(404).json({ status: 404, message: NOT_FOUND })
    }
    return res.status(200).json({ status: 200, data })
  },
  store: async (req: Request<{}, {}, CreateAssetVariantBodyType, {}>, res: Response): Promise<Response> => {
    if (
      (req.body.name === null || req.body.name === undefined) ||
      (req.body.baseAsset === null || req.body.baseAsset === undefined)
    ) {
      return res.status(400).json({ status: 400, isStored: false, message: MISSING_FIELDS_REQUIRED })
    }

    const recordToStore = {
      ...req.body,
      values: req.body.values ?? [],
      createdBy: req?.user?.id,
      updatedBy: req?.user?.id
    }
    const data = await assetVariantService.store(recordToStore)

    return res.status(201).json({ status: 201, isStored: true, data })
  },
  update: async (req: Request<UpdateAssetVariantParamsType, {}, UpdateAssetVariantBodyType, {}>, res: Response): Promise<Response> => {
    if (
      (req.body.name === null || req.body.name === undefined) ||
      (req.body.baseAsset === null || req.body.baseAsset === undefined)
    ) {
      return res.status(400).json({ status: 400, isStored: false, message: MISSING_FIELDS_REQUIRED })
    }

    const oldRecord = await assetVariantService.getOne({ _id: req.params.id })
    if (oldRecord === null || oldRecord === undefined) {
      return res.status(404).json({ status: 404, isUpdated: false, message: NOT_FOUND })
    }

    const newData = { ...oldRecord._doc, ...req.body, values: req.body.values ?? [] }
    const data = await assetVariantService.update(req.params.id, newData)

    return res.status(200).json({ status: 200, isUpdated: true, data })
  },
  delete: async (req: Request<DeleteAssetVariantParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const data = await assetVariantService.delete(req.params.id)
    if (data === null || data === undefined) {
      return res.status(404).json({ status: 404, isDeleted: false, message: NOT_FOUND })
    }
    return res.status(200).json({ status: 200, isDeleted: true, data })
  },
  changeIsActive: async (req: Request<ChangeIsActiveAssetVariantParamsType, {}, ChangeIsActiveAssetVariantBodyType, {}>, res: Response): Promise<Response> => {
    if (req.body.isActive === null || req.body.isActive === undefined) {
      return res.status(400).json({ status: 400, isStored: false, message: MISSING_FIELDS_REQUIRED })
    }

    const oldRecord = await assetVariantService.getOne({ _id: req.params.id })
    if (oldRecord === null || oldRecord === undefined) {
      return res.status(404).json({ status: 404, isUpdated: false, message: NOT_FOUND })
    }

    const data = await assetVariantService.updateIsActive(req.params.id, req.body.isActive)

    return res.status(200).json({ status: 200, isUpdated: true, data })
  }
}

export default assetVariantsController
