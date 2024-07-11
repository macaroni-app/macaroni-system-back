import { FilterQuery } from 'mongoose'

// Models
import Sale from '../models/sales'
import SaleItem from '../models/saleItems'
import FixedCost from '../models/fixedCosts'
import InventoryTransaction from '../models/inventoryTransactions'

// Types
import { SaleType } from '../schemas/sales'
import { SaleItemType } from '../schemas/saleItems'
import { FixedCostType } from '../schemas/fixedCosts'
import { InventoryTransactionType } from '../schemas/inventoryTransactions'

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
  },
  getAllFixedCosts: (options: FilterQuery<FixedCostType>) => {
    try {
      return FixedCost.find({ ...options }).sort({ sortingDate: -1 })
    } catch (error) {
      return error
    }
  },
  getAllInventoryTransactions: (options: FilterQuery<InventoryTransactionType>) => {
    try {
      return InventoryTransaction.find({ ...options }).populate('asset').populate('createdBy', ['firstName', 'lastName']).sort({ sortingDate: -1 })
    } catch (error) {
      return error
    }
  }
}
