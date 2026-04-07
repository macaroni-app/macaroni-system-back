import mongoose, { ClientSession } from 'mongoose'
import Asset, { IAsset } from '../models/assets'
import Inventory from '../models/inventories'
import InventoryTransaction, { TransactionReason, TransactionType } from '../models/inventoryTransactions'
import OrderRequest, { IOrderRequest, IOrderRequestPayment, OrderRequestPaymentStatus, OrderRequestStatus } from '../models/orderRequests'
import OrderRequestItem, { IOrderRequestItem } from '../models/orderRequestItems'
import Product, { IProduct } from '../models/products'
import ProductItem, { IProductItem } from '../models/productItems'
import Sale from '../models/sales'
import SaleItem from '../models/saleItems'
import { INSUFFICIENT_INVENTORY, INVALID_ORDER_REQUEST_STATUS, INVALID_PAYMENT_AMOUNT, MISSING_FIELDS_REQUIRED, NOT_FOUND, ORDER_REQUEST_ALREADY_CONVERTED, ORDER_REQUEST_HAS_NO_ITEMS, ORDER_REQUEST_HAS_PENDING_AMOUNT } from '../labels/labels'

interface ReservedInventoryItemType {
  inventory: string
  asset: string
  quantity: number
}

interface ConvertOrderRequestInputType {
  business?: string
  paymentMethod: string
  discount?: number
}

interface AddOrderRequestPaymentInputType {
  amount: number
  paymentMethod: string
  note?: string
}

interface InventoryConsumptionResultType {
  inventory: string
  asset: string
  quantity: number
  oldQuantityAvailable: number
  currentQuantityAvailable: number
}

const normalizeReservedItems = (reservedItems: Array<{ inventory: unknown, asset: unknown, quantity: unknown }> | undefined): ReservedInventoryItemType[] => {
  return (reservedItems ?? []).map((reservedItem) => ({
    inventory: String(reservedItem.inventory),
    asset: String(reservedItem.asset),
    quantity: Number(reservedItem.quantity)
  }))
}

const getOrderItems = async (orderRequestId: string, session: ClientSession): Promise<IOrderRequestItem[]> => {
  return await OrderRequestItem.find({ orderRequest: orderRequestId, isDeleted: false }).session(session)
}

const buildReservationBreakdown = async (orderItems: IOrderRequestItem[], session: ClientSession): Promise<ReservedInventoryItemType[]> => {
  if (orderItems.length === 0) {
    throw new Error(ORDER_REQUEST_HAS_NO_ITEMS)
  }

  const productIds = [...new Set(orderItems.map((item) => String(item.product)))]
  const productItems = await ProductItem.find({ product: { $in: productIds }, isDeleted: false }).session(session)

  const productItemsByProduct = new Map<string, IProductItem[]>()

  productItems.forEach((productItem) => {
    const productId = String(productItem.product)
    const currentProductItems = productItemsByProduct.get(productId) ?? []
    currentProductItems.push(productItem)
    productItemsByProduct.set(productId, currentProductItems)
  })

  const assetIds = [...new Set(productItems.map((productItem) => String(productItem.asset)))]
  const inventories = await Inventory.find({ asset: { $in: assetIds } }).session(session)
  const inventoryByAsset = new Map<string, { inventoryId: string, assetId: string }>()

  inventories.forEach((inventory) => {
    inventoryByAsset.set(String(inventory.asset), {
      inventoryId: String(inventory._id),
      assetId: String(inventory.asset)
    })
  })

  const reservedItemsMap = new Map<string, ReservedInventoryItemType>()

  orderItems.forEach((orderItem) => {
    const currentProductItems = productItemsByProduct.get(String(orderItem.product))

    if (currentProductItems === undefined || currentProductItems.length === 0) {
      throw new Error(NOT_FOUND)
    }

    currentProductItems.forEach((productItem) => {
      const inventoryEntry = inventoryByAsset.get(String(productItem.asset))

      if (inventoryEntry === undefined) {
        throw new Error(NOT_FOUND)
      }

      const quantityToReserve = Number(productItem.quantity) * Number(orderItem.quantity)
      const existingReservedItem = reservedItemsMap.get(inventoryEntry.inventoryId)

      if (existingReservedItem === undefined) {
        reservedItemsMap.set(inventoryEntry.inventoryId, {
          inventory: inventoryEntry.inventoryId,
          asset: inventoryEntry.assetId,
          quantity: quantityToReserve
        })
        return
      }

      existingReservedItem.quantity += quantityToReserve
      reservedItemsMap.set(inventoryEntry.inventoryId, existingReservedItem)
    })
  })

  return [...reservedItemsMap.values()]
}

