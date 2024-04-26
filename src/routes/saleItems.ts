import { RequestHandler, Router } from 'express'

import verifyToken from '../middlewares/validate-token'
import { schemaValidator } from '../middlewares/schemaValidator'
import saleItemsController from '../controllers/saleItems'
import { CreateManySaleItemsSchema, CreateSaleItemSchema, DeleteManySaleItemsBodyType, DeleteManySaleItemsSchema, DeleteSaleItemParamsType, DeleteSaleItemSchema, GetSaleItemSchema } from '../schemas/saleItems'

const saleItemsRouter = Router()

// GET - http://localhost:3000/api/v1/saleItems
saleItemsRouter.get('/', [verifyToken as RequestHandler, schemaValidator(GetSaleItemSchema)], saleItemsController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/saleItems/:id
saleItemsRouter.get('/:id', [verifyToken as RequestHandler, schemaValidator(GetSaleItemSchema)], saleItemsController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/saleItems
saleItemsRouter.post('/', [verifyToken as RequestHandler, schemaValidator(CreateSaleItemSchema)], saleItemsController.store as RequestHandler)

// POST - http://localhost:3000/api/v1/saleItems
saleItemsRouter.post('/bulkCreate', [verifyToken as RequestHandler, schemaValidator(CreateManySaleItemsSchema)], saleItemsController.storeMany as RequestHandler)

// PUT - http://localhost:3000/api/v1/saleItems/:id
// saleItemsRouter.put('/:id', [verifyToken as RequestHandler, schemaValidator(UpdateSaleItemSchema)], saleItemsController.update as RequestHandler<UpdateSaleItemParamsType, {}, UpdateSaleItemBodyType, {}>)

// DELETE - http://localhost:3000/api/v1/saleItems/:id
saleItemsRouter.delete('/:id', [verifyToken as RequestHandler, schemaValidator(DeleteSaleItemSchema)], saleItemsController.delete as RequestHandler<DeleteSaleItemParamsType, {}, {}, {}>)

// DELETE - http://localhost:3000/api/v1/saleItems
saleItemsRouter.put('/bulkDelete', [verifyToken as RequestHandler, schemaValidator(DeleteManySaleItemsSchema)], saleItemsController.deleteMany as RequestHandler<{}, {}, DeleteManySaleItemsBodyType, {}>)

export default saleItemsRouter
