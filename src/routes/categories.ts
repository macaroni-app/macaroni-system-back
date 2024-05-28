import { RequestHandler, Router } from 'express'

import categoryController from '../controllers/categories'

import verifyToken from '../middlewares/validate-token'

import { schemaValidator } from '../middlewares/schemaValidator'

import { CreateCategorySchema, DeleteCategorySchema, GetCategorySchema, UpdateCategorySchema, UpdateCategoryParamsType, UpdateCategoryBodyType, DeleteCategoryParamsType, ChangeIsActiveCategorySchema, ChangeIsActiveCategoryParamsType, ChangeIsActiveCategoryBodyType } from '../schemas/categories'

import verifyRole from '../middlewares/verifyRoles'

import ProfileBase from '../permissions/ProfileBase'

const categoriesRouter = Router()

// GET - http://localhost:3000/api/v1/categories
categoriesRouter.get('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.categories.view), schemaValidator(GetCategorySchema)], categoryController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/categories/:id
categoriesRouter.get('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.categories.view), schemaValidator(GetCategorySchema)], categoryController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/categories
categoriesRouter.post('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.categories.create), schemaValidator(CreateCategorySchema)], categoryController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/categories/:id
categoriesRouter.put('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.categories.edit), schemaValidator(UpdateCategorySchema)], categoryController.update as RequestHandler<UpdateCategoryParamsType, {}, UpdateCategoryBodyType, {}>)

// DELETE - http://localhost:3000/api/v1/categories/:id
categoriesRouter.delete('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.categories.delete), schemaValidator(DeleteCategorySchema)], categoryController.delete as RequestHandler<DeleteCategoryParamsType, {}, {}, {}>)

// PUT - http://localhost:3000/api/v1/categories/soft-delete/:id
categoriesRouter.put('/soft-delete/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.categories.deactivate), schemaValidator(ChangeIsActiveCategorySchema)], categoryController.changeIsActive as RequestHandler<ChangeIsActiveCategoryParamsType, {}, ChangeIsActiveCategoryBodyType, {}>)

export default categoriesRouter
