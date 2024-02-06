import { RequestHandler, Router } from 'express'

import clientController from '../controllers/clients'

import verifyToken from '../middlewares/validate-token'

const clientsRouter = Router()

// GET - http://localhost:3000/api/v1/clients
clientsRouter.get('/', verifyToken as RequestHandler, clientController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/clients/:id
clientsRouter.get('/:id', verifyToken as RequestHandler, clientController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/clients
clientsRouter.post('/', verifyToken as RequestHandler, clientController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/clients/:id
clientsRouter.put('/:id', verifyToken as RequestHandler, clientController.update as RequestHandler)

// DELETE - http://localhost:3000/api/v1/clients/:id
clientsRouter.delete('/:id', verifyToken as RequestHandler, clientController.delete as RequestHandler)

export default clientsRouter
