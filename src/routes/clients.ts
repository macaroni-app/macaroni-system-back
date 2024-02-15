import { RequestHandler, Router } from 'express'

import clientController from '../controllers/clients'

import verifyToken from '../middlewares/validate-token'
import { schemaValidator } from '../middlewares/schemaValidator'
import { CreateClientSchema, DeleteClientSchema, GetClientSchema, UpdateClientSchema, UpdateClientParamsType, UpdateClientBodyType, DeleteClientParamsType } from '../schemas/clients'

const clientsRouter = Router()

// GET - http://localhost:3000/api/v1/clients
clientsRouter.get('/', [verifyToken as RequestHandler, schemaValidator(GetClientSchema)], clientController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/clients/:id
clientsRouter.get('/:id', [verifyToken as RequestHandler, schemaValidator(GetClientSchema)], clientController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/clients
clientsRouter.post('/', [verifyToken as RequestHandler, schemaValidator(CreateClientSchema)], clientController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/clients/:id
clientsRouter.put('/:id', [verifyToken as RequestHandler, schemaValidator(UpdateClientSchema)], clientController.update as RequestHandler<UpdateClientParamsType, {}, UpdateClientBodyType, {}>)

// DELETE - http://localhost:3000/api/v1/clients/:id
clientsRouter.delete('/:id', [verifyToken as RequestHandler, schemaValidator(DeleteClientSchema)], clientController.delete as RequestHandler<DeleteClientParamsType, {}, {}, {}>)

export default clientsRouter
