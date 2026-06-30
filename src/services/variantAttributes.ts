import { FilterQuery } from 'mongoose'
import VariantAttribute from '../models/variantAttributes'
import { VariantAttributeType } from '../schemas/variantAttributes'

export const variantAttributeService = {
  getAll: (options: FilterQuery<VariantAttributeType>) => {
    try {
      return VariantAttribute.find({ ...options }).sort({ createdAt: -1 })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<VariantAttributeType>) => {
    try {
      return VariantAttribute.findOne({ ...options })
    } catch (error) {
      return error
    }
  },
  store: (newRecord: VariantAttributeType) => {
    try {
      return VariantAttribute.create(newRecord)
    } catch (error) {
      return error
    }
  },
  delete: (id: string) => {
    try {
      return VariantAttribute.deleteOne({ _id: id })
    } catch (error) {
      return error
    }
  },
  update: async (id: string, newData: VariantAttributeType) => {
    try {
      const record = await VariantAttribute.findOne({ _id: id }) as VariantAttributeType
      record.name = newData.name
      return await VariantAttribute.updateOne({ _id: id }, { $set: { ...record } })
    } catch (error) {
      return error
    }
  },
  updateIsActive: async (id: string, isActive: boolean) => {
    try {
      const record = await VariantAttribute.findOne({ _id: id }) as VariantAttributeType
      record.isActive = isActive
      return await VariantAttribute.updateOne({ _id: id }, { $set: { ...record } })
    } catch (error) {
      return error
    }
  }
}
