import { RequestHandler, Router } from 'express'

import afipInvoiceController from '../controllers/afipInvoice'

import verifyToken from '../middlewares/validate-token'

import { schemaValidator } from '../middlewares/schemaValidator'

import { CreateAfipInvoiceSchema, GetAfipInvoiceSchema } from '../schemas/afipInvoice'

import verifyRole from '../middlewares/verifyRoles'

import ProfileBase from '../permissions/ProfileBase'

const afipRouter = Router()

afipRouter.get('/conditions-iva-receptor', [verifyToken as RequestHandler, verifyRole(ProfileBase.afip.view)], afipInvoiceController.getCondicionIvaReceptor as RequestHandler)
afipRouter.get('/document-types', [verifyToken as RequestHandler, verifyRole(ProfileBase.afip.view)], afipInvoiceController.getDocumentTypes as RequestHandler)
afipRouter.get('/point-of-sales', [verifyToken as RequestHandler, verifyRole(ProfileBase.afip.view)], afipInvoiceController.getPointSales as RequestHandler)
afipRouter.get('/invoices', [verifyToken as RequestHandler, verifyRole(ProfileBase.afip.view), schemaValidator(GetAfipInvoiceSchema)], afipInvoiceController.getInvoiceBySaleId as RequestHandler)
afipRouter.post('/generate-invoice', [verifyToken as RequestHandler, verifyRole(ProfileBase.afip.create), schemaValidator(CreateAfipInvoiceSchema)], afipInvoiceController.generateInvoice as RequestHandler)

export default afipRouter
