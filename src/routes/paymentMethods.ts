import { RequestHandler, Router } from 'express'

import methodPaymentController from '../controllers/paymentMethods'

import verifyToken from '../middlewares/validate-token'
import { schemaValidator } from '../middlewares/schemaValidator'
import { ChangeIsActiveMethodPaymentBodyType, ChangeIsActiveMethodPaymentParamsType, ChangeIsActiveMethodPaymentSchema, CreateMethodPaymentsSchema, DeleteMethodPaymentsParamsType, DeleteMethodPaymentsSchema, GetMethodPaymentsSchema, UpdateMethodPaymentsBodyType, UpdateMethodPaymentsParamsType, UpdateMethodPaymentsSchema } from '../schemas/methodPayments'

import verifyRole from '../middlewares/verifyRoles'
import { RoleCodes } from '../config/rolesCodes'

const methodPaymentRouter = Router()

// GET - http://localhost:3000/api/v1/methodPayments/
methodPaymentRouter.get('/', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER), schemaValidator(GetMethodPaymentsSchema)], methodPaymentController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/methodPayments/:id
methodPaymentRouter.get('/:id', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER), schemaValidator(GetMethodPaymentsSchema)], methodPaymentController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/methodPayments/
methodPaymentRouter.post('/', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN, RoleCodes.SUPERVISOR), schemaValidator(CreateMethodPaymentsSchema)], methodPaymentController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/methodPayments/:id
methodPaymentRouter.put('/:id', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN, RoleCodes.SUPERVISOR), schemaValidator(UpdateMethodPaymentsSchema)], methodPaymentController.update as RequestHandler<UpdateMethodPaymentsParamsType, {}, UpdateMethodPaymentsBodyType, {}>)

// DELETE - http://localhost:3000/api/v1/methodPayments/:id
methodPaymentRouter.delete('/:id', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN), schemaValidator(DeleteMethodPaymentsSchema)], methodPaymentController.delete as RequestHandler<DeleteMethodPaymentsParamsType, {}, {}, {}>)

// PUT - http://localhost:3000/api/v1/methodPayments/soft-delete/:id
methodPaymentRouter.put('/soft-delete/:id', [verifyToken as RequestHandler, verifyRole(RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER), schemaValidator(ChangeIsActiveMethodPaymentSchema)], methodPaymentController.changeIsActive as RequestHandler<ChangeIsActiveMethodPaymentParamsType, {}, ChangeIsActiveMethodPaymentBodyType, {}>)

export default methodPaymentRouter
