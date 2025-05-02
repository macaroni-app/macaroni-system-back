import { RequestHandler, Router } from 'express'

import businessController from '../controllers/business'

import verifyToken from '../middlewares/validate-token'

import { schemaValidator } from '../middlewares/schemaValidator'

import { CreateBusinessSchema, DeleteBusinessSchema, GetBusinessSchema, UpdateBusinessSchema, UpdateBusinessParamsType, UpdateBusinessBodyType, DeleteBusinessParamsType, ChangeIsActiveBusinessSchema, ChangeIsActiveBusinessParamsType, ChangeIsActiveBusinessBodyType } from '../schemas/business'

import verifyRole from '../middlewares/verifyRoles'

import ProfileBase from '../permissions/ProfileBase'

const businessesRouter = Router()

// GET - http://localhost:3000/api/v1/businesses
businessesRouter.get('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.businesses.view), schemaValidator(GetBusinessSchema)], businessController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/businesses/:id
businessesRouter.get('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.businesses.view), schemaValidator(GetBusinessSchema)], businessController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/businesses
businessesRouter.post('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.businesses.create), schemaValidator(CreateBusinessSchema)], businessController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/businesses/:id
businessesRouter.put('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.businesses.edit), schemaValidator(UpdateBusinessSchema)], businessController.update as RequestHandler<UpdateBusinessParamsType, {}, UpdateBusinessBodyType, {}>)

// DELETE - http://localhost:3000/api/v1/businesses/:id
businessesRouter.delete('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.businesses.delete), schemaValidator(DeleteBusinessSchema)], businessController.delete as RequestHandler<DeleteBusinessParamsType, {}, {}, {}>)

// PUT - http://localhost:3000/api/v1/businesses/soft-delete/:id
businessesRouter.put('/soft-delete/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.businesses.deactivate), schemaValidator(ChangeIsActiveBusinessSchema)], businessController.changeIsActive as RequestHandler<ChangeIsActiveBusinessParamsType, {}, ChangeIsActiveBusinessBodyType, {}>)

export default businessesRouter
