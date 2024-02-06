import { RequestHandler, Router } from 'express'

import productsController from '../controllers/products'

import verifyToken from '../middlewares/validate-token'

const productsRouter = Router()

// GET - http://localhost:3000/api/v1/products
productsRouter.get('/', verifyToken as RequestHandler, productsController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/products/:id
productsRouter.get('/:id', verifyToken as RequestHandler, productsController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/products
productsRouter.post('/', verifyToken as RequestHandler, productsController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/products/:id
productsRouter.put('/:id', verifyToken as RequestHandler, productsController.update as RequestHandler)

// PUT - http://localhost:3000/api/v1/products
productsRouter.put('/', verifyToken as RequestHandler, productsController.updateMany as RequestHandler)

// DELETE - http://localhost:3000/api/v1/products/:id
productsRouter.delete('/:id', verifyToken as RequestHandler, productsController.delete as RequestHandler)

export default productsRouter
