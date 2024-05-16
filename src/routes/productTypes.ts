import { RequestHandler, Router } from 'express'

import productTypeController from '../controllers/productTypes'

import verifyToken from '../middlewares/validate-token'
import { schemaValidator } from '../middlewares/schemaValidator'
import { CreateProductTypeSchema, DeleteProductTypeSchema, GetProductTypeSchema, UpdateProductTypeSchema, UpdateProductTypeParamsType, UpdateProductTypeBodyType, DeleteProductTypeParamsType, ChangeIsActiveProductTypeSchema, ChangeIsActiveProductTypeParamsType, ChangeIsActiveProductTypeBodyType } from '../schemas/productTypes'

import verifyRole from '../middlewares/verifyRoles'
import { RoleCodes } from '../config/rolesCodes'

const productTypesRouter = Router()

// GET - http://localhost:3000/api/v1/productTypes
productTypesRouter.get('/', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN, RoleCodes.SELLER), schemaValidator(GetProductTypeSchema)], productTypeController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/productTypes/:id
productTypesRouter.get('/:id', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN, RoleCodes.SELLER), schemaValidator(GetProductTypeSchema)], productTypeController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/productTypes
productTypesRouter.post('/', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN), schemaValidator(CreateProductTypeSchema)], productTypeController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/productTypes/:id
productTypesRouter.put('/:id', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN), schemaValidator(UpdateProductTypeSchema)], productTypeController.update as RequestHandler<UpdateProductTypeParamsType, {}, UpdateProductTypeBodyType, {}>)

// DELETE - http://localhost:3000/api/v1/productTypes/:id
productTypesRouter.delete('/:id', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN), schemaValidator(DeleteProductTypeSchema)], productTypeController.delete as RequestHandler<DeleteProductTypeParamsType, {}, {}, {}>)

// PUT - http://localhost:3000/api/v1/productTypes/soft-delete/:id
productTypesRouter.put('/soft-delete/:id', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN, RoleCodes.SELLER), schemaValidator(ChangeIsActiveProductTypeSchema)], productTypeController.changeIsActive as RequestHandler<ChangeIsActiveProductTypeParamsType, {}, ChangeIsActiveProductTypeBodyType, {}>)

export default productTypesRouter
