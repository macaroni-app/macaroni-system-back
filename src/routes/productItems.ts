import { RequestHandler, Router } from 'express'

import productItemsController from '../controllers/productItems'

import verifyToken from '../middlewares/validate-token'
import { schemaValidator } from '../middlewares/schemaValidator'
import { CreateManyProductItemsSchema, CreateProductItemsSchema, DeleteManyProductItemsBodyType, DeleteManyProductItemsSchema, DeleteProductItemsParamsType, DeleteProductItemsSchema, GetProductItemsSchema, UpdateManyProductItemsBodyType, UpdateManyProductItemsSchema } from '../schemas/productItems'

const productItemsRouter = Router()

// GET - http://localhost:3000/api/v1/productItems
productItemsRouter.get('/', [verifyToken as RequestHandler, schemaValidator(GetProductItemsSchema)], productItemsController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/productItems/:id
productItemsRouter.get('/:id', [verifyToken as RequestHandler, schemaValidator(GetProductItemsSchema)], productItemsController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/productItems
productItemsRouter.post('/', [verifyToken as RequestHandler, schemaValidator(CreateProductItemsSchema)], productItemsController.store as RequestHandler)

// POST - http://localhost:3000/api/v1/productItems
productItemsRouter.post('/bulkCreate', [verifyToken as RequestHandler, schemaValidator(CreateManyProductItemsSchema)], productItemsController.storeMany as RequestHandler)

// PUT - http://localhost:3000/api/v1/productItems/:id
// productItemsRouter.put('/:id', [verifyToken as RequestHandler, schemaValidator(UpdateProductItemsSchema)], productItemsController.update as RequestHandler<UpdateProductItemsParamsType, {}, UpdateProductItemsBodyType, {}>)

// PUT - http://localhost:3000/api/v1/productItems
productItemsRouter.put('/bulkUpdate', [verifyToken as RequestHandler, schemaValidator(UpdateManyProductItemsSchema)], productItemsController.updateMany as RequestHandler<{}, {}, UpdateManyProductItemsBodyType, {}>)

// DELETE - http://localhost:3000/api/v1/productItems/:id
productItemsRouter.delete('/:id', [verifyToken as RequestHandler, schemaValidator(DeleteProductItemsSchema)], productItemsController.delete as RequestHandler<DeleteProductItemsParamsType, {}, {}, {}>)

// DELETE - http://localhost:3000/api/v1/productItems
productItemsRouter.put('/bulkDelete', [verifyToken as RequestHandler, schemaValidator(DeleteManyProductItemsSchema)], productItemsController.deleteMany as RequestHandler<{}, {}, DeleteManyProductItemsBodyType, {}>)

export default productItemsRouter
