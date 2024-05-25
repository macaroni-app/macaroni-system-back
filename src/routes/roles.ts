import { RequestHandler, Router } from 'express'

import rolesController from '../controllers/roles'

import verifyToken from '../middlewares/validate-token'
import { schemaValidator } from '../middlewares/schemaValidator'

import verifyRole from '../middlewares/verifyRoles'

import { RoleCodes } from '../config/rolesCodes'

import { CreateRoleSchema, DeleteRoleParamsType, DeleteRoleSchema, GetRoleSchema, UpdateRoleBodyType, UpdateRoleParamsType, UpdateRoleSchema } from '../schemas/roles'

const rolesRouter = Router()

// GET - http://localhost:3000/api/v1/roles
rolesRouter.get('/', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER), schemaValidator(GetRoleSchema)], rolesController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/roles/:id
rolesRouter.get('/:id', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER), schemaValidator(GetRoleSchema)], rolesController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/roles
rolesRouter.post('/', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER), schemaValidator(CreateRoleSchema)], rolesController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/roles/:id
rolesRouter.put('/:id', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER), schemaValidator(UpdateRoleSchema)], rolesController.update as RequestHandler<UpdateRoleParamsType, {}, UpdateRoleBodyType, {}>)

// DELETE - http://localhost:3000/api/v1/roles/:id
rolesRouter.delete('/:id', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN), schemaValidator(DeleteRoleSchema)], rolesController.delete as RequestHandler<DeleteRoleParamsType, {}, {}, {}>)

export default rolesRouter
