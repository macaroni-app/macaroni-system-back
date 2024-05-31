import { RequestHandler, Router } from 'express'

import fixedCostController from '../controllers/fixedCosts'

import verifyToken from '../middlewares/validate-token'

import { schemaValidator } from '../middlewares/schemaValidator'

import { CreateFixedCostSchema, DeleteFixedCostParamsType, DeleteFixedCostSchema, GetFixedCostSchema, UpdateFixedCostBodyType, UpdateFixedCostParamsType, UpdateFixedCostSchema } from '../schemas/fixedCosts'

import verifyRole from '../middlewares/verifyRoles'

import ProfileBase from '../permissions/ProfileBase'

const fixedCostRouter = Router()

// GET - http://localhost:3000/api/v1/fixedCosts
fixedCostRouter.get('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.fixedCosts.view), schemaValidator(GetFixedCostSchema)], fixedCostController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/fixedCosts/:id
fixedCostRouter.get('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.fixedCosts.view), schemaValidator(GetFixedCostSchema)], fixedCostController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/fixedCosts
fixedCostRouter.post('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.fixedCosts.create), schemaValidator(CreateFixedCostSchema)], fixedCostController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/fixedCosts/:id
fixedCostRouter.put('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.fixedCosts.edit), schemaValidator(UpdateFixedCostSchema)], fixedCostController.update as RequestHandler<UpdateFixedCostParamsType, {}, UpdateFixedCostBodyType, {}>)

// DELETE - http://localhost:3000/api/v1/fixedCosts/:id
fixedCostRouter.delete('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.fixedCosts.delete), schemaValidator(DeleteFixedCostSchema)], fixedCostController.delete as RequestHandler<DeleteFixedCostParamsType, {}, {}, {}>)

export default fixedCostRouter
