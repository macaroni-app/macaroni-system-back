import { RequestHandler, Router } from 'express'

import ordersController from '../controllers/orderRequests'

import verifyToken from '../middlewares/validate-token'
import { schemaValidator } from '../middlewares/schemaValidator'
import { AddOrderRequestPaymentBodyType, AddOrderRequestPaymentSchema, ConvertOrderRequestBodyType, ConvertOrderRequestSchema, CreateOrderRequestSchema, DeleteOrderRequestParamsType, DeleteOrderRequestSchema, GetOrderRequestSchema, OrderRequestActionParamsType, OrderRequestActionParamsSchema, UpdateOrderRequestBodyType, UpdateOrderRequestParamsSchema, UpdateOrderRequestParamsType, UpdateOrderRequestQueryType, UpdateOrderRequestSchema } from '../schemas/orderRequests'

import verifyRole from '../middlewares/verifyRoles'

import ProfileBase from '../permissions/ProfileBase'

const orderRequestsRouter = Router()

// GET - http://localhost:3000/api/v1/orders
orderRequestsRouter.get('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.orderRequests.view), schemaValidator(GetOrderRequestSchema)], ordersController.getAll as RequestHandler)

// GET - http://localhost:3000/api/v1/orders/:id
orderRequestsRouter.get('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.orderRequests.view), schemaValidator(GetOrderRequestSchema)], ordersController.getOne as RequestHandler)

// POST - http://localhost:3000/api/v1/orders
orderRequestsRouter.post('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.orderRequests.create), schemaValidator(CreateOrderRequestSchema)], ordersController.store as RequestHandler)

orderRequestsRouter.post('/:id/confirm', [verifyToken as RequestHandler, verifyRole(ProfileBase.orderRequests.edit), schemaValidator(OrderRequestActionParamsSchema)], ordersController.confirm as RequestHandler<OrderRequestActionParamsType, {}, {}, {}>)

orderRequestsRouter.post('/:id/cancel', [verifyToken as RequestHandler, verifyRole(ProfileBase.orderRequests.edit), schemaValidator(OrderRequestActionParamsSchema)], ordersController.cancel as RequestHandler<OrderRequestActionParamsType, {}, {}, {}>)

orderRequestsRouter.post('/:id/payments', [verifyToken as RequestHandler, verifyRole(ProfileBase.orderRequests.edit), schemaValidator(AddOrderRequestPaymentSchema)], ordersController.addPayment as RequestHandler<OrderRequestActionParamsType, {}, AddOrderRequestPaymentBodyType, {}>)

orderRequestsRouter.post('/:id/convertToSale', [verifyToken as RequestHandler, verifyRole(ProfileBase.orderRequests.edit), schemaValidator(ConvertOrderRequestSchema)], ordersController.convertToSale as RequestHandler<OrderRequestActionParamsType, {}, ConvertOrderRequestBodyType, {}>)

// PUT - http://localhost:3000/api/v1/orders/:id
orderRequestsRouter.put('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.orderRequests.edit), schemaValidator(UpdateOrderRequestParamsSchema)], ordersController.update as unknown as RequestHandler<UpdateOrderRequestParamsType, {}, UpdateOrderRequestBodyType, UpdateOrderRequestQueryType>)

// Legacy PUT - http://localhost:3000/api/v1/orders/cancelledSale?id=:id
orderRequestsRouter.put('/cancelledSale', [verifyToken as RequestHandler, verifyRole(ProfileBase.orderRequests.edit), schemaValidator(UpdateOrderRequestSchema)], ordersController.update as RequestHandler<{}, {}, UpdateOrderRequestBodyType, UpdateOrderRequestQueryType>)

// DELETE - http://localhost:3000/api/v1/orders/:id
orderRequestsRouter.delete('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.orderRequests.delete), schemaValidator(DeleteOrderRequestSchema)], ordersController.delete as RequestHandler<DeleteOrderRequestParamsType, {}, {}, {}>)

export default orderRequestsRouter
