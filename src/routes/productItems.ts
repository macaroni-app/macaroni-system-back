import { RequestHandler, Router } from 'express'

import productItemsController from '../controllers/productItems'

import verifyToken from '../middlewares/validate-token'
import { schemaValidator } from '../middlewares/schemaValidator'
import { CreateProductItemsSchema, DeleteProductItemsParamsType, DeleteProductItemsSchema, GetProductItemsSchema, UpdateProductItemsBodyType, UpdateProductItemsParamsType, UpdateProductItemsSchema } from '../schemas/productItems'

const productItemsRouter = Router()

// GET - http://localhost:3000/api/v1/productItems
productItemsRouter.get('/', [verifyToken as RequestHandler, schemaValidator(GetProductItemsSchema)], productItemsController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/productItems/:id
productItemsRouter.get('/:id', [verifyToken as RequestHandler, schemaValidator(GetProductItemsSchema)], productItemsController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/productItems
productItemsRouter.post('/', [verifyToken as RequestHandler, schemaValidator(CreateProductItemsSchema)], productItemsController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/productItems/:id
productItemsRouter.put('/:id', [verifyToken as RequestHandler, schemaValidator(UpdateProductItemsSchema)], productItemsController.update as RequestHandler<UpdateProductItemsParamsType, {}, UpdateProductItemsBodyType, {}>)

// DELETE - http://localhost:3000/api/v1/productItems/:id
productItemsRouter.delete('/:id', [verifyToken as RequestHandler, schemaValidator(DeleteProductItemsSchema)], productItemsController.delete as RequestHandler<DeleteProductItemsParamsType, {}, {}, {}>)

export default productItemsRouter
