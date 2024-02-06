import { Request, Response } from 'express'
import { RequestExt } from '../middlewares/validate-token'
import { packsService } from '../services/packs'
import { IPack } from '../models/packs'
import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../labels/labels'

const packsController = {
  getAll: async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.query

    const filters = {
      $expr: {
        $and: [{ $eq: ['$_id', id] }]
      }
    }

    const packs: IPack[] = await packsService.getAll((id !== null && id !== undefined) ? filters : {})

    return res.status(200).json({
      status: 200,
      total: packs.length,
      data: packs
    })
  },
  getOne: async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params

    const pack: IPack = await packsService.getOne({ _id: id })

    if (pack === null || pack === undefined) {
      return res.status(404).json({
        status: 404,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      data: pack
    })
  },
  store: async (req: RequestExt, res: Response): Promise<Response> => {
    if (
      (req.body.name === null || req.body.name === undefined) ||
      (req.body.costPrice === null || req.body.costPrice === undefined) ||
      (req.body.salePrice === null || req.body.salePrice === undefined)
    ) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const packToStore = { ...req.body }
    packToStore.createdBy = req?.user?.id
    packToStore.updatedBy = req?.user?.id

    const packStored: IPack = await packsService.store(packToStore)

    return res.status(201).json({
      status: 201,
      isStored: true,
      data: packStored
    })
  },
  delete: async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params

    const packDeleted = await packsService.delete(id)

    if (packDeleted === null || packDeleted === undefined) {
      return res.status(404).json({
        status: 404,
        isDeleted: false,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      isDeleted: true,
      data: packDeleted
    })
  },
  update: async (req: Request, res: Response): Promise<Response> => {
    if (
      (req.body.name === null || req.body.name === undefined) ||
      (req.body.costPrice === null || req.body.costPrice === undefined) ||
      (req.body.salePrice === null || req.body.salePrice === undefined)
      // (req.body.isBundle === null || req.body.isBundle === undefined) ||
      // (req.body.isRetail === null || req.body.isRetail === undefined)
    ) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const { id } = req.params

    const oldPack = await packsService.getOne({ _id: id })

    if (oldPack === null || oldPack === undefined) {
      return res.status(404).json({
        status: 404,
        isUpdated: false,
        message: NOT_FOUND
      })
    }

    const newPackData = { ...oldPack._doc, ...req.body }

    const packsUpdated = await packsService.update(id, newPackData)

    return res.status(200).json({
      status: 200,
      isUpdated: true,
      data: packsUpdated
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

  //   const baseProducts = req.body.products as IProduct[]

  //   const baseProductsToUpdate = baseProducts.map((product) => {
  //     return {
  //       ...product
  //     }
  //   })

  //   const data = await productsService.updateMany(baseProducts)

  //   return res.status(200).json({
  //     status: 200,
  //     isUpdated: true,
  //     data
  //   })
  // }
}

export default packsController
