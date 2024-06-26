import { RequestHandler, Router } from 'express'

import assetsController from '../controllers/assets'

import verifyToken from '../middlewares/validate-token'

import { CreateAssetSchema, UpdateAssetParamsType, UpdateAssetBodyType, UpdateAssetSchema, DeleteAssetSchema, DeleteAssetParamsType, GetAssetSchema, ChangeIsActiveAssetSchema, ChangeIsActiveAssetParamsType, ChangeIsActiveAssetBodyType } from '../schemas/assets'

import { schemaValidator } from '../middlewares/schemaValidator'

import verifyRole from '../middlewares/verifyRoles'

import ProfileBase from '../permissions/ProfileBase'

const assetsRouter = Router()

// GET - http://localhost:3000/api/v1/assets
assetsRouter.get('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.assets.view), schemaValidator(GetAssetSchema)], assetsController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/assets/:id
assetsRouter.get('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.assets.view), schemaValidator(GetAssetSchema)], assetsController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/assets
assetsRouter.post('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.assets.create), schemaValidator(CreateAssetSchema)], assetsController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/assets/:id
assetsRouter.put('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.assets.edit), schemaValidator(UpdateAssetSchema)], assetsController.update as RequestHandler<UpdateAssetParamsType, {}, UpdateAssetBodyType, {}>)

// DELETE - http://localhost:3000/api/v1/assets/:id
assetsRouter.delete('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.assets.delete), schemaValidator(DeleteAssetSchema)], assetsController.delete as RequestHandler<DeleteAssetParamsType, {}, {}, {}>)

// PUT - http://localhost:3000/api/v1/assets/soft-delete/:id
assetsRouter.put('/soft-delete/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.assets.deactivate), schemaValidator(ChangeIsActiveAssetSchema)], assetsController.changeIsActive as RequestHandler<ChangeIsActiveAssetParamsType, {}, ChangeIsActiveAssetBodyType, {}>)

export default assetsRouter
