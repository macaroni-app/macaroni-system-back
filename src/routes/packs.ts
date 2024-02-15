import { RequestHandler, Router } from 'express'

import packsController from '../controllers/packs'

import verifyToken from '../middlewares/validate-token'
import { schemaValidator } from '../middlewares/schemaValidator'
import { CreatePackSchema, DeletePackSchema, DeletePackParamsType, GetPackSchema, UpdatePackParamsType, UpdatePackBodyType, UpdatePackSchema } from '../schemas/packs'

const packsRouter = Router()

// GET - http://localhost:3000/api/v1/packs
packsRouter.get('/', [verifyToken as RequestHandler, schemaValidator(GetPackSchema)], packsController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/packs/:id
packsRouter.get('/:id', [verifyToken as RequestHandler, schemaValidator(GetPackSchema)], packsController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/packs
packsRouter.post('/', [verifyToken as RequestHandler, schemaValidator(CreatePackSchema)], packsController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/packs/:id
packsRouter.put('/:id', [verifyToken as RequestHandler, schemaValidator(UpdatePackSchema)], packsController.update as RequestHandler<UpdatePackParamsType, {}, UpdatePackBodyType, {}>)

// PUT - http://localhost:3000/api/v1/packs
// baseProductsRouter.put('/', verifyToken as RequestHandler, productsController.updateMany as RequestHandler)

// DELETE - http://localhost:3000/api/v1/packs/:id
packsRouter.delete('/:id', [verifyToken as RequestHandler, schemaValidator(DeletePackSchema)], packsController.delete as RequestHandler<DeletePackParamsType, {}, {}, {}>)

export default packsRouter
