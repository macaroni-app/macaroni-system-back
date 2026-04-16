import mongoose from 'mongoose'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { INSUFFICIENT_INVENTORY, INVALID_ORDER_REQUEST_STATUS, MISSING_FIELDS_REQUIRED, NOT_FOUND, ORDER_REQUEST_ALREADY_CONVERTED, ORDER_REQUEST_HAS_PENDING_AMOUNT } from '../../labels/labels'
import Asset from '../../models/assets'
import Inventory from '../../models/inventories'
import InventoryTransaction, { TransactionReason, TransactionType } from '../../models/inventoryTransactions'
import OrderRequest, { OrderRequestPaymentStatus, OrderRequestStatus } from '../../models/orderRequests'
import OrderRequestItem from '../../models/orderRequestItems'
import Product from '../../models/products'
import ProductItem from '../../models/productItems'
import Sale from '../../models/sales'
import SaleItem from '../../models/saleItems'
import { orderRequestWorkflowService } from '../orderRequestWorkflow'

type ChainValue = Record<string, unknown> | Array<Record<string, unknown>> | null

const buildSession = () => ({
  withTransaction: vi.fn(async (callback: () => Promise<void>) => {
    await callback()
  }),
  endSession: vi.fn()
})

const mockSessionQuery = (value: ChainValue) => ({
  session: vi.fn().mockResolvedValue(value)
})

const buildOrderRequest = (overrides: Record<string, unknown> = {}): Record<string, any> => ({
  id: 'order-request-id',
  _id: 'order-request-id',
  isRetail: true,
  client: 'client-id',
  business: 'business-id',
  total: 500,
  discount: 25,
  paidAmount: 500,
  pendingAmount: 0,
  paymentStatus: OrderRequestPaymentStatus.PAID,
  status: OrderRequestStatus.CONFIRMED,
  reservedItems: [
    {
      inventory: 'inventory-id',
      asset: 'asset-id',
      quantity: 6
    }
  ],
  save: vi.fn().mockResolvedValue(undefined),
  ...overrides
})

const orderItems = [
  {
    product: 'product-id',
    quantity: 2,
    subtotal: 500
  }
]

const mockOrderRequest = (orderRequest: Record<string, unknown>) => {
  vi.spyOn(OrderRequest, 'findById').mockReturnValue(mockSessionQuery(orderRequest) as never)
}

const mockOrderItems = () => {
  vi.spyOn(OrderRequestItem, 'find').mockReturnValue(mockSessionQuery(orderItems) as never)
}

const mockProducts = () => {
  vi.spyOn(Product, 'find').mockReturnValue(mockSessionQuery([
    {
      _id: 'product-id',
      costPrice: 80
    }
  ]) as never)
}

const mockAssets = () => {
  vi.spyOn(Asset, 'find').mockReturnValue(mockSessionQuery([
    {
      _id: 'asset-id',
      costPrice: 10
    }
  ]) as never)
}

const mockDraftReservationSources = () => {
  vi.spyOn(ProductItem, 'find').mockReturnValue(mockSessionQuery([
    {
      product: 'product-id',
      asset: 'asset-id',
      quantity: 3
    }
  ]) as never)
  vi.spyOn(Inventory, 'find').mockReturnValue(mockSessionQuery([
    {
      _id: 'inventory-id',
      asset: 'asset-id'
    }
  ]) as never)
}

const mockSuccessfulWrites = () => {
  vi.spyOn(Sale, 'create').mockResolvedValue([{ id: 'sale-id' }] as never)
  vi.spyOn(SaleItem, 'insertMany').mockResolvedValue([] as never)
  vi.spyOn(InventoryTransaction, 'insertMany').mockResolvedValue([] as never)
}

