import { FilterQuery } from 'mongoose'
import ProductType from '../models/productTypes'
import { ProductTypeType } from '../schemas/productTypes'

export const productTypeService = {
  getAll: (options: FilterQuery<ProductTypeType>) => {
    try {
      return ProductType.find({ ...options }).sort({ createdAt: -1 })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<ProductTypeType> | undefined) => {
    try {
      return ProductType.findOne({ ...options })
    } catch (error) {
      return error
    }
  },
  store: (newProductType: ProductTypeType) => {
    try {
      return ProductType.create(newProductType)
    } catch (error) {
      return error
    }
  },
  delete: (id: string) => {
    try {
      return ProductType.deleteOne({ _id: id })
    } catch (error) {
      return error
    }
  },
  update: async (id: string, newProductTypeData: ProductTypeType) => {
    try {
      const productType = await ProductType.findOne({ _id: id }) as ProductTypeType
      productType.name = newProductTypeData.name

      return await ProductType.updateOne({ _id: id }, { $set: { ...productType } })
    } catch (error) {
      return error
    }
  }
}
