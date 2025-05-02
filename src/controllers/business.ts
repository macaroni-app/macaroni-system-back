import { Request, Response } from 'express'
import { businessService } from '../services/business'
import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../labels/labels'
import { BusinessType, ChangeIsActiveBusinessBodyType, ChangeIsActiveBusinessParamsType, CreateBusinessBodyType, DeleteBusinessParamsType, GetBusinessParamsType, GetBusinessQueryType, UpdateBusinessBodyType, UpdateBusinessParamsType } from '../schemas/business'

const businessController = {
  getAll: async (req: Request<{}, {}, {}, GetBusinessQueryType>, res: Response): Promise<Response> => {
    const { id } = req.query

    const filters = {
      $expr: {
        $and: [{ $eq: ['$_id', id] }]
      }
    }

    const businesses: BusinessType[] = await businessService.getAll((id !== null && id !== undefined) ? filters : {})

    return res.status(200).json({
      status: 200,
      total: businesses.length,
      data: businesses
    })
  },
  getOne: async (req: Request<GetBusinessParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const business: BusinessType = await businessService.getOne({ _id: id })

    if (business === null || business === undefined) {
      return res.status(404).json({
        status: 404,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      data: business
    })
  },
  store: async (req: Request<{}, {}, CreateBusinessBodyType, {}>, res: Response): Promise<Response> => {
    if (req.body.name === null || req.body.name === undefined) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const businessToStore = { ...req.body }
    businessToStore.createdBy = req?.user?.id
    businessToStore.updatedBy = req?.user?.id

    const businessStored: BusinessType = await businessService.store(businessToStore)

    return res.status(201).json({
      status: 201,
      isStored: true,
      data: businessStored
    })
  },
  delete: async (req: Request<DeleteBusinessParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const businessDeleted = await businessService.delete(id)

    if (businessDeleted === null || businessDeleted === undefined) {
      return res.status(404).json({
        status: 404,
        isDeleted: false,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      isDeleted: true,
      data: businessDeleted
    })
  },
  update: async (req: Request<UpdateBusinessParamsType, {}, UpdateBusinessBodyType, {}>, res: Response): Promise<Response> => {
    if (req.body.name === null || req.body.name === undefined) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const { id } = req.params

    const oldBusiness = await businessService.getOne({ _id: id })

    if (oldBusiness === null || oldBusiness === undefined) {
      return res.status(404).json({
        status: 404,
        isUpdated: false,
        message: NOT_FOUND
      })
    }

    const newBusinessData = { ...oldBusiness._doc, ...req.body }

    const businessesUpdated = await businessService.update(id, newBusinessData)

    return res.status(200).json({
      status: 200,
      isUpdated: true,
      data: businessesUpdated
    })
  },
  changeIsActive: async (req: Request<ChangeIsActiveBusinessParamsType, {}, ChangeIsActiveBusinessBodyType, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    if (req.body.isActive === null || req.body.isActive === undefined) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const oldBusiness: BusinessType = await businessService.getOne({ _id: id })

    if (oldBusiness === null || oldBusiness === undefined) {
      return res.status(404).json({
        status: 404,
        isUpdated: false,
        message: NOT_FOUND
      })
    }

    if (oldBusiness.isActive === req.body.isActive) {
      const status = req.body.isActive ? '"Activo"' : '"Inactivo"'
      return res.status(404).json({
        status: 400,
        isUpdated: false,
        message: 'Ya se encuentra en el estado ' + status
      })
    }

    const businessUpdated = await businessService.updateIsActive(id, req.body.isActive)

    return res.status(200).json({
      status: 200,
      isUpdated: true,
      data: businessUpdated
    })
  }
}

export default businessController
