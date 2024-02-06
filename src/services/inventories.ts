import { FilterQuery } from 'mongoose'
import Inventory, { IInventory } from '../models/inventories'

export const inventoryService = {
  getAll: (options: FilterQuery<IInventory>) => {
    try {
      return Inventory.find({ ...options }).sort({ createdAt: -1 })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<IInventory> | undefined) => {
    try {
      return Inventory.findOne({ ...options })
    } catch (error) {
      return error
    }
  },
  store: (newInventory: IInventory) => {
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
  update: async (id: string, newInventoryData: IInventory) => {
    try {
      const inventory = await Inventory.findOne({ _id: id }) as IInventory
      inventory.product = newInventoryData?.product
      inventory.quantityAvailable = newInventoryData?.quantityAvailable

      return await inventory.save()
    } catch (error) {
      return error
    }
  }
}
