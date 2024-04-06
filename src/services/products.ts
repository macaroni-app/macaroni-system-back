import { FilterQuery } from 'mongoose'
import Product from '../models/products'
import { ProductType } from '../schemas/products'

export const productsService = {
  getAll: (options: FilterQuery<ProductType>) => {
    try {
      return Product.find({ ...options }).sort({ createdAt: -1 })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<ProductType>) => {
    try {
      return Product.findOne({ ...options })
    } catch (error) {
      return error
    }
  },
  store: (newProduct: ProductType) => {
    try {
      return Product.create(newProduct)
    } catch (error) {
      return error
    }
  },
  delete: (id: string) => {
    try {
      return Product.deleteOne({ _id: id })
    } catch (error) {
      return error
    }
  },
  update: async (id: string, newProductData: ProductType) => {
    try {
      const product = await Product.findOne({ _id: id }) as ProductType
      product.name = newProductData?.name
      product.costPrice = newProductData?.costPrice
      product.wholesalePrice = newProductData.wholesalePrice
      product.retailsalePrice = newProductData.retailsalePrice
      product.category = newProductData.category
      product.productType = newProductData.productType

      return await Product.updateOne({ _id: id }, { $set: { ...product } })
    } catch (error) {
      return error
    }
  }
}
