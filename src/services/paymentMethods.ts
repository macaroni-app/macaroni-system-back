import { FilterQuery } from 'mongoose'
import MethodPayment, { IMethodPayment } from '../models/paymentMethods'

export const methodPaymentService = {
  getAll: (options: FilterQuery<IMethodPayment>) => {
    try {
      return MethodPayment.find({ ...options }, ['name']).sort({
        createdAt: -1
      })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<IMethodPayment> | undefined) => {
    try {
      return MethodPayment.findOne({ ...options })
    } catch (error) {
      return error
    }
  },
  store: (newMethodPayment: IMethodPayment) => {
    try {
      return MethodPayment.create(newMethodPayment)
    } catch (error) {
      return error
    }
  },
  delete: (id: string) => {
    try {
      return MethodPayment.deleteOne({ _id: id })
    } catch (error) {
      return error
    }
  },
  update: async (id: string, newMethodPaymentData: IMethodPayment) => {
    try {
      const methodPayment = await MethodPayment.findOne({ _id: id }) as IMethodPayment
      methodPayment.name = newMethodPaymentData.name

      return await methodPayment.save()
    } catch (error) {
      return error
    }
  }
}
