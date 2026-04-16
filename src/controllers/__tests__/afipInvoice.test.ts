import { afterEach, describe, expect, it, vi } from 'vitest'

import { InvoiceService } from '../../afip/services/invoice'
import { ParametersService } from '../../afip/services/parameters'
import { NOT_FOUND } from '../../labels/labels'
import { afipInvoiceService } from '../../services/afipInvoice'
import afipInvoiceController from '../afipInvoice'

const buildResponse = () => {
  const response = {
    status: vi.fn(),
    json: vi.fn()
  }
  response.status.mockReturnValue(response)
  response.json.mockReturnValue(response)
  return response
}

const buildRequest = (overrides: Record<string, unknown> = {}): Record<string, any> => ({
  body: {},
  params: {},
  query: {},
  ...overrides
})

const validInvoiceBody = {
  pointOfSale: 1,
  invoiceType: 6,
  totalAmount: 100,
  concept: 1,
  documentType: '80',
  documentNumber: 20123456789,
  sale: 'sale-id',
  condicionIVAReceptorId: '5'
}

describe('afipInvoiceController', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects invoice generation when required fields are missing', async () => {
    const req = buildRequest({
      body: {
        pointOfSale: 1
      }
    })
    const res = buildResponse()

    await afipInvoiceController.generateInvoice(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      message: expect.stringContaining('Faltan los siguientes campos requeridos')
    })
  })

  it('rejects invoice generation when sale already has an invoice', async () => {
    const req = buildRequest({
      body: validInvoiceBody
    })
    const res = buildResponse()
    vi.spyOn(afipInvoiceService, 'getOne').mockResolvedValue({ id: 'invoice-id' } as never)

    await afipInvoiceController.generateInvoice(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      message: 'Ya existe una factura para esa venta.'
    })
  })

  it('returns server error when AFIP rejects the invoice request', async () => {
    const req = buildRequest({
      body: validInvoiceBody
    })
    const res = buildResponse()
    vi.spyOn(afipInvoiceService, 'getOne').mockResolvedValue(null as never)
    vi.spyOn(InvoiceService.prototype, 'createInvoice').mockResolvedValue({
      resultResponse: 'R'
    } as never)
    const store = vi.spyOn(afipInvoiceService, 'store')

    await afipInvoiceController.generateInvoice(req as never, res as never)

    expect(store).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error, la solicitud fue rechazada'
    })
  })

  it('returns server error when AFIP approval has no CAE', async () => {
    const req = buildRequest({
      body: validInvoiceBody
    })
    const res = buildResponse()
    vi.spyOn(afipInvoiceService, 'getOne').mockResolvedValue(null as never)
    vi.spyOn(InvoiceService.prototype, 'createInvoice').mockResolvedValue({
      resultResponse: 'A',
      cae: null
    } as never)
    const store = vi.spyOn(afipInvoiceService, 'store')

    await afipInvoiceController.generateInvoice(req as never, res as never)

    expect(store).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error al generar la factura: no se genero el CAE'
    })
  })

  it('stores and returns an approved invoice', async () => {
    const req = buildRequest({
      body: validInvoiceBody
    })
    const res = buildResponse()
    const invoiceDetails = {
      resultResponse: 'A',
      cae: 'cae-id',
      sale: 'sale-id'
    }
    vi.spyOn(afipInvoiceService, 'getOne').mockResolvedValue(null as never)
    vi.spyOn(InvoiceService.prototype, 'createInvoice').mockResolvedValue(invoiceDetails as never)
    vi.spyOn(afipInvoiceService, 'store').mockResolvedValue(invoiceDetails as never)

    await afipInvoiceController.generateInvoice(req as never, res as never)

    expect(afipInvoiceService.store).toHaveBeenCalledWith(invoiceDetails)
    expect(res.status).toHaveBeenCalledOnce()
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      status: 201,
      message: 'Factura generada con éxito',
      invoice_details: invoiceDetails
    })
  })

  it('returns not found when invoice by sale id does not exist', async () => {
    const req = buildRequest({
      query: {
        saleId: 'sale-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(afipInvoiceService, 'getOne').mockResolvedValue(null as never)

    await afipInvoiceController.getInvoiceBySaleId(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: NOT_FOUND
    })
  })

  it('returns invoice by sale id when it exists', async () => {
    const req = buildRequest({
      query: {
        saleId: 'sale-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(afipInvoiceService, 'getOne').mockResolvedValue({ id: 'invoice-id' } as never)

    await afipInvoiceController.getInvoiceBySaleId(req as never, res as never)

    expect(afipInvoiceService.getOne).toHaveBeenCalledWith({ sale: 'sale-id' })
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('returns IVA receptor conditions', async () => {
    const res = buildResponse()
    vi.spyOn(ParametersService.prototype, 'getIVACondicionReceptor').mockResolvedValue([{ id: 1 }] as never)

    await afipInvoiceController.getCondicionIvaReceptor({} as never, res as never)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      data: [{ id: 1 }]
    })
  })

  it('returns not found when document types are missing', async () => {
    const res = buildResponse()
    vi.spyOn(ParametersService.prototype, 'getDocumentTypes').mockResolvedValue(null as never)

    await afipInvoiceController.getDocumentTypes({} as never, res as never)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('returns document types when available', async () => {
    const res = buildResponse()
    vi.spyOn(ParametersService.prototype, 'getDocumentTypes').mockResolvedValue([{ id: 80 }] as never)

    await afipInvoiceController.getDocumentTypes({} as never, res as never)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      data: [{ id: 80 }]
    })
  })

  it('returns not found when point of sales are missing', async () => {
    const res = buildResponse()
    vi.spyOn(ParametersService.prototype, 'getPointOfSales').mockResolvedValue(null as never)

    await afipInvoiceController.getPointSales({} as never, res as never)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('returns point of sales when available', async () => {
    const res = buildResponse()
    vi.spyOn(ParametersService.prototype, 'getPointOfSales').mockResolvedValue([{ nro: 1 }] as never)

    await afipInvoiceController.getPointSales({} as never, res as never)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      data: [{ nro: 1 }]
    })
  })
})
