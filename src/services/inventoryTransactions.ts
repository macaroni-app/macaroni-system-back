import { FilterQuery } from 'mongoose'
import InventoryTransaction, { IInventoryTransaction } from '../models/inventoryTransactions'

export const inventoryTransactionService = {
  getAll: (options: FilterQuery<IInventoryTransaction>) => {
    try {
      return InventoryTransaction.find({ ...options }).sort({ createdAt: -1 })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<IInventoryTransaction> | undefined) => {
    try {
      return InventoryTransaction.findOne({ ...options })
    } catch (error) {
      return error
    }
  },
  store: (newInventoryTransaction: IInventoryTransaction) => {
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
  update: async (id: string, newInventoryTransactionData: IInventoryTransaction) => {
    try {
      const inventory = await InventoryTransaction.findOne({ _id: id }) as IInventoryTransaction
      inventory.product = newInventoryTransactionData?.product
      inventory.transactionType = newInventoryTransactionData?.transactionType
      inventory.affectedAmount = newInventoryTransactionData?.affectedAmount

      return await inventory.save()
    } catch (error) {
      return error
    }
  }
}
