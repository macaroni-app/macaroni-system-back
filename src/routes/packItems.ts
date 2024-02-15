import { RequestHandler, Router } from 'express'

import packItemsController from '../controllers/packItems'

import verifyToken from '../middlewares/validate-token'
import { schemaValidator } from '../middlewares/schemaValidator'
import { CreatePackItemsSchema, DeletePackItemsParamsType, DeletePackItemsSchema, GetPackItemsSchema, UpdatePackItemsBodyType, UpdatePackItemsParamsType, UpdatePackItemsSchema } from '../schemas/packItems'

const packItemsRouter = Router()

// GET - http://localhost:3000/api/v1/packItems
packItemsRouter.get('/', [verifyToken as RequestHandler, schemaValidator(GetPackItemsSchema)], packItemsController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/packItems/:id
packItemsRouter.get('/:id', [verifyToken as RequestHandler, schemaValidator(GetPackItemsSchema)], packItemsController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/packItems
packItemsRouter.post('/', [verifyToken as RequestHandler, schemaValidator(CreatePackItemsSchema)], packItemsController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/packItems/:id
packItemsRouter.put('/:id', [verifyToken as RequestHandler, schemaValidator(UpdatePackItemsSchema)], packItemsController.update as RequestHandler<UpdatePackItemsParamsType, {}, UpdatePackItemsBodyType, {}>)

// PUT - http://localhost:3000/api/v1/packItems
// baseProductsRouter.put('/', verifyToken as RequestHandler, productsController.updateMany as RequestHandler)

// DELETE - http://localhost:3000/api/v1/packItems/:id
packItemsRouter.delete('/:id', [verifyToken as RequestHandler, schemaValidator(DeletePackItemsSchema)], packItemsController.delete as RequestHandler<DeletePackItemsParamsType, {}, {}, {}>)

export default packItemsRouter
