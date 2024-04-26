import { FilterQuery } from 'mongoose'
import SaleItem from '../models/saleItems'
import { SaleItemType } from '../schemas/saleItems'

export const saleItemsService = {
  getAll: (options: FilterQuery<SaleItemType>) => {
    try {
      return SaleItem.find({ ...options }).populate('product').populate('sale').sort({ createdAt: -1 })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<SaleItemType>) => {
    try {
      return SaleItem.findOne({ ...options })
    } catch (error) {
      return error
    }
  },
  store: (newSaleItem: SaleItemType) => {
    try {
      return SaleItem.create(newSaleItem)
    } catch (error) {
      return error
    }
  },
  delete: (id: string) => {
    try {
      return SaleItem.deleteOne({ _id: id })
    } catch (error) {
      return error
    }
  },
  update: async (id: string, newSaleData: SaleItemType) => {
    try {
      const sale = await SaleItem.findOne({ _id: id }) as SaleItemType
      sale.sale = newSaleData?.sale
      sale.product = newSaleData?.product
      sale.quantity = newSaleData?.quantity
      sale.subtotal = newSaleData?.subtotal

      return await SaleItem.updateOne({ _id: id }, { $set: { ...sale } })
    } catch (error) {
      return error
    }
  },
  // updateMany: async (productItemsToUpdate: IProductItem[]) => {
  //   try {
  //     const newProductItemIds = productItemsToUpdate?.map(
  //       (productItemToUpdate) => productItemToUpdate.id
  //     )

  //     const productItems: IProductItem[] = await ProductItem.find({
  //       _id: { $in: newProductItemIds }
  //     })

  //     const productItemsUpdated: IProductItem[] = []

  //     productItems.map((productItem) => {
  //       return productItemsToUpdate.forEach((productItemToUpdate) => {
  //         if (productItem.id === productItemToUpdate.id) {
  //           productItem.quantity = productItemToUpdate.quantity
  //           productItem.asset = productItemToUpdate.asset
  //           productItem.product = productItemToUpdate.product
  //           productItemsUpdated.push(productItem)
  //         }
  //       })
  //     })

  //     let data
  //     if (productItems.length > 0) {
  //       data = await ProductItem.bulkSave(productItemsUpdated)
  //     }
  //     return data
  //   } catch (error) {
  //     console.log(error)
  //     return error
  //   }
  // },
  storeMany: async (newSaleItems: SaleItemType[]) => {
    const data = await SaleItem.insertMany(newSaleItems)
    return data
  },
  deleteMany: async (saleItemsIds: string[]) => {
    try {
      return await SaleItem.deleteMany({ _id: { $in: saleItemsIds } })
    } catch (error) {
      return error
    }
  }
}
