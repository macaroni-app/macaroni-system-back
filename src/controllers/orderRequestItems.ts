import { Request, Response } from 'express'
import { INVALID_ORDER_REQUEST_STATUS, MISSING_FIELDS_REQUIRED, NOT_FOUND, ORDER_REQUEST_ALREADY_CONVERTED, ORDER_REQUEST_HAS_NO_ITEMS } from '../labels/labels'
import { orderRequestItemsService } from '../services/orderRequestItems'
import { CreateManyOrderRequestItemsBodyType, CreateOrderRequestItemBodyType, DeleteManyOrderRequestItemsBodyType, DeleteOrderRequestItemParamsType, GetOrderRequestItemParamsType, GetOrderRequestItemQueryType, OrderRequestItemType, UpdateOrderRequestItemBodyType, UpdateOrderRequestItemParamsType } from '../schemas/orderRequestItems'
import { IOrderRequestItem } from '../models/orderRequestItems'
import OrderRequest, { OrderRequestStatus } from '../models/orderRequests'
import OrderRequestItem from '../models/orderRequestItems'
import { orderRequestWorkflowService } from '../services/orderRequestWorkflow'

const mapWorkflowError = (errorMessage: string): { status: number, message: string } => {
  switch (errorMessage) {
    case NOT_FOUND:
      return { status: 404, message: NOT_FOUND }
    case ORDER_REQUEST_ALREADY_CONVERTED:
      return { status: 409, message: ORDER_REQUEST_ALREADY_CONVERTED }
    case INVALID_ORDER_REQUEST_STATUS:
      return { status: 409, message: INVALID_ORDER_REQUEST_STATUS }
    case ORDER_REQUEST_HAS_NO_ITEMS:
      return { status: 409, message: ORDER_REQUEST_HAS_NO_ITEMS }
    default:
      return { status: 400, message: errorMessage }
  }
}

const syncOrderIfConfirmed = async (orderRequestId: string, userId: string | undefined): Promise<void> => {
  if (userId === undefined) {
    return
  }

  const orderRequest = await OrderRequest.findById(orderRequestId)

  if (orderRequest === null) {
    throw new Error(NOT_FOUND)
  }

  if (orderRequest.status === OrderRequestStatus.CONVERTED) {
    throw new Error(ORDER_REQUEST_ALREADY_CONVERTED)
  }

  if (orderRequest.status === OrderRequestStatus.CANCELLED) {
    throw new Error(INVALID_ORDER_REQUEST_STATUS)
  }

  if (orderRequest.status === OrderRequestStatus.CONFIRMED) {
    await orderRequestWorkflowService.syncReservation(orderRequestId, userId)
  }
}