const reserveInventories = async (reservedItems: ReservedInventoryItemType[], updatedBy: string, session: ClientSession): Promise<void> => {
  for (const reservedItem of reservedItems) {
    const inventoryUpdated = await Inventory.findOneAndUpdate(
      {
        _id: reservedItem.inventory,
        $expr: {
          $gte: [
            {
              $subtract: [
                '$quantityAvailable',
                { $ifNull: ['$quantityReserved', 0] }
              ]
            },
            reservedItem.quantity
          ]
        }
      },
      {
        $set: {
          updatedAt: new Date(),
          updatedBy
        },
        $inc: {
          quantityReserved: reservedItem.quantity
        }
      },
      {
        new: true,
        session
      }
    )

    if (inventoryUpdated === null) {
      throw new Error(INSUFFICIENT_INVENTORY)
    }
  }
}

const releaseInventories = async (reservedItems: ReservedInventoryItemType[], updatedBy: string, session: ClientSession): Promise<void> => {
  for (const reservedItem of reservedItems) {
    await Inventory.updateOne(
      { _id: reservedItem.inventory },
      {
        $set: {
          updatedAt: new Date(),
          updatedBy
        },
        $inc: {
          quantityReserved: -reservedItem.quantity
        }
      },
      { session }
    )
  }
}

const consumeReservedInventories = async (reservedItems: ReservedInventoryItemType[], updatedBy: string, session: ClientSession): Promise<InventoryConsumptionResultType[]> => {
  const results: InventoryConsumptionResultType[] = []

  for (const reservedItem of reservedItems) {
    const inventoryBeforeUpdate = await Inventory.findOneAndUpdate(
      {
        _id: reservedItem.inventory,
        quantityAvailable: { $gte: reservedItem.quantity },
        quantityReserved: { $gte: reservedItem.quantity }
      },
      {
        $set: {
          updatedAt: new Date(),
          updatedBy
        },
        $inc: {
          quantityAvailable: -reservedItem.quantity,
          quantityReserved: -reservedItem.quantity
        }
      },
      {
        new: false,
        session
      }
    )

    if (inventoryBeforeUpdate === null) {
      throw new Error(INSUFFICIENT_INVENTORY)
    }

    results.push({
      inventory: reservedItem.inventory,
      asset: reservedItem.asset,
      quantity: reservedItem.quantity,
      oldQuantityAvailable: Number(inventoryBeforeUpdate.quantityAvailable),
      currentQuantityAvailable: Number(inventoryBeforeUpdate.quantityAvailable) - reservedItem.quantity
    })
  }

  return results
}

const consumeInventoriesWithoutReservation = async (reservedItems: ReservedInventoryItemType[], updatedBy: string, session: ClientSession): Promise<InventoryConsumptionResultType[]> => {
  const results: InventoryConsumptionResultType[] = []

  for (const reservedItem of reservedItems) {
    const inventoryBeforeUpdate = await Inventory.findOneAndUpdate(
      {
        _id: reservedItem.inventory,
        quantityAvailable: { $gte: reservedItem.quantity }
      },
      {
        $set: {
          updatedAt: new Date(),
          updatedBy
        },
        $inc: {
          quantityAvailable: -reservedItem.quantity
        }
      },
      {
        new: false,
        session
      }
    )

    if (inventoryBeforeUpdate === null) {
      throw new Error(INSUFFICIENT_INVENTORY)
    }

    results.push({
      inventory: reservedItem.inventory,
      asset: reservedItem.asset,
      quantity: reservedItem.quantity,
      oldQuantityAvailable: Number(inventoryBeforeUpdate.quantityAvailable),
      currentQuantityAvailable: Number(inventoryBeforeUpdate.quantityAvailable) - reservedItem.quantity
    })
  }

  return results
}

