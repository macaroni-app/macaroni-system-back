import { RequestHandler, Router } from 'express'

import clientController from '../controllers/clients'

import verifyToken from '../middlewares/validate-token'
import { schemaValidator } from '../middlewares/schemaValidator'
import { CreateClientSchema, DeleteClientSchema, GetClientSchema, UpdateClientSchema, UpdateClientParamsType, UpdateClientBodyType, DeleteClientParamsType, ChangeIsActiveClientSchema, ChangeIsActiveClientParamsType, ChangeIsActiveClientBodyType } from '../schemas/clients'

import verifyRole from '../middlewares/verifyRoles'
import { RoleCodes } from '../config/rolesCodes'

const clientsRouter = Router()

// GET - http://localhost:3000/api/v1/clients
clientsRouter.get('/', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER), schemaValidator(GetClientSchema)], clientController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/clients/:id
clientsRouter.get('/:id', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER), schemaValidator(GetClientSchema)], clientController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/clients
clientsRouter.post('/', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER), schemaValidator(CreateClientSchema)], clientController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/clients/:id
clientsRouter.put('/:id', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER), schemaValidator(UpdateClientSchema)], clientController.update as RequestHandler<UpdateClientParamsType, {}, UpdateClientBodyType, {}>)

// DELETE - http://localhost:3000/api/v1/clients/:id
clientsRouter.delete('/:id', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN), schemaValidator(DeleteClientSchema)], clientController.delete as RequestHandler<DeleteClientParamsType, {}, {}, {}>)

// PUT - http://localhost:3000/api/v1/clients/soft-delete/:id
clientsRouter.put('/soft-delete/:id', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER), schemaValidator(ChangeIsActiveClientSchema)], clientController.changeIsActive as RequestHandler<ChangeIsActiveClientParamsType, {}, ChangeIsActiveClientBodyType, {}>)

export default clientsRouter
