import { RequestHandler, Router } from 'express'

import productsController from '../controllers/products'

import verifyToken from '../middlewares/validate-token'

import { schemaValidator } from '../middlewares/schemaValidator'

import { CreateProductSchema, DeleteProductSchema, DeleteProductParamsType, GetProductSchema, UpdateProductParamsType, UpdateProductBodyType, UpdateProductSchema, ChangeIsActiveProductSchema, ChangeIsActiveProductParamsType, ChangeIsActiveProductBodyType } from '../schemas/products'

import verifyRole from '../middlewares/verifyRoles'

import ProfileBase from '../permissions/ProfileBase'

const productsRouter = Router()

// GET - http://localhost:3000/api/v1/products
productsRouter.get('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.products.view), schemaValidator(GetProductSchema)], productsController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/products/:id
productsRouter.get('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.products.view), schemaValidator(GetProductSchema)], productsController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/products
productsRouter.post('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.products.create), schemaValidator(CreateProductSchema)], productsController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/products/:id
productsRouter.put('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.products.edit), schemaValidator(UpdateProductSchema)], productsController.update as RequestHandler<UpdateProductParamsType, {}, UpdateProductBodyType, {}>)

// DELETE - http://localhost:3000/api/v1/products/:id
productsRouter.delete('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.products.delete), schemaValidator(DeleteProductSchema)], productsController.delete as RequestHandler<DeleteProductParamsType, {}, {}, {}>)

// PUT - http://localhost:3000/api/v1/products/soft-delete/:id
productsRouter.put('/soft-delete/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.products.deactivate), schemaValidator(ChangeIsActiveProductSchema)], productsController.changeIsActive as RequestHandler<ChangeIsActiveProductParamsType, {}, ChangeIsActiveProductBodyType, {}>)

export default productsRouter
