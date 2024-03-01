import { FilterQuery } from 'mongoose'
import SaleItem from '../models/saleItems'
import { SaleItemType } from '../schemas/saleItems'

export const saleItemsService = {
  getAll: (options: FilterQuery<SaleItemType>) => {
    try {
      return SaleItem.find({ ...options }).sort({ createdAt: -1 })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<SaleItemType>) => {
    try {
      return SaleItem.findOne({ ...options })
    } catch (error) {
      return error
    }
  },
  store: (newSaleItem: SaleItemType) => {
    try {
      return SaleItem.create(newSaleItem)
    } catch (error) {
      return error
    }
  },
  delete: (id: string) => {
    try {
      return SaleItem.deleteOne({ _id: id })
    } catch (error) {
      return error
    }
  },
  update: async (id: string, newSaleData: SaleItemType) => {
    try {
      const sale = await SaleItem.findOne({ _id: id }) as SaleItemType
      sale.sale = newSaleData?.sale
      sale.pack = newSaleData?.pack
      sale.product = newSaleData?.product
      sale.quantity = newSaleData?.quantity
      sale.subtotal = newSaleData?.subtotal

      return await SaleItem.updateOne({ _id: id }, { $set: { ...sale } })
    } catch (error) {
      return error
    }
  }

}
