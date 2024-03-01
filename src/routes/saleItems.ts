import { RequestHandler, Router } from 'express'

import verifyToken from '../middlewares/validate-token'
import { schemaValidator } from '../middlewares/schemaValidator'
import saleItemsController from '../controllers/saleItems'
import { CreateSaleItemSchema, DeleteSaleItemParamsType, DeleteSaleItemSchema, GetSaleItemSchema, UpdateSaleItemBodyType, UpdateSaleItemParamsType, UpdateSaleItemSchema } from '../schemas/saleItems'

const saleItemsRouter = Router()

// GET - http://localhost:3000/api/v1/sales
saleItemsRouter.get('/', [verifyToken as RequestHandler, schemaValidator(GetSaleItemSchema)], saleItemsController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/sales/:id
saleItemsRouter.get('/:id', [verifyToken as RequestHandler, schemaValidator(GetSaleItemSchema)], saleItemsController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/sales
saleItemsRouter.post('/', [verifyToken as RequestHandler, schemaValidator(CreateSaleItemSchema)], saleItemsController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/sales/:id
saleItemsRouter.put('/:id', [verifyToken as RequestHandler, schemaValidator(UpdateSaleItemSchema)], saleItemsController.update as RequestHandler<UpdateSaleItemParamsType, {}, UpdateSaleItemBodyType, {}>)

// DELETE - http://localhost:3000/api/v1/sales/:id
saleItemsRouter.delete('/:id', [verifyToken as RequestHandler, schemaValidator(DeleteSaleItemSchema)], saleItemsController.delete as RequestHandler<DeleteSaleItemParamsType, {}, {}, {}>)

export default saleItemsRouter
