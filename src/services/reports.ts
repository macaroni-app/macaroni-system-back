import { FilterQuery } from 'mongoose'
// Models
import Sale from '../models/sales'
import SaleItem from '../models/saleItems'

// Types
import { SaleType } from '../schemas/sales'
import { SaleItemType } from '../schemas/saleItems'

export const reportService = {
  getAllSales: (options: FilterQuery<SaleType>) => {
    try {
      return Sale.find({ ...options })
        .populate('client')
        .populate('paymentMethod')
        .populate('createdBy', ['firstName', 'lastName'])
        .sort({ sortingDate: -1 })
    } catch (error) {
      return error
    }
  },
  getAllSaleItems: (options: FilterQuery<SaleItemType>) => {
    try {
      return SaleItem.find({ ...options }).populate({ path: 'product', populate: { path: 'productType', select: 'name' } }).populate('sale').sort({ createdAt: -1 })
    } catch (error) {
      return error
    }
  }
}
