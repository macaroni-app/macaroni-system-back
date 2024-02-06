import { RequestHandler, Router } from 'express'

import packItemsController from '../controllers/packItems'

import verifyToken from '../middlewares/validate-token'

const packItemsRouter = Router()

// GET - http://localhost:3000/api/v1/packItems
packItemsRouter.get('/', verifyToken as RequestHandler, packItemsController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/packItems/:id
packItemsRouter.get('/:id', verifyToken as RequestHandler, packItemsController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/packItems
packItemsRouter.post('/', verifyToken as RequestHandler, packItemsController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/packItems/:id
packItemsRouter.put('/:id', verifyToken as RequestHandler, packItemsController.update as RequestHandler)

// PUT - http://localhost:3000/api/v1/packItems
// baseProductsRouter.put('/', verifyToken as RequestHandler, productsController.updateMany as RequestHandler)

// DELETE - http://localhost:3000/api/v1/packItems/:id
packItemsRouter.delete('/:id', verifyToken as RequestHandler, packItemsController.delete as RequestHandler)

export default packItemsRouter
