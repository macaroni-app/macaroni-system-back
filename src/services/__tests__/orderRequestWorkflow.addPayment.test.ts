import mongoose from 'mongoose'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { INVALID_ORDER_REQUEST_STATUS, INVALID_PAYMENT_AMOUNT } from '../../labels/labels'
import OrderRequest, { OrderRequestPaymentStatus, OrderRequestStatus } from '../../models/orderRequests'
import { orderRequestWorkflowService } from '../orderRequestWorkflow'

const buildSession = () => ({
  withTransaction: vi.fn(async (callback: () => Promise<void>) => {
    await callback()
  }),
  endSession: vi.fn()
})

const buildOrderRequest = (overrides: Record<string, unknown> = {}): Record<string, any> => ({
  total: 100,
  payments: [],
  status: OrderRequestStatus.DRAFT,
  paidAmount: 0,
  pendingAmount: 100,
  paymentStatus: OrderRequestPaymentStatus.UNPAID,
  save: vi.fn().mockResolvedValue(undefined),
  ...overrides
})

const mockOrderRequestLookup = (orderRequest: Record<string, unknown>) => {
  const sessionMock = vi.fn().mockResolvedValue(orderRequest)
  vi.spyOn(OrderRequest, 'findById').mockReturnValue({
    session: sessionMock
  } as never)
  return sessionMock
}

describe('orderRequestWorkflowService.addPayment', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('adds a valid payment to a draft order request', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest()
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    const sessionMock = mockOrderRequestLookup(orderRequest)

    const result = await orderRequestWorkflowService.addPayment(
      'order-request-id',
      {
        amount: 40,
        paymentMethod: 'payment-method-id',
        note: 'Seña inicial'
      },
      'user-id'
    )

    expect(sessionMock).toHaveBeenCalledWith(session)
    expect(orderRequest.payments).toHaveLength(1)
    expect(orderRequest.payments[0]).toEqual(expect.objectContaining({
      amount: 40,
      paymentMethod: 'payment-method-id',
      createdBy: 'user-id',
      note: 'Seña inicial'
    }))
    expect(orderRequest.paidAmount).toBe(40)
    expect(orderRequest.pendingAmount).toBe(60)
    expect(orderRequest.paymentStatus).toBe(OrderRequestPaymentStatus.PARTIALLY_PAID)
    expect(orderRequest.updatedBy).toBe('user-id')
    expect(orderRequest.save).toHaveBeenCalledWith({ session })
    expect(session.endSession).toHaveBeenCalledOnce()
    expect(result).toBe(orderRequest)
  })

  it('adds a valid payment to a confirmed order request', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest({
      status: OrderRequestStatus.CONFIRMED,
      payments: [{
        amount: 25,
        paymentMethod: 'first-payment-method-id',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        createdBy: 'first-user-id'
      }]
    })
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequestLookup(orderRequest)

    await orderRequestWorkflowService.addPayment(
      'order-request-id',
      {
        amount: 75,
        paymentMethod: 'payment-method-id'
      },
      'user-id'
    )

    expect(orderRequest.payments).toHaveLength(2)
    expect(orderRequest.paidAmount).toBe(100)
    expect(orderRequest.pendingAmount).toBe(0)
    expect(orderRequest.paymentStatus).toBe(OrderRequestPaymentStatus.PAID)
    expect(orderRequest.save).toHaveBeenCalledWith({ session })
    expect(session.endSession).toHaveBeenCalledOnce()
  })

  it('rejects a zero payment amount', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest()
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequestLookup(orderRequest)

    await expect(orderRequestWorkflowService.addPayment(
      'order-request-id',
      {
        amount: 0,
        paymentMethod: 'payment-method-id'
      },
      'user-id'
    )).rejects.toThrow(INVALID_PAYMENT_AMOUNT)

    expect(orderRequest.save).not.toHaveBeenCalled()
    expect(session.endSession).toHaveBeenCalledOnce()
  })

  it('rejects a negative payment amount', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest()
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequestLookup(orderRequest)

    await expect(orderRequestWorkflowService.addPayment(
      'order-request-id',
      {
        amount: -1,
        paymentMethod: 'payment-method-id'
      },
      'user-id'
    )).rejects.toThrow(INVALID_PAYMENT_AMOUNT)

    expect(orderRequest.save).not.toHaveBeenCalled()
    expect(session.endSession).toHaveBeenCalledOnce()
  })

  it('rejects a payment that exceeds the order request total', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest()
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequestLookup(orderRequest)

    await expect(orderRequestWorkflowService.addPayment(
      'order-request-id',
      {
        amount: 101,
        paymentMethod: 'payment-method-id'
      },
      'user-id'
    )).rejects.toThrow(INVALID_PAYMENT_AMOUNT)

    expect(orderRequest.save).not.toHaveBeenCalled()
    expect(session.endSession).toHaveBeenCalledOnce()
  })

  it('rejects payments for a cancelled order request', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest({
      status: OrderRequestStatus.CANCELLED
    })
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequestLookup(orderRequest)

    await expect(orderRequestWorkflowService.addPayment(
      'order-request-id',
      {
        amount: 40,
        paymentMethod: 'payment-method-id'
      },
      'user-id'
    )).rejects.toThrow(INVALID_ORDER_REQUEST_STATUS)

    expect(orderRequest.save).not.toHaveBeenCalled()
    expect(session.endSession).toHaveBeenCalledOnce()
  })

  it('rejects payments for a converted order request', async () => {
    const session = buildSession()
    const orderRequest = buildOrderRequest({
      status: OrderRequestStatus.CONVERTED
    })
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    mockOrderRequestLookup(orderRequest)

    await expect(orderRequestWorkflowService.addPayment(
      'order-request-id',
      {
        amount: 40,
        paymentMethod: 'payment-method-id'
      },
      'user-id'
    )).rejects.toThrow(INVALID_ORDER_REQUEST_STATUS)

    expect(orderRequest.save).not.toHaveBeenCalled()
    expect(session.endSession).toHaveBeenCalledOnce()
  })
})
