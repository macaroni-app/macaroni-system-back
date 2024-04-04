import { RequestHandler, Router } from 'express'

import categoryController from '../controllers/categories'

import verifyToken from '../middlewares/validate-token'
import { schemaValidator } from '../middlewares/schemaValidator'
import { CreateCategorySchema, DeleteCategorySchema, GetCategorySchema, UpdateCategorySchema, UpdateCategoryParamsType, UpdateCategoryBodyType, DeleteCategoryParamsType } from '../schemas/categories'

const categoriesRouter = Router()

// GET - http://localhost:3000/api/v1/categories
categoriesRouter.get('/', [verifyToken as RequestHandler, schemaValidator(GetCategorySchema)], categoryController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/categories/:id
categoriesRouter.get('/:id', [verifyToken as RequestHandler, schemaValidator(GetCategorySchema)], categoryController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/categories
categoriesRouter.post('/', [verifyToken as RequestHandler, schemaValidator(CreateCategorySchema)], categoryController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/categories/:id
categoriesRouter.put('/:id', [verifyToken as RequestHandler, schemaValidator(UpdateCategorySchema)], categoryController.update as RequestHandler<UpdateCategoryParamsType, {}, UpdateCategoryBodyType, {}>)

// DELETE - http://localhost:3000/api/v1/categories/:id
categoriesRouter.delete('/:id', [verifyToken as RequestHandler, schemaValidator(DeleteCategorySchema)], categoryController.delete as RequestHandler<DeleteCategoryParamsType, {}, {}, {}>)

export default categoriesRouter
