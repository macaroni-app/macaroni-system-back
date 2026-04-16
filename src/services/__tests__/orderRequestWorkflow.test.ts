import { describe, expect, it } from 'vitest'

import { INVALID_PAYMENT_AMOUNT } from '../../labels/labels'
import { OrderRequestPaymentStatus, IOrderRequestPayment } from '../../models/orderRequests'
import { orderRequestWorkflowService } from '../orderRequestWorkflow'

const buildPayment = (amount: number): IOrderRequestPayment => ({
  amount,
  paymentMethod: 'payment-method-id',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  createdBy: 'user-id'
})

describe('orderRequestWorkflowService.getPaymentSummary', () => {
  it('returns unpaid summary when there are no payments', () => {
    const summary = orderRequestWorkflowService.getPaymentSummary(100, [])

    expect(summary).toEqual({
      paidAmount: 0,
      pendingAmount: 100,
      paymentStatus: OrderRequestPaymentStatus.UNPAID
    })
  })

  it('returns partially paid summary when payment does not cover total', () => {
    const summary = orderRequestWorkflowService.getPaymentSummary(100, [
      buildPayment(40)
    ])

    expect(summary).toEqual({
      paidAmount: 40,
      pendingAmount: 60,
      paymentStatus: OrderRequestPaymentStatus.PARTIALLY_PAID
    })
  })

  it('returns paid summary when payment covers total', () => {
    const summary = orderRequestWorkflowService.getPaymentSummary(100, [
      buildPayment(100)
    ])

    expect(summary).toEqual({
      paidAmount: 100,
      pendingAmount: 0,
      paymentStatus: OrderRequestPaymentStatus.PAID
    })
  })

  it('returns paid summary when multiple payments cover total', () => {
    const summary = orderRequestWorkflowService.getPaymentSummary(100, [
      buildPayment(25),
      buildPayment(30),
      buildPayment(45)
    ])

    expect(summary).toEqual({
      paidAmount: 100,
      pendingAmount: 0,
      paymentStatus: OrderRequestPaymentStatus.PAID
    })
  })

  it('throws when payments exceed total', () => {
    expect(() => {
      orderRequestWorkflowService.getPaymentSummary(100, [buildPayment(101)])
    }).toThrow(INVALID_PAYMENT_AMOUNT)
  })

  it('handles decimal payments and pending amount', () => {
    const summary = orderRequestWorkflowService.getPaymentSummary(100.5, [
      buildPayment(40.25),
      buildPayment(10.25)
    ])

    expect(summary).toEqual({
      paidAmount: 50.5,
      pendingAmount: 50,
      paymentStatus: OrderRequestPaymentStatus.PARTIALLY_PAID
    })
  })
})
