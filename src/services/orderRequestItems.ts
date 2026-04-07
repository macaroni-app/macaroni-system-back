import { FilterQuery } from 'mongoose'
import OrderRequestItem from '../models/orderRequestItems'
import { OrderRequestItemType } from '../schemas/orderRequestItems'

export const orderRequestItemsService = {
  getAll: (options: FilterQuery<OrderRequestItemType>) => {
    try {
      return OrderRequestItem.find({ ...options })
        .populate({ path: 'product', populate: { path: 'productType', select: 'name' } })
        .populate('orderRequest')
        .sort({ createdAt: -1 })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<OrderRequestItemType>) => {
    try {
      return OrderRequestItem.findOne({ ...options })
        .populate({ path: 'product', populate: { path: 'productType', select: 'name' } })
        .populate('orderRequest')
    } catch (error) {
      return error
    }
  },
  store: (newOrderRequestItem: OrderRequestItemType) => {
    try {
      return OrderRequestItem.create(newOrderRequestItem)
    } catch (error) {
      return error
    }
  },
  delete: (id: string) => {
    try {
      return OrderRequestItem.deleteOne({ _id: id })
    } catch (error) {
      return error
    }
  },
  update: async (id: string, newOrderRequestItemData: OrderRequestItemType) => {
    try {
      const orderRequestItem = await OrderRequestItem.findOne({ _id: id }) as OrderRequestItemType
      orderRequestItem.orderRequest = newOrderRequestItemData?.orderRequest
      orderRequestItem.product = newOrderRequestItemData?.product
      orderRequestItem.quantity = newOrderRequestItemData?.quantity
      orderRequestItem.unitPrice = newOrderRequestItemData?.unitPrice
      orderRequestItem.subtotal = newOrderRequestItemData?.subtotal
      orderRequestItem.updatedAt = newOrderRequestItemData?.updatedAt
      orderRequestItem.updatedBy = newOrderRequestItemData?.updatedBy

      return await OrderRequestItem.updateOne({ _id: id }, { $set: { ...orderRequestItem } })
    } catch (error) {
      return error
    }
  },
  storeMany: async (newOrderRequestItems: OrderRequestItemType[]) => {
    return await OrderRequestItem.insertMany(newOrderRequestItems)
  },
  deleteMany: async (orderRequestItemsIds: string[]) => {
    try {
      return await OrderRequestItem.deleteMany({ _id: { $in: orderRequestItemsIds } })
    } catch (error) {
      return error
    }
  }
}
