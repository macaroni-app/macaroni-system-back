import { describe, expect, it } from 'vitest'

import { validateInvoiceData } from '../validateInvoiceData'

describe('validateInvoiceData', () => {
  it('returns no missing fields when invoice data is complete', () => {
    const missingFields = validateInvoiceData({
      totalAmount: 100,
      pointOfSale: 1,
      invoiceType: 6,
      concept: 1,
      documentNumber: 20123456789,
      documentType: '80',
      sale: 'sale-id',
      condicionIVAReceptorId: '5'
    })

    expect(missingFields).toEqual([])
  })

  it('returns all missing required fields', () => {
    const missingFields = validateInvoiceData({})

    expect(missingFields).toEqual([
      'totalAmount',
      'pointOfSale',
      'invoiceType',
      'concept',
      'documentNumber',
      'documentType',
      'sale',
      'condicionIVAReceptorId'
    ])
  })

  it('treats null values as missing fields', () => {
    const missingFields = validateInvoiceData({
      totalAmount: null as never,
      pointOfSale: 1,
      invoiceType: 6,
      concept: 1,
      documentNumber: 20123456789,
      documentType: '80',
      sale: 'sale-id',
      condicionIVAReceptorId: '5'
    })

    expect(missingFields).toEqual(['totalAmount'])
  })
})
