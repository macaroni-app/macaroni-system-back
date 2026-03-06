import { FilterQuery } from 'mongoose'
import Inventory from '../models/inventories'
import { InventoryType } from '../schemas/inventories'

interface AtomicInventoryUpdateType {
  asset?: string
  quantityDelta: number
  updatedBy?: string
}

interface AtomicBulkInventoryUpdateType {
  id: string
  asset?: string
  quantityDelta: number
  updatedBy?: string
}

interface AtomicBulkInventoryUpdateResultType {
  updated: AtomicBulkInventoryUpdatedItemType[]
  failed: Array<{
    id: string
    message: 'NOT_FOUND' | 'INSUFFICIENT_INVENTORY'
  }>
}

interface AtomicBulkInventoryUpdatedItemType {
  id: string
  asset?: string
  oldQuantityAvailable: number
  currentQuantityAvailable: number
  quantityAvailable: number
}

type AtomicBulkInventoryUpdateItemResultType =
| {
  status: 'UPDATED'
  data: AtomicBulkInventoryUpdatedItemType
}
| {
  status: 'FAILED'
  id: string
  message: 'NOT_FOUND' | 'INSUFFICIENT_INVENTORY'
}

export const inventoryService = {
  getAll: (options: FilterQuery<InventoryType>) => {
    try {
      return Inventory.find({ ...options }).populate('asset').sort({ createdAt: -1 })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<InventoryType> | undefined) => {
    try {
      return Inventory.findOne({ ...options })
    } catch (error) {
      return error
    }
  },
  store: (newInventory: InventoryType) => {
    try {
      return Inventory.create(newInventory)
    } catch (error) {
      return error
    }
  },
  delete: (id: string) => {
    try {
      return Inventory.deleteOne({ _id: id })
    } catch (error) {
      return error
    }
  },
  update: async (id: string, newInventoryData: InventoryType) => {
    try {
      const inventory = await Inventory.findOne({ _id: id }) as InventoryType
      inventory.asset = newInventoryData?.asset
      inventory.quantityAvailable = newInventoryData?.quantityAvailable

      // return await inventory.save()
      return await Inventory.updateOne({ _id: id }, { $set: { ...inventory } })
    } catch (error) {
      return error
    }
  },
  updateAtomic: async (id: string, newInventoryData: AtomicInventoryUpdateType) => {
    try {
      const { asset, quantityDelta, updatedBy } = newInventoryData
      const filter: { _id: string, quantityAvailable?: { $gte: number } } = { _id: id }

      if (quantityDelta < 0) {
        filter.quantityAvailable = { $gte: Math.abs(quantityDelta) }
      }

      const $set: { updatedAt: Date, updatedBy?: string, asset?: string } = {
        updatedAt: new Date()
      }

      if (asset !== undefined) {
        $set.asset = asset
      }

      if (updatedBy !== undefined) {
        $set.updatedBy = updatedBy
      }

      return await Inventory.findOneAndUpdate(
        filter,
        {
          $set,
          $inc: { quantityAvailable: quantityDelta }
        },
        { new: true }
      )
    } catch (error) {
      return error
    }
  },
  updateManyAtomic: async (inventoriesToUpdate: AtomicBulkInventoryUpdateType[]): Promise<AtomicBulkInventoryUpdateResultType> => {
    try {
      const inventoryIds = inventoriesToUpdate?.map((inventoryToUpdate) => inventoryToUpdate.id)

      const existingInventories = await Inventory.find({
        _id: { $in: inventoryIds }
      }).select('_id')

      const existingInventoryIds = new Set(existingInventories.map((inventory) => inventory._id.toString()))

      const results = await Promise.all<AtomicBulkInventoryUpdateItemResultType>(
        inventoriesToUpdate.map(async (inventoryToUpdate) => {
          if (!existingInventoryIds.has(inventoryToUpdate.id)) {
            return {
              status: 'FAILED' as const,
              id: inventoryToUpdate.id,
              message: 'NOT_FOUND' as const
            }
          }

          const filter: { _id: string, quantityAvailable?: { $gte: number } } = {
            _id: inventoryToUpdate.id
          }

          if (inventoryToUpdate.quantityDelta < 0) {
            filter.quantityAvailable = { $gte: Math.abs(inventoryToUpdate.quantityDelta) }
          }

          const $set: { updatedAt: Date, updatedBy?: string, asset?: string } = {
            updatedAt: new Date()
          }

          if (inventoryToUpdate.updatedBy !== undefined) {
            $set.updatedBy = inventoryToUpdate.updatedBy
          }

          if (inventoryToUpdate.asset !== undefined) {
            $set.asset = inventoryToUpdate.asset
          }

          const inventoryBeforeUpdate = await Inventory.findOneAndUpdate(
            filter,
            {
              $set,
              $inc: { quantityAvailable: inventoryToUpdate.quantityDelta }
            },
            { new: false }
          )

          if (inventoryBeforeUpdate === null || inventoryBeforeUpdate === undefined) {
            return {
              status: 'FAILED' as const,
              id: inventoryToUpdate.id,
              message: 'INSUFFICIENT_INVENTORY' as const
            }
          }

          const oldQuantityAvailable = Number(inventoryBeforeUpdate.quantityAvailable)
          const currentQuantityAvailable = oldQuantityAvailable + Number(inventoryToUpdate.quantityDelta)

          return {
            status: 'UPDATED' as const,
            data: {
              id: inventoryBeforeUpdate.id,
              asset: inventoryToUpdate.asset,
              oldQuantityAvailable,
              currentQuantityAvailable,
              quantityAvailable: currentQuantityAvailable
            }
          }
        })
      )

      return {
        updated: results
          .filter((result): result is Extract<AtomicBulkInventoryUpdateItemResultType, { status: 'UPDATED' }> => result.status === 'UPDATED')
          .map((result) => result.data),
        failed: results
          .filter((result): result is Extract<AtomicBulkInventoryUpdateItemResultType, { status: 'FAILED' }> => result.status === 'FAILED')
          .map((result) => ({
            id: result.id,
            message: result.message
          }))
      }
    } catch (error) {
      console.log(error)
      return {
        updated: [],
        failed: inventoriesToUpdate.map((inventoryToUpdate) => ({
          id: inventoryToUpdate.id,
          message: 'INSUFFICIENT_INVENTORY'
        }))
      }
    }
  }
}
