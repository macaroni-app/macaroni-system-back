import { RequestHandler, Router } from 'express'

import inventoriesController from '../controllers/inventories'

import verifyToken from '../middlewares/validate-token'
import { schemaValidator } from '../middlewares/schemaValidator'
import { CreateInventorySchema, DeleteInventoryParamsType, DeleteInventorySchema, GetInventorySchema, UpdateInventoryBodyType, UpdateInventoryParamsType, UpdateInventorySchema } from '../schemas/inventories'

const inventoryRouter = Router()

// GET - http://localhost:3000/api/v1/inventories
inventoryRouter.get('/', [verifyToken as RequestHandler, schemaValidator(GetInventorySchema)], inventoriesController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/inventories/:id
inventoryRouter.get('/:id', [verifyToken as RequestHandler, schemaValidator(GetInventorySchema)], inventoriesController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/inventories
inventoryRouter.post('/', [verifyToken as RequestHandler, schemaValidator(CreateInventorySchema)], inventoriesController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/inventories/:id
inventoryRouter.put('/:id', [verifyToken as RequestHandler, schemaValidator(UpdateInventorySchema)], inventoriesController.update as RequestHandler<UpdateInventoryParamsType, {}, UpdateInventoryBodyType, {}>)

// PUT - http://localhost:3000/api/v1/inventories
// baseProductsRouter.put('/', verifyToken as RequestHandler, productsController.updateMany as RequestHandler)

// DELETE - http://localhost:3000/api/v1/inventories/:id
inventoryRouter.delete('/:id', [verifyToken as RequestHandler, schemaValidator(DeleteInventorySchema)], inventoriesController.delete as RequestHandler<DeleteInventoryParamsType, {}, {}, {}>)

export default inventoryRouter
