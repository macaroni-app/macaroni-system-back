import { RequestHandler, Router } from 'express'

import assetsController from '../controllers/assets'

import verifyToken from '../middlewares/validate-token'
import { CreateAssetSchema, UpdateAssetParamsType, UpdateAssetBodyType, UpdateAssetSchema, DeleteAssetSchema, DeleteAssetParamsType, GetAssetSchema } from '../schemas/assets'
import { schemaValidator } from '../middlewares/schemaValidator'

const assetsRouter = Router()

// GET - http://localhost:3000/api/v1/assets
assetsRouter.get('/', [verifyToken as RequestHandler, schemaValidator(GetAssetSchema)], assetsController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/assets/:id
assetsRouter.get('/:id', [verifyToken as RequestHandler, schemaValidator(GetAssetSchema)], assetsController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/assets
assetsRouter.post('/', [verifyToken as RequestHandler, schemaValidator(CreateAssetSchema)], assetsController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/assets/:id
assetsRouter.put('/:id', [verifyToken as RequestHandler, schemaValidator(UpdateAssetSchema)], assetsController.update as RequestHandler<UpdateAssetParamsType, {}, UpdateAssetBodyType, {}>)

// DELETE - http://localhost:3000/api/v1/assets/:id
assetsRouter.delete('/:id', [verifyToken as RequestHandler, schemaValidator(DeleteAssetSchema)], assetsController.delete as RequestHandler<DeleteAssetParamsType, {}, {}, {}>)

export default assetsRouter
