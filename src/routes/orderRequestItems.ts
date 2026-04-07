import { RequestHandler, Router } from 'express'

import orderRequestItemsController from '../controllers/orderRequestItems'
import verifyToken from '../middlewares/validate-token'
import { schemaValidator } from '../middlewares/schemaValidator'
import { CreateManyOrderRequestItemsSchema, CreateOrderRequestItemSchema, DeleteManyOrderRequestItemsBodyType, DeleteManyOrderRequestItemsSchema, DeleteOrderRequestItemParamsType, DeleteOrderRequestItemSchema, GetOrderRequestItemSchema, UpdateOrderRequestItemBodyType, UpdateOrderRequestItemParamsType, UpdateOrderRequestItemSchema } from '../schemas/orderRequestItems'
import verifyRole from '../middlewares/verifyRoles'
import ProfileBase from '../permissions/ProfileBase'

const orderRequestItemsRouter = Router()

orderRequestItemsRouter.get('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.orderRequestItems.view), schemaValidator(GetOrderRequestItemSchema)], orderRequestItemsController.getAll as RequestHandler)
orderRequestItemsRouter.get('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.orderRequestItems.view), schemaValidator(GetOrderRequestItemSchema)], orderRequestItemsController.getOne as RequestHandler)
orderRequestItemsRouter.post('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.orderRequestItems.create), schemaValidator(CreateOrderRequestItemSchema)], orderRequestItemsController.store as RequestHandler)
orderRequestItemsRouter.post('/bulkCreate', [verifyToken as RequestHandler, verifyRole(ProfileBase.orderRequestItems.create), schemaValidator(CreateManyOrderRequestItemsSchema)], orderRequestItemsController.storeMany as RequestHandler)
orderRequestItemsRouter.put('/bulkDelete', [verifyToken as RequestHandler, verifyRole(ProfileBase.orderRequestItems.delete), schemaValidator(DeleteManyOrderRequestItemsSchema)], orderRequestItemsController.deleteMany as RequestHandler<{}, {}, DeleteManyOrderRequestItemsBodyType, {}>)
orderRequestItemsRouter.put('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.orderRequestItems.edit), schemaValidator(UpdateOrderRequestItemSchema)], orderRequestItemsController.update as RequestHandler<UpdateOrderRequestItemParamsType, {}, UpdateOrderRequestItemBodyType, {}>)
orderRequestItemsRouter.delete('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.orderRequestItems.delete), schemaValidator(DeleteOrderRequestItemSchema)], orderRequestItemsController.delete as RequestHandler<DeleteOrderRequestItemParamsType, {}, {}, {}>)

export default orderRequestItemsRouter
