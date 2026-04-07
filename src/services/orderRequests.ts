import { FilterQuery } from 'mongoose'
import OrderRequest from '../models/orderRequests'
import { OrderRequestType } from '../schemas/orderRequests'

export const orderRequestServices = {
  getAll: (options: FilterQuery<OrderRequestType>) => {
    try {
      return OrderRequest.find({ ...options })
        .populate('client')
        .populate('business')
        .populate('convertedSale')
        .populate('payments.paymentMethod')
        .populate('payments.createdBy', ['firstName', 'lastName'])
        .populate('createdBy', ['firstName', 'lastName'])
        .sort({ sortingDate: -1 })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<OrderRequestType>) => {
    try {
      return OrderRequest.findOne({ ...options })
        .populate('client')
        .populate('business')
        .populate('convertedSale')
        .populate('payments.paymentMethod')
        .populate('payments.createdBy', ['firstName', 'lastName'])
        .populate('createdBy', ['firstName', 'lastName'])
    } catch (error) {
      return error
    }
  },
  store: (newOrder: OrderRequestType) => {
    try {
      return OrderRequest.create(newOrder)
    } catch (error) {
      return error
    }
  },
  delete: (id: string) => {
    try {
      return OrderRequest.deleteOne({ _id: id })
    } catch (error) {
      return error
    }
  },
  update: async (id: string, newOrderData: OrderRequestType) => {
    try {
      const orderRequest = await OrderRequest.findOne({ _id: id }) as OrderRequestType
      orderRequest.client = newOrderData?.client
      orderRequest.business = newOrderData?.business
      orderRequest.isRetail = newOrderData?.isRetail
      orderRequest.orderCode = newOrderData?.orderCode
      orderRequest.total = newOrderData?.total
      orderRequest.discount = newOrderData?.discount
      orderRequest.payments = newOrderData?.payments
      orderRequest.paidAmount = newOrderData?.paidAmount
      orderRequest.pendingAmount = newOrderData?.pendingAmount
      orderRequest.paymentStatus = newOrderData?.paymentStatus
      orderRequest.status = newOrderData?.status
      orderRequest.convertedSale = newOrderData?.convertedSale
      orderRequest.reservedItems = newOrderData?.reservedItems
      orderRequest.updatedAt = newOrderData?.updatedAt
      orderRequest.updatedBy = newOrderData?.updatedBy
      orderRequest.confirmedAt = newOrderData?.confirmedAt
      orderRequest.cancelledAt = newOrderData?.cancelledAt
      orderRequest.convertedAt = newOrderData?.convertedAt

      return await OrderRequest.updateOne({ _id: id }, { $set: { ...orderRequest } })
    } catch (error) {
      return error
    }
  }
}
