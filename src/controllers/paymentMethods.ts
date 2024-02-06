import { Response, Request } from 'express'
import { IMethodPayment } from '../models/paymentMethods'
import { RequestExt } from '../middlewares/validate-token'
import { methodPaymentService } from '../services/paymentMethods'
import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../labels/labels'

const methodPaymentController = {
  getAll: async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.query

    const filters = {
      $expr: {
        $and: [{ $eq: ['$_id', id] }]
      }
    }

    const methodPayments: IMethodPayment[] = await methodPaymentService.getAll((id !== null && id !== undefined) ? filters : {})

    return res.status(200).json({
      status: 200,
      total: methodPayments.length,
      data: methodPayments
    })
  },
  getOne: async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params

    const methodPayment = await methodPaymentService.getOne({ _id: id })

    if (methodPayment === null || methodPayment === undefined) {
      return res.status(404).json({
        status: 404,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      data: methodPayment
    })
  },
  store: async (req: RequestExt, res: Response): Promise<Response> => {
    if (req.body.name === null || req.body.name === undefined) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const methodPaymentToStore = { ...req.body }
    methodPaymentToStore.createdBy = req?.user?.id
    methodPaymentToStore.updatedBy = req?.user?.id

    const methodPaymentStored = await methodPaymentService.store(
      methodPaymentToStore
    )

    return res.status(201).json({
      status: 201,
      isStored: true,
      data: methodPaymentStored
    })
  },
  delete: async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params

    const methodPaymentDeleted = await methodPaymentService.delete(id)

    if (methodPaymentDeleted === null || methodPaymentDeleted === undefined) {
      return res.status(404).json({
        status: 404,
        isDeleted: false,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      isDeleted: true,
      data: methodPaymentDeleted
    })
  },
  update: async (req: Request, res: Response): Promise<Response> => {
    if (req.body.name === null || req.body.name === undefined) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const { id } = req.params

    const oldMethodPayment = await methodPaymentService.getOne({ _id: id })

    if (oldMethodPayment === null || oldMethodPayment === undefined) {
      return res.status(404).json({
        status: 404,
        isUpdated: false,
        message: NOT_FOUND
      })
    }

    const newMethodPaymentData = { ...oldMethodPayment._doc, ...req.body }

    const methodPaymentsUpdated = await methodPaymentService.update(
      id,
      newMethodPaymentData
    )

    return res.status(200).json({
      status: 200,
      isUpdated: true,
      data: methodPaymentsUpdated
    })
  }
}

export default methodPaymentController
