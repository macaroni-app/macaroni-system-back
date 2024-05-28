import { RequestHandler, Router } from 'express'

import rolesController from '../controllers/roles'

import verifyToken from '../middlewares/validate-token'

import { schemaValidator } from '../middlewares/schemaValidator'

import { CreateRoleSchema, DeleteRoleParamsType, DeleteRoleSchema, GetRoleSchema, UpdateRoleBodyType, UpdateRoleParamsType, UpdateRoleSchema } from '../schemas/roles'

import verifyRole from '../middlewares/verifyRoles'

import ProfileBase from '../permissions/ProfileBase'

const rolesRouter = Router()

// GET - http://localhost:3000/api/v1/roles
rolesRouter.get('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.roles.view), schemaValidator(GetRoleSchema)], rolesController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/roles/:id
rolesRouter.get('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.roles.view), schemaValidator(GetRoleSchema)], rolesController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/roles
rolesRouter.post('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.roles.create), schemaValidator(CreateRoleSchema)], rolesController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/roles/:id
rolesRouter.put('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.roles.edit), schemaValidator(UpdateRoleSchema)], rolesController.update as RequestHandler<UpdateRoleParamsType, {}, UpdateRoleBodyType, {}>)

// DELETE - http://localhost:3000/api/v1/roles/:id
rolesRouter.delete('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.roles.delete), schemaValidator(DeleteRoleSchema)], rolesController.delete as RequestHandler<DeleteRoleParamsType, {}, {}, {}>)

export default rolesRouter
