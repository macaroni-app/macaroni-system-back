import { RequestHandler, Router } from 'express'

import inventoryTransactionController from '../controllers/inventoryTransactions'

import verifyToken from '../middlewares/validate-token'
import { schemaValidator } from '../middlewares/schemaValidator'
import { CreateInventoryTransactionSchema, GetInventoryTransactionSchema, UpdateInventoryTransactionParamsType, UpdateInventoryTransactionBodyType, UpdateInventoryTransactionSchema, DeleteInventoryTransactionParamsType, DeleteInventoryTransactionSchema, CreateManyInventoryTransactionSchema } from '../schemas/inventoryTransactions'

import verifyRole from '../middlewares/verifyRoles'
import { RoleCodes } from '../config/rolesCodes'

const inventoryTransactionRouter = Router()

// GET - http://localhost:3000/api/v1/inventoryTransactions
inventoryTransactionRouter.get('/', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN, RoleCodes.SELLER), schemaValidator(GetInventoryTransactionSchema)], inventoryTransactionController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/inventoryTransactions/:id
inventoryTransactionRouter.get('/:id', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN, RoleCodes.SELLER), schemaValidator(GetInventoryTransactionSchema)], inventoryTransactionController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/inventoryTransactions
inventoryTransactionRouter.post('/', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN), schemaValidator(CreateInventoryTransactionSchema)], inventoryTransactionController.store as RequestHandler)

// POST - http://localhost:3000/api/v1/inventoryTransactions
inventoryTransactionRouter.post('/bulkCreate', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN, RoleCodes.SELLER), schemaValidator(CreateManyInventoryTransactionSchema)], inventoryTransactionController.storeMany as RequestHandler)

// PUT - http://localhost:3000/api/v1/inventoryTransactions/:id
inventoryTransactionRouter.put('/:id', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN), schemaValidator(UpdateInventoryTransactionSchema)], inventoryTransactionController.update as RequestHandler<UpdateInventoryTransactionParamsType, {}, UpdateInventoryTransactionBodyType, {}>)

// PUT - http://localhost:3000/api/v1/inventoryTransactions
// baseProductsRouter.put('/', verifyToken as RequestHandler, productsController.updateMany as RequestHandler)

// DELETE - http://localhost:3000/api/v1/inventoryTransactions/:id
inventoryTransactionRouter.delete('/:id', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN), schemaValidator(DeleteInventoryTransactionSchema)], inventoryTransactionController.delete as RequestHandler<DeleteInventoryTransactionParamsType, {}, {}, {}>)

export default inventoryTransactionRouter
