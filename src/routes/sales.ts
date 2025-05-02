import { RequestHandler, Router } from 'express'

import salesController from '../controllers/sales'

import verifyToken from '../middlewares/validate-token'
import { schemaValidator } from '../middlewares/schemaValidator'
import { CreateSaleSchema, DeleteSaleParamsType, DeleteSaleSchema, GetSaleSchema, UpdateSaleBodyType, UpdateSaleQueryType, UpdateSaleSchema } from '../schemas/sales'

import verifyRole from '../middlewares/verifyRoles'

import ProfileBase from '../permissions/ProfileBase'

const salesRouter = Router()

// GET - http://localhost:3000/api/v1/sales
salesRouter.get('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.sales.view), schemaValidator(GetSaleSchema)], salesController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/sales/:id
salesRouter.get('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.sales.view), schemaValidator(GetSaleSchema)], salesController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/sales
salesRouter.post('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.sales.create), schemaValidator(CreateSaleSchema)], salesController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/sales/:id
salesRouter.put('/cancelledSale', [verifyToken as RequestHandler, verifyRole(ProfileBase.sales.edit), schemaValidator(UpdateSaleSchema)], salesController.update as RequestHandler<{}, {}, UpdateSaleBodyType, UpdateSaleQueryType>)

// PUT - http://localhost:3000/api/v1/sales/invoices/:id
salesRouter.put('/setBilledSale', [verifyToken as RequestHandler, verifyRole(ProfileBase.sales.edit), schemaValidator(UpdateSaleSchema)], salesController.setBilled as RequestHandler<{}, {}, UpdateSaleBodyType, UpdateSaleQueryType>)

// DELETE - http://localhost:3000/api/v1/sales/:id
salesRouter.delete('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.sales.delete), schemaValidator(DeleteSaleSchema)], salesController.delete as RequestHandler<DeleteSaleParamsType, {}, {}, {}>)

export default salesRouter
