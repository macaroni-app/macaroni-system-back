import { FilterQuery } from 'mongoose'
import Inventory, { IInventory } from '../models/inventories'
import { InventoryType } from '../schemas/inventories'

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
  updateMany: async (inventoriesToUpdate: IInventory[]) => {
    try {
      const newInventoryIds = inventoriesToUpdate?.map(
        (inventoryToUpdate) => inventoryToUpdate.id
      )

      const inventories: IInventory[] = await Inventory.find({
        _id: { $in: newInventoryIds }
      })

      const inventoriesUpdated: IInventory[] = []

      inventories.map((inventory) => {
        return inventoriesToUpdate.forEach((inventoryToUpdate) => {
          if (inventory.id === inventoryToUpdate.id) {
            inventory.asset = inventoryToUpdate.asset
            inventory.quantityAvailable = inventoryToUpdate.quantityAvailable
            inventoriesUpdated.push(inventory)
          }
        })
      })

      let data
      if (inventories.length > 0) {
        data = await Inventory.bulkSave(inventoriesUpdated)
      }
      return data
    } catch (error) {
      console.log(error)
      return error
    }
  }
}
