import { FilterQuery } from 'mongoose'
import Sale from '../models/sales'
import { SaleType } from '../schemas/sales'

export const salesService = {
  getAll: (options: FilterQuery<SaleType>) => {
    try {
      return Sale.find({ ...options }).populate('client').populate('paymentMethod').sort({ sortingDate: -1 })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<SaleType>) => {
    try {
      return Sale.findOne({ ...options })
    } catch (error) {
      return error
    }
  },
  store: (newSale: SaleType) => {
    try {
      return Sale.create(newSale)
    } catch (error) {
      return error
    }
  },
  delete: (id: string) => {
    try {
      return Sale.deleteOne({ _id: id })
    } catch (error) {
      return error
    }
  },
  update: async (id: string, newSaleData: SaleType) => {
    try {
      const sale = await Sale.findOne({ _id: id }) as SaleType
      sale.client = newSaleData?.client
      sale.paymentMethod = newSaleData?.paymentMethod
      sale.isRetail = newSaleData?.isRetail
      sale.total = newSaleData?.total
      sale.status = newSaleData?.status

      return await Sale.updateOne({ _id: id }, { $set: { ...sale } })
    } catch (error) {
      return error
    }
  }

}