const getOrderRequestOrFail = async (orderRequestId: string, session: ClientSession): Promise<IOrderRequest> => {
  const orderRequest = await OrderRequest.findById(orderRequestId).session(session)

  if (orderRequest === null) {
    throw new Error(NOT_FOUND)
  }

  return orderRequest
}

const normalizePayments = (payments: Array<{
  amount: number
  paymentMethod: string
  createdAt?: Date
  createdBy?: string
  note?: string
}> | undefined): IOrderRequestPayment[] => {
  return (payments ?? []).map((payment) => ({
    amount: Number(payment.amount),
    paymentMethod: String(payment.paymentMethod),
    createdAt: payment.createdAt ?? new Date(),
    createdBy: String(payment.createdBy),
    note: payment.note
  }))
}

const getPaymentSummary = (total: number, payments: IOrderRequestPayment[]) => {
  const paidAmount = payments.reduce((accumulator, payment) => accumulator + Number(payment.amount), 0)

  if (paidAmount > total) {
    throw new Error(INVALID_PAYMENT_AMOUNT)
  }

  const pendingAmount = Number((total - paidAmount).toFixed(2))

  if (pendingAmount < 0) {
    throw new Error(INVALID_PAYMENT_AMOUNT)
  }

  let paymentStatus = OrderRequestPaymentStatus.UNPAID

  if (paidAmount === 0) {
    paymentStatus = OrderRequestPaymentStatus.UNPAID
  } else if (pendingAmount === 0) {
    paymentStatus = OrderRequestPaymentStatus.PAID
  } else {
    paymentStatus = OrderRequestPaymentStatus.PARTIALLY_PAID
  }

  return {
    paidAmount,
    pendingAmount,
    paymentStatus
  }
}

