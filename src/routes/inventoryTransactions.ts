import { RequestHandler, Router } from 'express'

import inventoryTransactionController from '../controllers/inventoryTransactions'

import verifyToken from '../middlewares/validate-token'
import { schemaValidator } from '../middlewares/schemaValidator'
import { CreateInventoryTransactionSchema, UpdateInventoryTransactionSchema } from '../schemas/inventoryTransactions'

const inventoryTransactionRouter = Router()

// GET - http://localhost:3000/api/v1/inventoryTransactions
inventoryTransactionRouter.get('/', verifyToken as RequestHandler, inventoryTransactionController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/inventoryTransactions/:id
inventoryTransactionRouter.get('/:id', verifyToken as RequestHandler, inventoryTransactionController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/inventoryTransactions
inventoryTransactionRouter.post('/', [verifyToken as RequestHandler, schemaValidator(CreateInventoryTransactionSchema)], inventoryTransactionController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/inventoryTransactions/:id
inventoryTransactionRouter.put('/:id', [verifyToken as RequestHandler, schemaValidator(UpdateInventoryTransactionSchema)], inventoryTransactionController.update as RequestHandler)

// PUT - http://localhost:3000/api/v1/inventoryTransactions
// baseProductsRouter.put('/', verifyToken as RequestHandler, productsController.updateMany as RequestHandler)

// DELETE - http://localhost:3000/api/v1/inventoryTransactions/:id
inventoryTransactionRouter.delete('/:id', verifyToken as RequestHandler, inventoryTransactionController.delete as RequestHandler)

export default inventoryTransactionRouter
