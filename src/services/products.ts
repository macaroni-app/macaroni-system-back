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
      product.wholesalePrice = newProductData?.wholesalePrice
      product.retailsalePrice = newProductData?.retailsalePrice

      return await Product.updateOne({ _id: id }, { $set: { ...product } })
    } catch (error) {
      return error
    }
  }
  // updateMany: async (productsToUpdate: IProduct[]) => {
  //   try {
  //     const productIds = productsToUpdate?.map((product) => product.id)

  //     const res = await Product.find({
  //       _id: { $in: productIds }
  //     })

  //     const products: IProduct[] = []
  //     res.forEach((productToUpdate) => {
  //       productsToUpdate.forEach((product) => {
  //         if (productToUpdate.id === product.id) {
  //           products.push(productToUpdate)
  //         }
  //       })
  //     })

  //     let data
  //     if (products.length > 0) {
  //       data = await Product.bulkSave(products)
  //     }
  //     return data
  //   } catch (error) {
  //     return error
  //   }
  // }
}
