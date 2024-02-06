import { RequestHandler, Router } from 'express'

import inventoriesController from '../controllers/inventories'

import verifyToken from '../middlewares/validate-token'

const inventoryRouter = Router()

// GET - http://localhost:3000/api/v1/inventories
inventoryRouter.get('/', verifyToken as RequestHandler, inventoriesController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/inventories/:id
inventoryRouter.get('/:id', verifyToken as RequestHandler, inventoriesController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/inventories
inventoryRouter.post('/', verifyToken as RequestHandler, inventoriesController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/inventories/:id
inventoryRouter.put('/:id', verifyToken as RequestHandler, inventoriesController.update as RequestHandler)

// PUT - http://localhost:3000/api/v1/inventories
// baseProductsRouter.put('/', verifyToken as RequestHandler, productsController.updateMany as RequestHandler)

// DELETE - http://localhost:3000/api/v1/inventories/:id
inventoryRouter.delete('/:id', verifyToken as RequestHandler, inventoriesController.delete as RequestHandler)

export default inventoryRouter
