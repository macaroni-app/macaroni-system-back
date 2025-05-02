import { Request, Response } from 'express'

// schemas
import { CreateAfipInvoiceBodyType, GetAfipInvoiceQueryType } from '../schemas/afipInvoice'

// services
import { InvoiceService } from '../afip/services/invoice'
import { afipInvoiceService } from '../services/afipInvoice'
import { ParametersService } from '../afip/services/parameters'

// utils
import { validateInvoiceData } from '../afip/utils/validateInvoiceData'
import { NOT_FOUND } from '../labels/labels'

const afipInvoiceController = {

  generateInvoice: async (req: Request<{}, {}, CreateAfipInvoiceBodyType, {}>, res: Response): Promise<Response> => {
    const missingFields = validateInvoiceData(req.body)

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: `Faltan los siguientes campos requeridos: ${missingFields.join(', ')}.`
      })
    }

    const { pointOfSale, invoiceType, totalAmount, concept, documentType, documentNumber, sale, condicionIVAReceptorId } = req.body

    const existingInvoice = await afipInvoiceService.getOne({ sale })

    if (existingInvoice != null) {
      return res.status(400).json({
        status: 400,
        message: 'Ya existe una factura para esa venta.'
      })
    }

    const invoiceService = new InvoiceService()
    const invoiceDetails = await invoiceService.createInvoice(
      {
        pointOfSale,
        invoiceType,
        totalAmount,
        concept,
        documentType,
        documentNumber,
        sale,
        condicionIVAReceptorId
      }
    )

    if (invoiceDetails.resultResponse !== 'A') {
      return res.status(500).json({
        message: 'Error, la solicitud fue rechazada'
      })
    }

    if (invoiceDetails.cae == null) {
      return res.status(500).json({
        message: 'Error al generar la factura: no se genero el CAE'
      })
    }

    // guardamos en base de datos la factura
    const invoiceToSave = { ...invoiceDetails }
    await afipInvoiceService.store(invoiceToSave)

    return res.status(200).json({
      status: 201,
      message: 'Factura generada con éxito',
      invoice_details: { ...invoiceDetails }
    })
  },

  getCondicionIvaReceptor: async (_req: Request<{}, {}, {}, {}>, res: Response): Promise<Response> => {
    const parametersService = new ParametersService()

    const conditionIvaReceptor = await parametersService.getIVACondicionReceptor()

    return res.status(200).json({
      status: 200,
      data: conditionIvaReceptor
    })
  },

  getInvoiceBySaleId: async (req: Request<{}, {}, {}, GetAfipInvoiceQueryType>, res: Response): Promise<Response> => {
    const { saleId } = req.query

    const invoice = await afipInvoiceService.getOne({ sale: saleId })

    if (invoice == null) {
      return res.status(404).json({
        status: 404,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      data: invoice
    })
  },

  getDocumentTypes: async (_req: Request<{}, {}, {}, {}>, res: Response): Promise<Response> => {
    const parametersService = new ParametersService()
    const documentTypes = await parametersService.getDocumentTypes()

    if (documentTypes == null) {
      res.status(404).json({
        status: 404,
        message: 'No hay datos de los tipos de documentos'
      })
    }

    return res.status(200).json({
      status: 200,
      data: documentTypes
    })
  },

  getPointSales: async (_req: Request<{}, {}, {}, {}>, res: Response): Promise<Response> => {
    const parametersService = new ParametersService()
    const pointOfSales = await parametersService.getPointOfSales()

    if (pointOfSales == null) {
      res.status(404).json({
        status: 404,
        message: 'No hay datos de los puntos de ventas'
      })
    }

    return res.status(200).json({
      status: 200,
      data: pointOfSales
    })
  }
}

export default afipInvoiceController
