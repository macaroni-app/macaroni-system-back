import { RequestHandler, Router } from 'express'

import productTypeController from '../controllers/productTypes'

import verifyToken from '../middlewares/validate-token'
import { schemaValidator } from '../middlewares/schemaValidator'
import { CreateProductTypeSchema, DeleteProductTypeSchema, GetProductTypeSchema, UpdateProductTypeSchema, UpdateProductTypeParamsType, UpdateProductTypeBodyType, DeleteProductTypeParamsType } from '../schemas/productTypes'

const productTypesRouter = Router()

// GET - http://localhost:3000/api/v1/productTypes
productTypesRouter.get('/', [verifyToken as RequestHandler, schemaValidator(GetProductTypeSchema)], productTypeController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/productTypes/:id
productTypesRouter.get('/:id', [verifyToken as RequestHandler, schemaValidator(GetProductTypeSchema)], productTypeController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/productTypes
productTypesRouter.post('/', [verifyToken as RequestHandler, schemaValidator(CreateProductTypeSchema)], productTypeController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/productTypes/:id
productTypesRouter.put('/:id', [verifyToken as RequestHandler, schemaValidator(UpdateProductTypeSchema)], productTypeController.update as RequestHandler<UpdateProductTypeParamsType, {}, UpdateProductTypeBodyType, {}>)

// DELETE - http://localhost:3000/api/v1/productTypes/:id
productTypesRouter.delete('/:id', [verifyToken as RequestHandler, schemaValidator(DeleteProductTypeSchema)], productTypeController.delete as RequestHandler<DeleteProductTypeParamsType, {}, {}, {}>)

export default productTypesRouter
