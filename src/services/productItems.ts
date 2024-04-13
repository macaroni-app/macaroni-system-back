import { FilterQuery } from 'mongoose'
import ProductItem, { IProductItem } from '../models/productItems'
import { ProductItemsType } from '../schemas/productItems'

export const productItemsService = {
  getAll: (options: FilterQuery<ProductItemsType>) => {
    try {
      return ProductItem.find({ ...options }).populate('product').populate('asset').sort({ createdAt: -1 })
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
  },
  updateMany: async (productItemsToUpdate: IProductItem[]) => {
    try {
      const newProductItemIds = productItemsToUpdate?.map(
        (productItemToUpdate) => productItemToUpdate.id
      )

      const productItems: IProductItem[] = await ProductItem.find({
        _id: { $in: newProductItemIds }
      })

      const productItemsUpdated: IProductItem[] = []

      productItems.map((productItem) => {
        return productItemsToUpdate.forEach((productItemToUpdate) => {
          if (productItem.id === productItemToUpdate.id) {
            productItem.quantity = productItemToUpdate.quantity
            productItem.asset = productItemToUpdate.asset
            productItem.product = productItemToUpdate.product
            productItemsUpdated.push(productItem)
          }
        })
      })

      let data
      if (productItems.length > 0) {
        data = await ProductItem.bulkSave(productItemsUpdated)
      }
      return data
    } catch (error) {
      console.log(error)
      return error
    }
  },
  storeMany: async (newProductItems: ProductItemsType[]) => {
    const data = await ProductItem.insertMany(newProductItems)
    return data
  },
  deleteMany: async (newProductItemsIds: string[]) => {
    try {
      return await ProductItem.deleteMany({ _id: { $in: newProductItemsIds } })
    } catch (error) {
      return error
    }
  }
}
