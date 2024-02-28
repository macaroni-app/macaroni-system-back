import { RequestHandler, Router } from 'express'

import salesController from '../controllers/sales'

import verifyToken from '../middlewares/validate-token'
import { schemaValidator } from '../middlewares/schemaValidator'
import { CreateSaleSchema, DeleteSaleParamsType, DeleteSaleSchema, GetSaleSchema, UpdateSaleBodyType, UpdateSaleParamsType, UpdateSaleSchema } from '../schemas/sales'

const salesRouter = Router()

// GET - http://localhost:3000/api/v1/sales
salesRouter.get('/', [verifyToken as RequestHandler, schemaValidator(GetSaleSchema)], salesController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/sales/:id
salesRouter.get('/:id', [verifyToken as RequestHandler, schemaValidator(GetSaleSchema)], salesController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/sales
salesRouter.post('/', [verifyToken as RequestHandler, schemaValidator(CreateSaleSchema)], salesController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/sales/:id
salesRouter.put('/:id', [verifyToken as RequestHandler, schemaValidator(UpdateSaleSchema)], salesController.update as RequestHandler<UpdateSaleParamsType, {}, UpdateSaleBodyType, {}>)

// DELETE - http://localhost:3000/api/v1/sales/:id
salesRouter.delete('/:id', [verifyToken as RequestHandler, schemaValidator(DeleteSaleSchema)], salesController.delete as RequestHandler<DeleteSaleParamsType, {}, {}, {}>)

export default salesRouter
