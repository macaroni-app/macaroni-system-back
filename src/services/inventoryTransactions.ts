import { FilterQuery } from 'mongoose'
import InventoryTransaction, { IInventoryTransaction } from '../models/inventoryTransactions'
import { InventoryTransactionType } from '../schemas/inventoryTransactions'

export const inventoryTransactionService = {
  getAll: (options: FilterQuery<InventoryTransactionType>) => {
    try {
      return InventoryTransaction.find({ ...options }).populate('asset').populate('createdBy', ['firstName', 'lastName']).sort({ sortingDate: -1 })
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
      inventory.asset = newInventoryTransactionData?.asset
      inventory.transactionType = newInventoryTransactionData?.transactionType
      inventory.transactionReason = newInventoryTransactionData?.transactionReason
      inventory.affectedAmount = newInventoryTransactionData?.affectedAmount
      inventory.oldQuantityAvailable = newInventoryTransactionData?.oldQuantityAvailable
      inventory.currentQuantityAvailable = newInventoryTransactionData?.currentQuantityAvailable
      inventory.unitCost = newInventoryTransactionData?.unitCost

      return await InventoryTransaction.updateOne({ _id: id }, { $set: { ...inventory } })
    } catch (error) {
      return error
    }
  },
  updateMany: async (inventoryTransactionsToUpdate: IInventoryTransaction[]) => {
    try {
      const newInventoryTransactionIds = inventoryTransactionsToUpdate?.map(
        (inventoryTransactionToUpdate) => inventoryTransactionToUpdate.id
      )

      const inventoryTransactions: IInventoryTransaction[] = await InventoryTransaction.find({
        _id: { $in: newInventoryTransactionIds }
      })

      const inventoryTransactionsUpdated: IInventoryTransaction[] = []

      inventoryTransactions.map((inventoryTransaction) => {
        return inventoryTransactionsToUpdate.forEach((inventoryTransactionToUpdate) => {
          if (inventoryTransaction.id === inventoryTransactionToUpdate.id) {
            inventoryTransaction.asset = inventoryTransactionToUpdate.asset
            inventoryTransaction.affectedAmount = inventoryTransactionToUpdate.affectedAmount
            inventoryTransaction.oldQuantityAvailable = inventoryTransactionToUpdate.oldQuantityAvailable
            inventoryTransaction.currentQuantityAvailable = inventoryTransactionToUpdate.currentQuantityAvailable
            inventoryTransaction.unitCost = inventoryTransactionToUpdate.unitCost
            inventoryTransaction.transactionType = inventoryTransactionToUpdate.transactionType
            inventoryTransaction.transactionReason = inventoryTransactionToUpdate.transactionReason
            inventoryTransactionsUpdated.push(inventoryTransaction)
          }
        })
      })

      let data
      if (inventoryTransactions.length > 0) {
        data = await InventoryTransaction.bulkSave(inventoryTransactionsUpdated)
      }
      return data
    } catch (error) {
      console.log(error)
      return error
    }
  },
  storeMany: async (newInventoryTransactions: InventoryTransactionType[]) => {
    const data = await InventoryTransaction.insertMany(newInventoryTransactions)
    return data
  }
}
