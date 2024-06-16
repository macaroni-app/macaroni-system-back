import { RequestHandler, Router } from 'express'

import reportsController from '../controllers/reports'

// middlewares
import verifyToken from '../middlewares/validate-token'
import verifyRole from '../middlewares/verifyRoles'
import { schemaValidator } from '../middlewares/schemaValidator'

// schemas
import { GetSaleSchema } from '../schemas/sales'
import { GetSaleItemSchema } from '../schemas/saleItems'

import ProfileBase from '../permissions/ProfileBase'

const reportsRouter = Router()

// GET - http://localhost:3000/api/v1/reports/sales
reportsRouter.get('/sales', [verifyToken as RequestHandler, verifyRole(ProfileBase.sales.view), schemaValidator(GetSaleSchema)], reportsController.getAllSales as RequestHandler)
// GET - http://localhost:3000/api/v1/reports/saleItems
reportsRouter.get('/saleItems', [verifyToken as RequestHandler, verifyRole(ProfileBase.saleItems.view), schemaValidator(GetSaleItemSchema)], reportsController.getAllSaleItems as RequestHandler)

export default reportsRouter
