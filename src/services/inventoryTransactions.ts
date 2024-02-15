import { FilterQuery } from 'mongoose'
import InventoryTransaction from '../models/inventoryTransactions'
import { InventoryTransactionType } from '../schemas/inventoryTransactions'

export const inventoryTransactionService = {
  getAll: (options: FilterQuery<InventoryTransactionType>) => {
    try {
      return InventoryTransaction.find({ ...options }).sort({ createdAt: -1 })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<InventoryTransactionType>) => {
    try {
      return InventoryTransaction.findOne({ ...options })
    } catch (error) {
      return error
    }
  },
  store: (newInventoryTransaction: InventoryTransactionType) => {
    try {
      return InventoryTransaction.create(newInventoryTransaction)
    } catch (error) {
      return error
    }
  },
  delete: (id: string) => {
    try {
      return InventoryTransaction.deleteOne({ _id: id })
    } catch (error) {
      return error
    }
  },
  update: async (id: string, newInventoryTransactionData: InventoryTransactionType) => {
    try {
      const inventory = await InventoryTransaction.findOne({ _id: id }) as InventoryTransactionType
      inventory.product = newInventoryTransactionData?.product
      inventory.transactionType = newInventoryTransactionData?.transactionType
      inventory.affectedAmount = newInventoryTransactionData?.affectedAmount

      return await InventoryTransaction.updateOne({ _id: id }, { $set: { ...inventory } })
    } catch (error) {
      return error
    }
  }
}
