import { FilterQuery } from 'mongoose'
import MethodPayment from '../models/paymentMethods'
import { MethodPaymentsType } from '../schemas/methodPayments'

export const methodPaymentService = {
  getAll: (options: FilterQuery<MethodPaymentsType>) => {
    try {
      return MethodPayment.find({ ...options }).sort({
        createdAt: -1
      })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<MethodPaymentsType> | undefined) => {
    try {
      return MethodPayment.findOne({ ...options })
    } catch (error) {
      return error
    }
  },
  store: (newMethodPayment: MethodPaymentsType) => {
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
  update: async (id: string, newMethodPaymentData: MethodPaymentsType) => {
    try {
      const methodPayment = await MethodPayment.findOne({ _id: id }) as MethodPaymentsType
      methodPayment.name = newMethodPaymentData.name

      // return await methodPayment.save()
      return await MethodPayment.updateOne({ _id: id }, { $set: { ...methodPayment } })
    } catch (error) {
      return error
    }
  }
}
