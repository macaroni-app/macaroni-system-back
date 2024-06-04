import { FilterQuery } from 'mongoose'
import FixedCost from '../models/fixedCosts'
import { FixedCostType } from '../schemas/fixedCosts'

export const fixedCostService = {
  getAll: (options: FilterQuery<FixedCostType>) => {
    try {
      return FixedCost.find({ ...options }).sort({ sortingDate: -1 })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<FixedCostType> | undefined) => {
    try {
      return FixedCost.findOne({ ...options })
    } catch (error) {
      return error
    }
  },
  store: (newFixedCost: FixedCostType) => {
    try {
      return FixedCost.create(newFixedCost)
    } catch (error) {
      return error
    }
  },
  delete: (id: string) => {
    try {
      return FixedCost.deleteOne({ _id: id })
    } catch (error) {
      return error
    }
  },
  update: async (id: string, newFixedCostData: FixedCostType) => {
    try {
      const fixedCost = await FixedCost.findOne({ _id: id }) as FixedCostType
      fixedCost.name = newFixedCostData.name
      fixedCost.amount = newFixedCostData.amount

      return await FixedCost.updateOne({ _id: id }, { $set: { ...fixedCost } })
    } catch (error) {
      return error
    }
  },
  updateIsActive: async (id: string, isActive: boolean) => {
    try {
      const fixedCost = await FixedCost.findOne({ _id: id }) as FixedCostType
      fixedCost.isActive = isActive

      return await FixedCost.updateOne({ _id: id }, { $set: { ...fixedCost } })
    } catch (error) {
      return error
    }
  }
}
