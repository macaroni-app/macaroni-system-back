import mongoose, { FilterQuery } from 'mongoose'
import Inventory from '../models/inventories'
import { InventoryType } from '../schemas/inventories'
import { INSUFFICIENT_INVENTORY, NOT_FOUND } from '../labels/labels'

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
    message: typeof NOT_FOUND | typeof INSUFFICIENT_INVENTORY
  }>
}

interface AtomicBulkInventoryUpdatedItemType {
  id: string
  asset?: string
  oldQuantityAvailable: number
  currentQuantityAvailable: number
  quantityAvailable: number
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
      const filter: {
        _id: string
        quantityAvailable?: { $gte: number }
        $expr?: {
          $gte: Array<number | { $subtract: Array<string | { $ifNull: [string, number] }> }>
        }
      } = { _id: id }

      if (quantityDelta < 0) {
        filter.$expr = {
          $gte: [
            {
              $subtract: [
                '$quantityAvailable',
                { $ifNull: ['$quantityReserved', 0] }
              ]
            },
            Math.abs(quantityDelta)
          ]
        }
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
    const session = await mongoose.startSession()
    let failure: { id: string, message: typeof NOT_FOUND | typeof INSUFFICIENT_INVENTORY } | null = null

    try {
      const updated: AtomicBulkInventoryUpdatedItemType[] = []

      await session.withTransaction(async () => {
        for (const inventoryToUpdate of inventoriesToUpdate) {
          const inventoryExists = await Inventory.findById(inventoryToUpdate.id).session(session)

          if (inventoryExists === null || inventoryExists === undefined) {
            failure = {
              id: inventoryToUpdate.id,
              message: NOT_FOUND
            }
            throw new Error('ATOMIC_BULK_UPDATE_FAILED')
          }

          const filter: {
            _id: string
            quantityAvailable?: { $gte: number }
            $expr?: {
              $gte: Array<number | { $subtract: Array<string | { $ifNull: [string, number] }> }>
            }
          } = {
            _id: inventoryToUpdate.id
          }

          if (inventoryToUpdate.quantityDelta < 0) {
            filter.$expr = {
              $gte: [
                {
                  $subtract: [
                    '$quantityAvailable',
                    { $ifNull: ['$quantityReserved', 0] }
                  ]
                },
                Math.abs(inventoryToUpdate.quantityDelta)
              ]
            }
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
            { new: false, session }
          )

          if (inventoryBeforeUpdate === null || inventoryBeforeUpdate === undefined) {
            failure = {
              id: inventoryToUpdate.id,
              message: INSUFFICIENT_INVENTORY
            }
            throw new Error('ATOMIC_BULK_UPDATE_FAILED')
          }

          const oldQuantityAvailable = Number(inventoryBeforeUpdate.quantityAvailable)
          const currentQuantityAvailable = oldQuantityAvailable + Number(inventoryToUpdate.quantityDelta)

          updated.push({
            id: inventoryBeforeUpdate.id,
            asset: inventoryToUpdate.asset,
            oldQuantityAvailable,
            currentQuantityAvailable,
            quantityAvailable: currentQuantityAvailable
          })
        }
      })

      if (failure !== null) {
        return {
          updated: [],
          failed: [failure]
        }
      }

      return {
        updated,
        failed: []
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'ATOMIC_BULK_UPDATE_FAILED') {
        return {
          updated: [],
          failed: failure !== null ? [failure] : []
        }
      }

      console.log(error)
      return {
        updated: [],
        failed: inventoriesToUpdate.map((inventoryToUpdate) => ({
          id: inventoryToUpdate.id,
          message: INSUFFICIENT_INVENTORY
        }))
      }
    } finally {
      await session.endSession()
    }
  }
}
