import { FilterQuery } from 'mongoose'
import { AfipInvoiceType } from '../schemas/afipInvoice'
import Invoice from '../models/invoice'

export const afipInvoiceService = {
  getOne: (options: FilterQuery<AfipInvoiceType>) => {
    try {
      return Invoice.findOne({ ...options })
    } catch (error) {
      return error
    }
  },
  store: (newAfipInvoice: AfipInvoiceType) => {
    try {
      return Invoice.create(newAfipInvoice)
    } catch (error) {
      return error
    }
  }
}
