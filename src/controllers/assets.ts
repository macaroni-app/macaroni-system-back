import { Request, Response } from 'express'
import { assetService } from '../services/assets'
import { IAsset } from '../models/assets'
import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../labels/labels'
import { CreateAssetBodyType, DeleteAssetParamsType, GetAssetParamsType, GetAssetQueryType, AssetType, UpdateAssetBodyType, UpdateAssetParamsType, ChangeIsActiveAssetParamsType, ChangeIsActiveAssetBodyType } from '../schemas/assets'

const assetsController = {
  getAll: async (req: Request<{}, {}, {}, GetAssetQueryType>, res: Response): Promise<Response> => {
    const { id } = req.query

    const filters = {
      $expr: {
        $and: [{ $eq: ['$_id', id] }]
      }
    }

    const assets: AssetType[] = await assetService.getAll((id !== null && id !== undefined)
      ? filters
      : {
          $expr: {
            $and: [{ $eq: ['$isActive', true] }]
          }
        })

    return res.status(200).json({
      status: 200,
      total: assets.length,
      data: assets
    })
  },
  getOne: async (req: Request<GetAssetParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const asset: IAsset = await assetService.getOne({ _id: id })

    if (asset === null || asset === undefined) {
      return res.status(404).json({
        status: 404,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      data: asset
    })
  },
  store: async (req: Request<{}, {}, CreateAssetBodyType, {}>, res: Response): Promise<Response> => {
    if (
      (req.body.name === null || req.body.name === undefined) ||
      (req.body.category === null || req.body.category === undefined) ||
      (req.body.costPrice === null || req.body.costPrice === undefined)
    ) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const assetToStore = { ...req.body }
    assetToStore.createdBy = req?.user?.id
    assetToStore.updatedBy = req?.user?.id

    const assetStored: AssetType = await assetService.store(assetToStore)

    return res.status(201).json({
      status: 201,
      isStored: true,
      data: assetStored
    })
  },
  delete: async (req: Request<DeleteAssetParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const assetDeleted = await assetService.delete(id)

    if (assetDeleted === null || assetDeleted === undefined) {
      return res.status(404).json({
        status: 404,
        isDeleted: false,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      isDeleted: true,
      data: assetDeleted
    })
  },
  update: async (req: Request<UpdateAssetParamsType, {}, UpdateAssetBodyType, {}>, res: Response): Promise<Response> => {
    if (
      (req.body.name === null || req.body.name === undefined) ||
      (req.body.category === null || req.body.category === undefined) ||
      (req.body.costPrice === null || req.body.costPrice === undefined)
    ) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const { id } = req.params

    const oldBaseAsset = await assetService.getOne({ _id: id })

    if (oldBaseAsset === null || oldBaseAsset === undefined) {
      return res.status(404).json({
        status: 404,
        isUpdated: false,
        message: NOT_FOUND
      })
    }

    const newAssetData = { ...oldBaseAsset._doc, ...req.body }

    const assetsUpdated = await assetService.update(id, newAssetData)

    return res.status(200).json({
      status: 200,
      isUpdated: true,
      data: assetsUpdated
    })
  },
  changeIsActive: async (req: Request<ChangeIsActiveAssetParamsType, {}, ChangeIsActiveAssetBodyType, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    if (req.body.isActive === null || req.body.isActive === undefined) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const oldAsset: AssetType = await assetService.getOne({ _id: id })

    if (oldAsset === null || oldAsset === undefined) {
      return res.status(404).json({
        status: 404,
        isUpdated: false,
        message: NOT_FOUND
      })
    }

    if (oldAsset.isActive === req.body.isActive) {
      const status = req.body.isActive ? '"Activo"' : '"Inactivo"'
      return res.status(404).json({
        status: 400,
        isUpdated: false,
        message: 'Ya se encuentra en el estado ' + status
      })
    }

    const assetUpdated = await assetService.updateIsActive(id, req.body.isActive)

    return res.status(200).json({
      status: 200,
      isUpdated: true,
      data: assetUpdated
    })
  }
}

export default assetsController
