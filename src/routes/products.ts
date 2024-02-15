import { RequestHandler, Router } from 'express'

import productsController from '../controllers/products'

import verifyToken from '../middlewares/validate-token'
import { CreateProductSchema, UpdateProductParamsType, UpdateProductBodyType, UpdateProductSchema, DeleteProductSchema, DeleteProductParamsType, GetProductSchema } from '../schemas/products'
import { schemaValidator } from '../middlewares/schemaValidator'

const productsRouter = Router()

// GET - http://localhost:3000/api/v1/products
productsRouter.get('/', [verifyToken as RequestHandler, schemaValidator(GetProductSchema)], productsController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/products/:id
productsRouter.get('/:id', [verifyToken as RequestHandler, schemaValidator(GetProductSchema)], productsController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/products
productsRouter.post('/', [verifyToken as RequestHandler, schemaValidator(CreateProductSchema)], productsController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/products/:id
productsRouter.put('/:id', [verifyToken as RequestHandler, schemaValidator(UpdateProductSchema)], productsController.update as RequestHandler<UpdateProductParamsType, {}, UpdateProductBodyType, {}>)

// PUT - http://localhost:3000/api/v1/products
// productsRouter.put('/', verifyToken as RequestHandler, productsController.updateMany as RequestHandler)

// DELETE - http://localhost:3000/api/v1/products/:id
productsRouter.delete('/:id', [verifyToken as RequestHandler, schemaValidator(DeleteProductSchema)], productsController.delete as RequestHandler<DeleteProductParamsType, {}, {}, {}>)

export default productsRouter
