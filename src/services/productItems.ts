import { FilterQuery } from 'mongoose'
import ProductItem from '../models/productItems'
import { ProductItemsType } from '../schemas/productItems'

export const productItemsService = {
  getAll: (options: FilterQuery<ProductItemsType>) => {
    try {
      return ProductItem.find({ ...options }).sort({ createdAt: -1 })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<ProductItemsType> | undefined) => {
    try {
      return ProductItem.findOne({ ...options })
    } catch (error) {
      return error
    }
  },
  store: (newProductItem: ProductItemsType) => {
    try {
      return ProductItem.create(newProductItem)
    } catch (error) {
      return error
    }
  },
  delete: (id: string) => {
    try {
      return ProductItem.deleteOne({ _id: id })
    } catch (error) {
      return error
    }
  },
  update: async (id: string, newProductItemData: ProductItemsType) => {
    try {
      const productItem = await ProductItem.findOne({ _id: id }) as ProductItemsType
      productItem.product = newProductItemData?.product
      productItem.asset = newProductItemData?.asset
      productItem.quantity = newProductItemData?.quantity

      return await ProductItem.updateOne({ _id: id }, { $set: { ...productItem } })
    } catch (error) {
      return error
    }
  }
}
