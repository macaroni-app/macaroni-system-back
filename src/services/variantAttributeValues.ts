import { FilterQuery } from 'mongoose'
import VariantAttributeValue from '../models/variantAttributeValues'
import { VariantAttributeValueType } from '../schemas/variantAttributeValues'

export const variantAttributeValueService = {
  getAll: (options: FilterQuery<VariantAttributeValueType>) => {
    try {
      return VariantAttributeValue.find({ ...options }).populate('attribute').sort({ createdAt: -1 })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<VariantAttributeValueType>) => {
    try {
      return VariantAttributeValue.findOne({ ...options }).populate('attribute')
    } catch (error) {
      return error
    }
  },
  store: (newRecord: VariantAttributeValueType) => {
    try {
      return VariantAttributeValue.create(newRecord)
    } catch (error) {
      return error
    }
  },
  delete: (id: string) => {
    try {
      return VariantAttributeValue.deleteOne({ _id: id })
    } catch (error) {
      return error
    }
  },
  update: async (id: string, newData: VariantAttributeValueType) => {
    try {
      const record = await VariantAttributeValue.findOne({ _id: id }) as VariantAttributeValueType
      record.name = newData.name
      record.attribute = newData.attribute
      return await VariantAttributeValue.updateOne({ _id: id }, { $set: { ...record } })
    } catch (error) {
      return error
    }
  },
  updateIsActive: async (id: string, isActive: boolean) => {
    try {
      const record = await VariantAttributeValue.findOne({ _id: id }) as VariantAttributeValueType
      record.isActive = isActive
      return await VariantAttributeValue.updateOne({ _id: id }, { $set: { ...record } })
    } catch (error) {
      return error
    }
  }
}
