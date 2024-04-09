import { FilterQuery } from 'mongoose'
import Asset from '../models/assets'
import { AssetType } from '../schemas/assets'

export const assetService = {
  getAll: (options: FilterQuery<AssetType>) => {
    try {
      return Asset.find({ ...options }).populate('category').sort({ createdAt: -1 })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<AssetType>) => {
    try {
      return Asset.findOne({ ...options })
    } catch (error) {
      return error
    }
  },
  store: (newAsset: AssetType) => {
    try {
      return Asset.create(newAsset)
    } catch (error) {
      return error
    }
  },
  delete: (id: string) => {
    try {
      return Asset.deleteOne({ _id: id })
    } catch (error) {
      return error
    }
  },
  update: async (id: string, newAssetData: AssetType) => {
    try {
      const asset = await Asset.findOne({ _id: id }) as AssetType
      asset.name = newAssetData?.name
      asset.category = newAssetData?.category
      asset.costPrice = newAssetData?.costPrice

      return await Asset.updateOne({ _id: id }, { $set: { ...asset } })
    } catch (error) {
      return error
    }
  }
}
