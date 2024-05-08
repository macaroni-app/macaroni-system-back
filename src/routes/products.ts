import { RequestHandler, Router } from 'express'

import productsController from '../controllers/products'

import verifyToken from '../middlewares/validate-token'
import { schemaValidator } from '../middlewares/schemaValidator'
import { CreateProductSchema, DeleteProductSchema, DeleteProductParamsType, GetProductSchema, UpdateProductParamsType, UpdateProductBodyType, UpdateProductSchema } from '../schemas/products'

import verifyRole from '../middlewares/verifyRoles'
import { RoleCodes } from '../config/rolesCodes'

const productsRouter = Router()

// GET - http://localhost:3000/api/v1/products
productsRouter.get('/', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN, RoleCodes.SELLER), schemaValidator(GetProductSchema)], productsController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/products/:id
productsRouter.get('/:id', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN, RoleCodes.SELLER), schemaValidator(GetProductSchema)], productsController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/products
productsRouter.post('/', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN, RoleCodes.SELLER), schemaValidator(CreateProductSchema)], productsController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/products/:id
productsRouter.put('/:id', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN, RoleCodes.SELLER), schemaValidator(UpdateProductSchema)], productsController.update as RequestHandler<UpdateProductParamsType, {}, UpdateProductBodyType, {}>)

// DELETE - http://localhost:3000/api/v1/products/:id
productsRouter.delete('/:id', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN), schemaValidator(DeleteProductSchema)], productsController.delete as RequestHandler<DeleteProductParamsType, {}, {}, {}>)

export default productsRouter
