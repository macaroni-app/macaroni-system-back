import { RequestHandler, Router } from 'express'

import inventoriesController from '../controllers/inventories'

import verifyToken from '../middlewares/validate-token'

import { schemaValidator } from '../middlewares/schemaValidator'

import { CreateInventorySchema, DeleteInventoryParamsType, DeleteInventorySchema, GetInventorySchema, UpdateInventoryBodyType, UpdateInventoryParamsType, UpdateInventorySchema, UpdateManyInventoriesBodyType, UpdateManyInventorySchema } from '../schemas/inventories'

import verifyRole from '../middlewares/verifyRoles'

import ProfileBase from '../permissions/ProfileBase'

const inventoryRouter = Router()

// GET - http://localhost:3000/api/v1/inventories
inventoryRouter.get('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.inventories.view), schemaValidator(GetInventorySchema)], inventoriesController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/inventories/:id
inventoryRouter.get('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.inventories.view), schemaValidator(GetInventorySchema)], inventoriesController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/inventories
inventoryRouter.post('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.inventories.create), schemaValidator(CreateInventorySchema)], inventoriesController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/inventories
inventoryRouter.put('/bulkUpdate', [verifyToken as RequestHandler, verifyRole(ProfileBase.inventories.edit), schemaValidator(UpdateManyInventorySchema)], inventoriesController.updateMany as RequestHandler<{}, {}, UpdateManyInventoriesBodyType, {}>)

// PUT - http://localhost:3000/api/v1/inventories/:id
inventoryRouter.put('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.inventories.edit), schemaValidator(UpdateInventorySchema)], inventoriesController.update as RequestHandler<UpdateInventoryParamsType, {}, UpdateInventoryBodyType, {}>)

// DELETE - http://localhost:3000/api/v1/inventories/:id
inventoryRouter.delete('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.inventories.delete), schemaValidator(DeleteInventorySchema)], inventoriesController.delete as RequestHandler<DeleteInventoryParamsType, {}, {}, {}>)

export default inventoryRouter
