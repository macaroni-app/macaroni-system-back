import { RequestHandler, Router } from 'express'

import methodPaymentController from '../controllers/paymentMethods'

import verifyToken from '../middlewares/validate-token'

const methodPaymentRouter = Router()

// GET - http://localhost:3000/api/v1/methodPayments/
methodPaymentRouter.get('/', verifyToken as RequestHandler, methodPaymentController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/methodPayments/:id
methodPaymentRouter.get('/:id', verifyToken as RequestHandler, methodPaymentController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/methodPayments/
methodPaymentRouter.post('/', verifyToken as RequestHandler, methodPaymentController.store as RequestHandler)

// PUT - http://localhost:3000/api/v1/methodPayments/:id
methodPaymentRouter.put('/:id', verifyToken as RequestHandler, methodPaymentController.update as RequestHandler)

// DELETE - http://localhost:3000/api/v1/methodPayments/:id
methodPaymentRouter.delete('/:id', verifyToken as RequestHandler, methodPaymentController.delete as RequestHandler)

export default methodPaymentRouter