export const orderRequestWorkflowService = {
  getPaymentSummary,
  syncReservation: async (orderRequestId: string, userId: string): Promise<IOrderRequest> => {
    const session = await mongoose.startSession()

    try {
      let updatedOrderRequest: IOrderRequest | null = null

      await session.withTransaction(async () => {
        const orderRequest = await getOrderRequestOrFail(orderRequestId, session)

        if (orderRequest.status !== OrderRequestStatus.CONFIRMED) {
          updatedOrderRequest = orderRequest
          return
        }

        const currentReservedItems = normalizeReservedItems(orderRequest.reservedItems as Array<{ inventory: unknown, asset: unknown, quantity: unknown }>)
        if (currentReservedItems.length > 0) {
          await releaseInventories(currentReservedItems, userId, session)
        }

        const orderItems = await getOrderItems(orderRequestId, session)
        const newReservedItems = await buildReservationBreakdown(orderItems, session)

        await reserveInventories(newReservedItems, userId, session)

        orderRequest.reservedItems = newReservedItems
        orderRequest.updatedAt = new Date()
        orderRequest.updatedBy = userId
        await orderRequest.save({ session })
        updatedOrderRequest = orderRequest
      })

      if (updatedOrderRequest === null) {
        throw new Error(NOT_FOUND)
      }

      return updatedOrderRequest
    } finally {
      await session.endSession()
    }
  },
  confirm: async (orderRequestId: string, userId: string): Promise<IOrderRequest> => {
    const session = await mongoose.startSession()

    try {
      let updatedOrderRequest: IOrderRequest | null = null

      await session.withTransaction(async () => {
        const orderRequest = await getOrderRequestOrFail(orderRequestId, session)

        if (orderRequest.status === OrderRequestStatus.CONVERTED) {
          throw new Error(ORDER_REQUEST_ALREADY_CONVERTED)
        }

        if (orderRequest.status === OrderRequestStatus.CANCELLED) {
          throw new Error(INVALID_ORDER_REQUEST_STATUS)
        }

        const currentReservedItems = normalizeReservedItems(orderRequest.reservedItems as Array<{ inventory: unknown, asset: unknown, quantity: unknown }>)
        if (currentReservedItems.length > 0) {
          await releaseInventories(currentReservedItems, userId, session)
        }

        const orderItems = await getOrderItems(orderRequestId, session)
        const newReservedItems = await buildReservationBreakdown(orderItems, session)

        await reserveInventories(newReservedItems, userId, session)

        orderRequest.status = OrderRequestStatus.CONFIRMED
        orderRequest.reservedItems = newReservedItems
        orderRequest.confirmedAt = new Date()
        orderRequest.updatedAt = new Date()
        orderRequest.updatedBy = userId
        await orderRequest.save({ session })
        updatedOrderRequest = orderRequest
      })

      if (updatedOrderRequest === null) {
        throw new Error(NOT_FOUND)
      }

      return updatedOrderRequest
    } finally {
      await session.endSession()
    }
  },
  cancel: async (orderRequestId: string, userId: string): Promise<IOrderRequest> => {
    const session = await mongoose.startSession()

    try {
      let updatedOrderRequest: IOrderRequest | null = null

      await session.withTransaction(async () => {
        const orderRequest = await getOrderRequestOrFail(orderRequestId, session)

        if (orderRequest.status === OrderRequestStatus.CONVERTED) {
          throw new Error(ORDER_REQUEST_ALREADY_CONVERTED)
        }

        const currentReservedItems = normalizeReservedItems(orderRequest.reservedItems as Array<{ inventory: unknown, asset: unknown, quantity: unknown }>)
        if (currentReservedItems.length > 0) {
          await releaseInventories(currentReservedItems, userId, session)
        }

        orderRequest.status = OrderRequestStatus.CANCELLED
        orderRequest.reservedItems = []
        orderRequest.cancelledAt = new Date()
        orderRequest.updatedAt = new Date()
        orderRequest.updatedBy = userId
        await orderRequest.save({ session })
        updatedOrderRequest = orderRequest
      })

      if (updatedOrderRequest === null) {
        throw new Error(NOT_FOUND)
      }

      return updatedOrderRequest
    } finally {
      await session.endSession()
    }
  },
  addPayment: async (orderRequestId: string, paymentInput: AddOrderRequestPaymentInputType, userId: string): Promise<IOrderRequest> => {
    const session = await mongoose.startSession()

    try {
      let updatedOrderRequest: IOrderRequest | null = null

      await session.withTransaction(async () => {
        const orderRequest = await getOrderRequestOrFail(orderRequestId, session)

        if ([OrderRequestStatus.CANCELLED, OrderRequestStatus.CONVERTED].includes(orderRequest.status)) {
          throw new Error(INVALID_ORDER_REQUEST_STATUS)
        }

        if (paymentInput.amount <= 0) {
          throw new Error(INVALID_PAYMENT_AMOUNT)
        }

        const currentPayments = normalizePayments(orderRequest.payments as Array<{
          amount: number
          paymentMethod: string
          createdAt?: Date
          createdBy?: string
          note?: string
        }>)

        const nextPayments: IOrderRequestPayment[] = [
          ...currentPayments,
          {
            amount: Number(paymentInput.amount),
            paymentMethod: paymentInput.paymentMethod,
            createdAt: new Date(),
            createdBy: userId,
            note: paymentInput.note
          }
        ]

        const paymentSummary = getPaymentSummary(Number(orderRequest.total), nextPayments)

        orderRequest.payments = nextPayments
        orderRequest.paidAmount = paymentSummary.paidAmount
        orderRequest.pendingAmount = paymentSummary.pendingAmount
        orderRequest.paymentStatus = paymentSummary.paymentStatus
        orderRequest.updatedAt = new Date()
        orderRequest.updatedBy = userId
        await orderRequest.save({ session })
        updatedOrderRequest = orderRequest
      })

      if (updatedOrderRequest === null) {
        throw new Error(NOT_FOUND)
      }

      return updatedOrderRequest
    } finally {
      await session.endSession()
    }
  },
  convertToSale: async (orderRequestId: string, convertInput: ConvertOrderRequestInputType, userId: string): Promise<IOrderRequest> => {
    const session = await mongoose.startSession()

    try {
      let updatedOrderRequest: IOrderRequest | null = null

      await session.withTransaction(async () => {
        const orderRequest = await getOrderRequestOrFail(orderRequestId, session)

        if (orderRequest.status === OrderRequestStatus.CONVERTED) {
          throw new Error(ORDER_REQUEST_ALREADY_CONVERTED)
        }

        if (orderRequest.status === OrderRequestStatus.CANCELLED) {
          throw new Error(INVALID_ORDER_REQUEST_STATUS)
        }

        if (Number(orderRequest.pendingAmount ?? 0) > 0) {
          throw new Error(ORDER_REQUEST_HAS_PENDING_AMOUNT)
        }

        const orderItems = await getOrderItems(orderRequestId, session)
        const business = convertInput.business ?? (orderRequest.business !== undefined ? String(orderRequest.business) : undefined)

        if (business === undefined) {
          throw new Error(MISSING_FIELDS_REQUIRED)
        }

        const productIds = [...new Set(orderItems.map((item) => String(item.product)))]
        const products = await Product.find({ _id: { $in: productIds } }).session(session)
        const productById = new Map<string, IProduct>()

        products.forEach((product) => {
          productById.set(String(product._id), product)
        })

        const reservedItems = orderRequest.status === OrderRequestStatus.CONFIRMED
          ? normalizeReservedItems(orderRequest.reservedItems as Array<{ inventory: unknown, asset: unknown, quantity: unknown }>)
          : await buildReservationBreakdown(orderItems, session)

        const inventoryConsumptionResults = orderRequest.status === OrderRequestStatus.CONFIRMED
          ? await consumeReservedInventories(reservedItems, userId, session)
          : await consumeInventoriesWithoutReservation(reservedItems, userId, session)

        const costTotal = orderItems.reduce((accumulator, orderItem) => {
          const product = productById.get(String(orderItem.product))

          if (product === undefined) {
            throw new Error(NOT_FOUND)
          }

          return accumulator + (Number(product.costPrice) * Number(orderItem.quantity))
        }, 0)

        const saleToStore = {
          isRetail: orderRequest.isRetail,
          client: String(orderRequest.client),
          orderRequest: orderRequest.id,
          business,
          paymentMethod: convertInput.paymentMethod,
          costTotal,
          total: Number(orderRequest.total),
          discount: convertInput.discount ?? Number(orderRequest.discount ?? 0),
          status: 'PAID',
          isBilled: false,
          createdBy: userId,
          updatedBy: userId
        }

        const [saleStored] = await Sale.create([saleToStore], { session })

        await SaleItem.insertMany(orderItems.map((orderItem) => ({
          sale: saleStored.id,
          product: orderItem.product,
          quantity: orderItem.quantity,
          subtotal: orderItem.subtotal,
          createdBy: userId,
          updatedBy: userId
        })), { session })

        const assetIds = [...new Set(reservedItems.map((reservedItem) => reservedItem.asset))]
        const assets = await Asset.find({ _id: { $in: assetIds } }).session(session)
        const assetById = new Map<string, IAsset>()

        assets.forEach((asset) => {
          assetById.set(String(asset._id), asset)
        })

        await InventoryTransaction.insertMany(inventoryConsumptionResults.map((inventoryConsumptionResult) => {
          const asset = assetById.get(inventoryConsumptionResult.asset)

          if (asset === undefined) {
            throw new Error(NOT_FOUND)
          }

          return {
            asset: inventoryConsumptionResult.asset,
            transactionType: TransactionType.DOWN,
            transactionReason: TransactionReason.SELL,
            affectedAmount: inventoryConsumptionResult.quantity,
            oldQuantityAvailable: inventoryConsumptionResult.oldQuantityAvailable,
            currentQuantityAvailable: inventoryConsumptionResult.currentQuantityAvailable,
            unitCost: Number(asset.costPrice),
            createdBy: userId,
            updatedBy: userId
          }
        }), { session })

        orderRequest.status = OrderRequestStatus.CONVERTED
        orderRequest.business = business
        orderRequest.convertedSale = saleStored.id
        orderRequest.reservedItems = []
        orderRequest.convertedAt = new Date()
        orderRequest.updatedAt = new Date()
        orderRequest.updatedBy = userId
        await orderRequest.save({ session })
        updatedOrderRequest = orderRequest
      })

      if (updatedOrderRequest === null) {
        throw new Error(NOT_FOUND)
      }

      return updatedOrderRequest
    } finally {
      await session.endSession()
    }
  }
}
