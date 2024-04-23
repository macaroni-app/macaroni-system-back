import { RequestHandler, Router } from 'express'

import inventoryTransactionController from '../controllers/inventoryTransactions'

import verifyToken from '../middlewares/validate-token'
import { schemaValidator } from '../middlewares/schemaValidator'
import { CreateInventoryTransactionSchema, GetInventoryTransactionSchema, UpdateInventoryTransactionParamsType, UpdateInventoryTransactionBodyType, UpdateInventoryTransactionSchema, DeleteInventoryTransactionParamsType, DeleteInventoryTransactionSchema, CreateManyInventoryTransactionSchema } from '../schemas/inventoryTransactions'

const inventoryTransactionRouter = Router()

// GET - http://localhost:3000/api/v1/inventoryTransactions
inventoryTransactionRouter.get('/', [verifyToken as RequestHandler, schemaValidator(GetInventoryTransactionSchema)], inventoryTransactionController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/inventoryTransactions/:id
inventoryTransactionRouter.get('/:id', [verifyToken as RequestHandler, schemaValidator(GetInventoryTransactionSchema)], inventoryTransactionController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/inventoryTransactions
inventoryTransactionRouter.post('/', [verifyToken as RequestHandler, schemaValidator(CreateInventoryTransactionSchema)], inventoryTransactionController.store as RequestHandler)

// POST - http://localhost:3000/api/v1/inventoryTransactions
inventoryTransactionRouter.post('/bulkCreate', [verifyToken as RequestHandler, schemaValidator(CreateManyInventoryTransactionSchema)], inventoryTransactionController.storeMany as RequestHandler)

// PUT - http://localhost:3000/api/v1/inventoryTransactions/:id
inventoryTransactionRouter.put('/:id', [verifyToken as RequestHandler, schemaValidator(UpdateInventoryTransactionSchema)], inventoryTransactionController.update as RequestHandler<UpdateInventoryTransactionParamsType, {}, UpdateInventoryTransactionBodyType, {}>)

// PUT - http://localhost:3000/api/v1/inventoryTransactions
// baseProductsRouter.put('/', verifyToken as RequestHandler, productsController.updateMany as RequestHandler)

// DELETE - http://localhost:3000/api/v1/inventoryTransactions/:id
inventoryTransactionRouter.delete('/:id', [verifyToken as RequestHandler, schemaValidator(DeleteInventoryTransactionSchema)], inventoryTransactionController.delete as RequestHandler<DeleteInventoryTransactionParamsType, {}, {}, {}>)

export default inventoryTransactionRouter
