import { RequestHandler, Router } from 'express'

import productItemsController from '../controllers/productItems'

import verifyToken from '../middlewares/validate-token'

import { schemaValidator } from '../middlewares/schemaValidator'

import { CreateManyProductItemsSchema, CreateProductItemsSchema, DeleteManyProductItemsBodyType, DeleteManyProductItemsSchema, DeleteProductItemsParamsType, DeleteProductItemsSchema, GetProductItemsSchema, UpdateManyProductItemsBodyType, UpdateManyProductItemsSchema } from '../schemas/productItems'

import verifyRole from '../middlewares/verifyRoles'

import ProfileBase from '../permissions/ProfileBase'

const productItemsRouter = Router()

// GET - http://localhost:3000/api/v1/productItems
productItemsRouter.get('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.productItems.view), schemaValidator(GetProductItemsSchema)], productItemsController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/productItems/:id
productItemsRouter.get('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.productItems.view), schemaValidator(GetProductItemsSchema)], productItemsController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/productItems
productItemsRouter.post('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.productItems.create), schemaValidator(CreateProductItemsSchema)], productItemsController.store as RequestHandler)

// POST - http://localhost:3000/api/v1/productItems
productItemsRouter.post('/bulkCreate', [verifyToken as RequestHandler, verifyRole(ProfileBase.productItems.create), schemaValidator(CreateManyProductItemsSchema)], productItemsController.storeMany as RequestHandler)

// PUT - http://localhost:3000/api/v1/productItems/:id
// productItemsRouter.put('/:id', [verifyToken as RequestHandler, schemaValidator(UpdateProductItemsSchema)], productItemsController.update as RequestHandler<UpdateProductItemsParamsType, {}, UpdateProductItemsBodyType, {}>)

// PUT - http://localhost:3000/api/v1/productItems
productItemsRouter.put('/bulkUpdate', [verifyToken as RequestHandler, verifyRole(ProfileBase.productItems.create), schemaValidator(UpdateManyProductItemsSchema)], productItemsController.updateMany as RequestHandler<{}, {}, UpdateManyProductItemsBodyType, {}>)

// DELETE - http://localhost:3000/api/v1/productItems/:id
productItemsRouter.delete('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.productItems.delete), schemaValidator(DeleteProductItemsSchema)], productItemsController.delete as RequestHandler<DeleteProductItemsParamsType, {}, {}, {}>)

// DELETE - http://localhost:3000/api/v1/productItems
productItemsRouter.put('/bulkDelete', [verifyToken as RequestHandler, verifyRole(ProfileBase.productItems.delete), schemaValidator(DeleteManyProductItemsSchema)], productItemsController.deleteMany as RequestHandler<{}, {}, DeleteManyProductItemsBodyType, {}>)

export default productItemsRouter