const orderRequestItemsController = {
  getAll: async (req: Request<{}, {}, {}, GetOrderRequestItemQueryType>, res: Response): Promise<Response> => {
    const { id } = req.query
    const all = req.query.all === 'true'

    const orderRequestItems: OrderRequestItemType[] = await orderRequestItemsService.getAll(
      (id === undefined || id === null)
        ? !all
            ? { isDeleted: false }
            : {}
        : {
            $expr: {
              $and: [{ $eq: ['$orderRequest', id] }]
            }
          }
    )

    return res.status(200).json({
      status: 200,
      total: orderRequestItems.length,
      data: orderRequestItems
    })
  },
  getOne: async (req: Request<GetOrderRequestItemParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const orderRequestItem: OrderRequestItemType = await orderRequestItemsService.getOne({ _id: id })

    if (orderRequestItem === null || orderRequestItem === undefined) {
      return res.status(404).json({
        status: 404,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      data: orderRequestItem
    })
  },
  store: async (req: Request<{}, {}, CreateOrderRequestItemBodyType, {}>, res: Response): Promise<Response> => {
    if (
      req.body.orderRequest === null || req.body.orderRequest === undefined ||
      req.body.product === null || req.body.product === undefined ||
      req.body.quantity === null || req.body.quantity === undefined ||
      req.body.unitPrice === null || req.body.unitPrice === undefined ||
      req.body.subtotal === null || req.body.subtotal === undefined
    ) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    try {
      const orderRequestItemToStore = { ...req.body }
      orderRequestItemToStore.createdBy = req?.user?.id
      orderRequestItemToStore.updatedBy = req?.user?.id

      const orderRequestItemStored: OrderRequestItemType = await orderRequestItemsService.store(orderRequestItemToStore)
      await syncOrderIfConfirmed(req.body.orderRequest, req.user?.id)

      return res.status(201).json({
        status: 201,
        isStored: true,
        data: orderRequestItemStored
      })
    } catch (error) {
      const mappedError = mapWorkflowError((error as Error).message)
      return res.status(mappedError.status).json({
        status: mappedError.status,
        isStored: false,
        message: mappedError.message
      })
    }
  },
  update: async (req: Request<UpdateOrderRequestItemParamsType, {}, UpdateOrderRequestItemBodyType, {}>, res: Response): Promise<Response> => {
    if (
      req.body.orderRequest === null || req.body.orderRequest === undefined ||
      req.body.product === null || req.body.product === undefined ||
      req.body.quantity === null || req.body.quantity === undefined ||
      req.body.unitPrice === null || req.body.unitPrice === undefined ||
      req.body.subtotal === null || req.body.subtotal === undefined
    ) {
      return res.status(400).json({
        status: 400,
        isUpdated: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const { id } = req.params
    const oldOrderRequestItem = await orderRequestItemsService.getOne({ _id: id })

    if (oldOrderRequestItem === null || oldOrderRequestItem === undefined) {
      return res.status(404).json({
        status: 404,
        isUpdated: false,
        message: NOT_FOUND
      })
    }

    try {
      const newOrderRequestItemData = { ...oldOrderRequestItem._doc, ...req.body, updatedAt: new Date(), updatedBy: req.user?.id }
      const orderRequestItemUpdated = await orderRequestItemsService.update(id, newOrderRequestItemData)
      await syncOrderIfConfirmed(req.body.orderRequest, req.user?.id)

      return res.status(200).json({
        status: 200,
        isUpdated: true,
        data: orderRequestItemUpdated
      })
    } catch (error) {
      const mappedError = mapWorkflowError((error as Error).message)
      return res.status(mappedError.status).json({
        status: mappedError.status,
        isUpdated: false,
        message: mappedError.message
      })
    }
  },
  delete: async (req: Request<DeleteOrderRequestItemParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const orderRequestItem = await OrderRequestItem.findById(id)
    if (orderRequestItem === null) {
      return res.status(404).json({
        status: 404,
        isDeleted: false,
        message: NOT_FOUND
      })
    }

    const orderRequest = await OrderRequest.findById(orderRequestItem.orderRequest)
    if (orderRequest !== null && orderRequest.status === OrderRequestStatus.CONFIRMED) {
      const itemsCount = await OrderRequestItem.countDocuments({ orderRequest: orderRequest.id, isDeleted: false })
      if (itemsCount <= 1) {
        return res.status(409).json({
          status: 409,
          isDeleted: false,
          message: ORDER_REQUEST_HAS_NO_ITEMS
        })
      }
    }

    try {
      const orderRequestDeleted = await orderRequestItemsService.delete(id)
      await syncOrderIfConfirmed(String(orderRequestItem.orderRequest), req.user?.id)

      return res.status(200).json({
        status: 200,
        isDeleted: true,
        data: orderRequestDeleted
      })
    } catch (error) {
      const mappedError = mapWorkflowError((error as Error).message)
      return res.status(mappedError.status).json({
        status: mappedError.status,
        isDeleted: false,
        message: mappedError.message
      })
    }
  },
  storeMany: async (req: Request<{}, {}, CreateManyOrderRequestItemsBodyType, {}>, res: Response): Promise<Response> => {
    if (req.body.orderRequestItems === undefined || req.body.orderRequestItems.length === 0) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    try {
      const orderRequestItemsToStore = req.body.orderRequestItems.map((orderRequestItem) => ({
        ...orderRequestItem,
        createdBy: req.user?.id,
        updatedBy: req.user?.id
      })) as unknown as IOrderRequestItem[]

      const data = await orderRequestItemsService.storeMany(orderRequestItemsToStore)
      const orderRequestIds = [...new Set(req.body.orderRequestItems.map((orderRequestItem) => orderRequestItem.orderRequest).filter((orderRequestId): orderRequestId is string => orderRequestId !== undefined))]

      await Promise.all(orderRequestIds.map(async (orderRequestId) => await syncOrderIfConfirmed(orderRequestId, req.user?.id)))

      return res.status(200).json({
        status: 200,
        isStored: true,
        data
      })
    } catch (error) {
      const mappedError = mapWorkflowError((error as Error).message)
      return res.status(mappedError.status).json({
        status: mappedError.status,
        isStored: false,
        message: mappedError.message
      })
    }
  },
  deleteMany: async (req: Request<{}, {}, DeleteManyOrderRequestItemsBodyType, {}>, res: Response): Promise<Response> => {
    if (req.body.orderRequestItems === undefined || req.body.orderRequestItems.length === 0) {
      return res.status(400).json({
        status: 400,
        isDeleted: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const orderRequestItemsIds: string[] = []
    const orderRequestIds = new Set<string>()

    for (const orderRequestItem of req.body.orderRequestItems) {
      if (orderRequestItem.id !== undefined) {
        const currentOrderRequestItem = await OrderRequestItem.findById(orderRequestItem.id)
        if (currentOrderRequestItem !== null) {
          orderRequestIds.add(String(currentOrderRequestItem.orderRequest))
        }
        orderRequestItemsIds.push(orderRequestItem.id)
      }
    }

    try {
      const data = await orderRequestItemsService.deleteMany(orderRequestItemsIds)
      await Promise.all([...orderRequestIds].map(async (orderRequestId) => await syncOrderIfConfirmed(orderRequestId, req.user?.id)))

      return res.status(200).json({
        status: 200,
        isDeleted: true,
        data
      })
    } catch (error) {
      const mappedError = mapWorkflowError((error as Error).message)
      return res.status(mappedError.status).json({
        status: mappedError.status,
        isDeleted: false,
        message: mappedError.message
      })
    }
  }
}

export default orderRequestItemsController
