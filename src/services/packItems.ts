import { FilterQuery } from 'mongoose'
import PackItem, { IPackItem } from '../models/packItems'

export const packItemsService = {
  getAll: (options: FilterQuery<IPackItem>) => {
    try {
      return PackItem.find({ ...options }).sort({ createdAt: -1 })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<IPackItem> | undefined) => {
    try {
      return PackItem.findOne({ ...options })
    } catch (error) {
      return error
    }
  },
  store: (newPackItem: IPackItem) => {
    try {
      return PackItem.create(newPackItem)
    } catch (error) {
      return error
    }
  },
  delete: (id: string) => {
    try {
      return PackItem.deleteOne({ _id: id })
    } catch (error) {
      return error
    }
  },
  update: async (id: string, newPackItemData: IPackItem) => {
    try {
      const packItem = await PackItem.findOne({ _id: id }) as IPackItem
      packItem.product = newPackItemData?.product
      packItem.pack = newPackItemData?.pack
      packItem.quantity = newPackItemData?.quantity

      return await packItem.save()
    } catch (error) {
      return error
    }
  }
  // updateMany: async (baseProductsToUpdate: IProductBaseProduct[]) => {
  //   try {
  //     const baseProductIds = baseProductsToUpdate?.map((baseProduct) => baseProduct.id)

  //     const res = await ProductoBaseProduct.find({
  //       _id: { $in: baseProductIds }
  //     })

  //     const baseProducts: IProductBaseProduct[] = []
  //     res.forEach((baseProductToUpdate) => {
  //       baseProductsToUpdate.forEach((baseProduct) => {
  //         if (baseProductToUpdate.id === baseProduct.id) {
  //           baseProducts.push(baseProductToUpdate)
  //         }
  //       })
  //     })

  //     let data
  //     if (baseProducts.length > 0) {
  //       data = await ProductoBaseProduct.bulkSave(baseProducts)
  //     }
  //     return data
  //   } catch (error) {
  //     return error
  //   }
  // }
}