describe('orderRequestWorkflowService.convertToSale', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects an already converted order request', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest({
      status: OrderRequestStatus.CONVERTED
    })
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequest(orderRequest)

    await expect(orderRequestWorkflowService.convertToSale(
      'order-request-id',
      { paymentMethod: 'payment-method-id' },
      'user-id'
    )).rejects.toThrow(ORDER_REQUEST_ALREADY_CONVERTED)

    expect(orderRequest.save).not.toHaveBeenCalled()
    expect(session.endSession).toHaveBeenCalledOnce()
  })

  it('rejects a cancelled order request', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest({
      status: OrderRequestStatus.CANCELLED
    })
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequest(orderRequest)

    await expect(orderRequestWorkflowService.convertToSale(
      'order-request-id',
      { paymentMethod: 'payment-method-id' },
      'user-id'
    )).rejects.toThrow(INVALID_ORDER_REQUEST_STATUS)

    expect(orderRequest.save).not.toHaveBeenCalled()
    expect(session.endSession).toHaveBeenCalledOnce()
  })

  it('rejects an order request with pending amount', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest({
      pendingAmount: 10
    })
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequest(orderRequest)

    await expect(orderRequestWorkflowService.convertToSale(
      'order-request-id',
      { paymentMethod: 'payment-method-id' },
      'user-id'
    )).rejects.toThrow(ORDER_REQUEST_HAS_PENDING_AMOUNT)

    expect(orderRequest.save).not.toHaveBeenCalled()
    expect(session.endSession).toHaveBeenCalledOnce()
  })

  it('rejects an order request without business in the order or convert input', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest({
      business: undefined
    })
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequest(orderRequest)
    mockOrderItems()

    await expect(orderRequestWorkflowService.convertToSale(
      'order-request-id',
      { paymentMethod: 'payment-method-id' },
      'user-id'
    )).rejects.toThrow(MISSING_FIELDS_REQUIRED)

    expect(orderRequest.save).not.toHaveBeenCalled()
    expect(session.endSession).toHaveBeenCalledOnce()
  })

  it('converts a confirmed paid order request consuming existing reservations', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest()
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequest(orderRequest)
    mockOrderItems()
    mockProducts()
    mockAssets()
    const consumeInventory = vi.spyOn(Inventory, 'findOneAndUpdate').mockResolvedValue({
      quantityAvailable: 20
    } as never)
    const saleCreate = vi.spyOn(Sale, 'create').mockResolvedValue([{ id: 'sale-id' }] as never)
    const saleItemInsertMany = vi.spyOn(SaleItem, 'insertMany').mockResolvedValue([] as never)
    const transactionInsertMany = vi.spyOn(InventoryTransaction, 'insertMany').mockResolvedValue([] as never)

    const result = await orderRequestWorkflowService.convertToSale(
      'order-request-id',
      { paymentMethod: 'payment-method-id', discount: 10 },
      'user-id'
    )

    expect(consumeInventory).toHaveBeenCalledWith(
      {
        _id: 'inventory-id',
        quantityAvailable: { $gte: 6 },
        quantityReserved: { $gte: 6 }
      },
      {
        $set: {
          updatedAt: expect.any(Date),
          updatedBy: 'user-id'
        },
        $inc: {
          quantityAvailable: -6,
          quantityReserved: -6
        }
      },
      {
        new: false,
        session
      }
    )
    expect(saleCreate).toHaveBeenCalledWith([
      {
        isRetail: true,
        client: 'client-id',
        orderRequest: 'order-request-id',
        business: 'business-id',
        paymentMethod: 'payment-method-id',
        costTotal: 160,
        total: 500,
        discount: 10,
        status: 'PAID',
        isBilled: false,
        createdBy: 'user-id',
        updatedBy: 'user-id'
      }
    ], { session })
    expect(saleItemInsertMany).toHaveBeenCalledWith([
      {
        sale: 'sale-id',
        product: 'product-id',
        quantity: 2,
        subtotal: 500,
        createdBy: 'user-id',
        updatedBy: 'user-id'
      }
    ], { session })
    expect(transactionInsertMany).toHaveBeenCalledWith([
      {
        asset: 'asset-id',
        transactionType: TransactionType.DOWN,
        transactionReason: TransactionReason.SELL,
        affectedAmount: 6,
        oldQuantityAvailable: 20,
        currentQuantityAvailable: 14,
        unitCost: 10,
        createdBy: 'user-id',
        updatedBy: 'user-id'
      }
    ], { session })
    expect(orderRequest.status).toBe(OrderRequestStatus.CONVERTED)
    expect(orderRequest.convertedSale).toBe('sale-id')
    expect(orderRequest.reservedItems).toEqual([])
    expect(orderRequest.convertedAt).toEqual(expect.any(Date))
    expect(orderRequest.updatedBy).toBe('user-id')
    expect(orderRequest.save).toHaveBeenCalledWith({ session })
    expect(session.endSession).toHaveBeenCalledOnce()
    expect(result).toBe(orderRequest)
  })

  it('converts a draft paid order request calculating inventory consumption without previous reservations', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest({
      status: OrderRequestStatus.DRAFT,
      reservedItems: [],
      business: undefined
    })
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequest(orderRequest)
    mockOrderItems()
    mockProducts()
    mockDraftReservationSources()
    mockAssets()
    mockSuccessfulWrites()
    const consumeInventory = vi.spyOn(Inventory, 'findOneAndUpdate').mockResolvedValue({
      quantityAvailable: 20
    } as never)

    await orderRequestWorkflowService.convertToSale(
      'order-request-id',
      { business: 'business-from-input-id', paymentMethod: 'payment-method-id' },
      'user-id'
    )

    expect(consumeInventory).toHaveBeenCalledWith(
      {
        _id: 'inventory-id',
        quantityAvailable: { $gte: 6 }
      },
      {
        $set: {
          updatedAt: expect.any(Date),
          updatedBy: 'user-id'
        },
        $inc: {
          quantityAvailable: -6
        }
      },
      {
        new: false,
        session
      }
    )
    expect(Sale.create).toHaveBeenCalledWith([
      expect.objectContaining({
        business: 'business-from-input-id',
        status: 'PAID'
      })
    ], { session })
    expect(orderRequest.status).toBe(OrderRequestStatus.CONVERTED)
    expect(orderRequest.business).toBe('business-from-input-id')
    expect(session.endSession).toHaveBeenCalledOnce()
  })

  it('does not create sale side effects when inventory consumption fails', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest()
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequest(orderRequest)
    mockOrderItems()
    mockProducts()
    vi.spyOn(Inventory, 'findOneAndUpdate').mockResolvedValue(null as never)
    const saleCreate = vi.spyOn(Sale, 'create')
    const saleItemInsertMany = vi.spyOn(SaleItem, 'insertMany')
    const transactionInsertMany = vi.spyOn(InventoryTransaction, 'insertMany')

    await expect(orderRequestWorkflowService.convertToSale(
      'order-request-id',
      { paymentMethod: 'payment-method-id' },
      'user-id'
    )).rejects.toThrow(INSUFFICIENT_INVENTORY)

    expect(saleCreate).not.toHaveBeenCalled()
    expect(saleItemInsertMany).not.toHaveBeenCalled()
    expect(transactionInsertMany).not.toHaveBeenCalled()
    expect(orderRequest.save).not.toHaveBeenCalled()
    expect(session.endSession).toHaveBeenCalledOnce()
  })

  it('does not create inventory transactions when an asset is missing', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest()
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequest(orderRequest)
    mockOrderItems()
    mockProducts()
    vi.spyOn(Inventory, 'findOneAndUpdate').mockResolvedValue({
      quantityAvailable: 20
    } as never)
    vi.spyOn(Sale, 'create').mockResolvedValue([{ id: 'sale-id' }] as never)
    vi.spyOn(SaleItem, 'insertMany').mockResolvedValue([] as never)
    vi.spyOn(Asset, 'find').mockReturnValue(mockSessionQuery([]) as never)
    const transactionInsertMany = vi.spyOn(InventoryTransaction, 'insertMany')

    await expect(orderRequestWorkflowService.convertToSale(
      'order-request-id',
      { paymentMethod: 'payment-method-id' },
      'user-id'
    )).rejects.toThrow(NOT_FOUND)

    expect(transactionInsertMany).not.toHaveBeenCalled()
    expect(orderRequest.save).not.toHaveBeenCalled()
    expect(session.endSession).toHaveBeenCalledOnce()
  })
})
