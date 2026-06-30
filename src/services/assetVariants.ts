import { FilterQuery } from 'mongoose'
import AssetVariant from '../models/assetVariants'
import { AssetVariantType } from '../schemas/assetVariants'

export const assetVariantService = {
  getAll: (options: FilterQuery<AssetVariantType>) => {
    try {
      return AssetVariant.find({ ...options })
        .populate('baseAsset')
        .populate({
          path: 'values',
          populate: {
            path: 'attribute'
          }
        })
        .sort({ createdAt: -1 })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<AssetVariantType>) => {
    try {
      return AssetVariant.findOne({ ...options })
        .populate('baseAsset')
        .populate({
          path: 'values',
          populate: {
            path: 'attribute'
          }
        })
    } catch (error) {
      return error
    }
  },
  store: (newRecord: AssetVariantType) => {
    try {
      return AssetVariant.create(newRecord)
    } catch (error) {
      return error
    }
  },
  delete: (id: string) => {
    try {
      return AssetVariant.deleteOne({ _id: id })
    } catch (error) {
      return error
    }
  },
  update: async (id: string, newData: AssetVariantType) => {
    try {
      const record = await AssetVariant.findOne({ _id: id }) as AssetVariantType
      record.name = newData.name
      record.baseAsset = newData.baseAsset
      record.values = newData.values
      record.sku = newData.sku
      record.costPrice = newData.costPrice
      return await AssetVariant.updateOne({ _id: id }, { $set: { ...record } })
    } catch (error) {
      return error
    }
  },
  updateIsActive: async (id: string, isActive: boolean) => {
    try {
      const record = await AssetVariant.findOne({ _id: id }) as AssetVariantType
      record.isActive = isActive
      return await AssetVariant.updateOne({ _id: id }, { $set: { ...record } })
    } catch (error) {
      return error
    }
  }
}
