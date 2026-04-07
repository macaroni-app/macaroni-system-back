import { Request, Response } from 'express'
import { orderRequestServices } from '../services/orderRequests'
import { INVALID_ORDER_REQUEST_STATUS, INVALID_PAYMENT_AMOUNT, MISSING_FIELDS_REQUIRED, NOT_FOUND, ORDER_REQUEST_ALREADY_CONVERTED, ORDER_REQUEST_HAS_PENDING_AMOUNT } from '../labels/labels'
import { AddOrderRequestPaymentBodyType, ConvertOrderRequestBodyType, CreateOrderRequestBodyType, DeleteOrderRequestParamsType, GetOrderRequestParamsType, GetOrderRequestQueryType, OrderRequestActionParamsType, OrderRequestType, UpdateOrderRequestBodyType, UpdateOrderRequestQueryType } from '../schemas/orderRequests'
import { orderRequestItemsService } from '../services/orderRequestItems'
import { OrderRequestItemType } from '../schemas/orderRequestItems'
import { orderRequestWorkflowService } from '../services/orderRequestWorkflow'
import OrderRequest, { IOrderRequestPayment, OrderRequestStatus } from '../models/orderRequests'
import { orderRequestCodeService } from '../services/orderRequestCode'
import { clientService } from '../services/clients'

type OrderRequestDocumentLike = OrderRequestType & {
  _id: string
  _doc: Record<string, unknown>
}

const normalizeOrderRequestPayments = (payments: Array<{
  amount?: number
  paymentMethod?: string | { _id?: string }
  createdAt?: Date | string
  createdBy?: string | { _id?: string }
  note?: string
}> | undefined): IOrderRequestPayment[] => {
  return (payments ?? []).map((payment) => ({
    amount: Number(payment.amount ?? 0),
    paymentMethod: typeof payment.paymentMethod === 'string'
      ? payment.paymentMethod
      : String(payment.paymentMethod?._id ?? ''),
    createdAt: payment.createdAt !== undefined ? new Date(payment.createdAt) : new Date(),
    createdBy: typeof payment.createdBy === 'string'
      ? payment.createdBy
      : String(payment.createdBy?._id ?? ''),
    note: payment.note
  }))
}

const attachItemsToOrders = async (orderRequests: OrderRequestDocumentLike[]): Promise<Array<Record<string, unknown> & { items: OrderRequestItemType[] }>> => {
  const orderRequestIds = orderRequests.map((orderRequest) => String(orderRequest._id))

  const orderRequestItems = await orderRequestItemsService.getAll({
    orderRequest: {
      $in: orderRequestIds
    }
  })

  const itemsByOrderRequest = new Map<string, OrderRequestItemType[]>()

  orderRequestItems.forEach((orderRequestItem: OrderRequestItemType & { orderRequest: unknown }) => {
    const orderRequestReference = orderRequestItem.orderRequest as string | { _id: string }
    const orderRequestId = typeof orderRequestReference === 'string'
      ? orderRequestReference
      : String(orderRequestReference._id)
    const currentItems = itemsByOrderRequest.get(orderRequestId) ?? []
    currentItems.push(orderRequestItem)
    itemsByOrderRequest.set(orderRequestId, currentItems)
  })

  return orderRequests.map((orderRequest) => ({
    ...orderRequest._doc,
    items: itemsByOrderRequest.get(String(orderRequest._id)) ?? []
  }))
}

const mapWorkflowError = (errorMessage: string): { status: number, message: string } => {
  switch (errorMessage) {
    case NOT_FOUND:
      return { status: 404, message: NOT_FOUND }
    case ORDER_REQUEST_ALREADY_CONVERTED:
      return { status: 409, message: ORDER_REQUEST_ALREADY_CONVERTED }
    case INVALID_ORDER_REQUEST_STATUS:
      return { status: 409, message: INVALID_ORDER_REQUEST_STATUS }
    case INVALID_PAYMENT_AMOUNT:
      return { status: 409, message: INVALID_PAYMENT_AMOUNT }
    case ORDER_REQUEST_HAS_PENDING_AMOUNT:
      return { status: 409, message: ORDER_REQUEST_HAS_PENDING_AMOUNT }
    default:
      return { status: 400, message: errorMessage }
  }
}

const orderRequestsController = {
  getAll: async (req: Request<{}, {}, {}, GetOrderRequestQueryType>, res: Response): Promise<Response> => {
    const { id, orderCode, clientName } = req.query

    const all = req.query.all === 'true'

    let startDate = new Date()
    let endDate = new Date()

    if (req.query.startDate !== undefined) {
      startDate = new Date(req.query.startDate)
    }

    if (req.query.endDate !== undefined) {
      endDate = new Date(req.query.endDate)
      endDate.setDate(endDate.getDate() + 1)
    }

    const firstDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    const lastDayOfMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0)

    if (req.query.startDate === undefined && req.query.endDate === undefined) {
      startDate = firstDayOfMonth
      endDate = lastDayOfMonth
    }

    const filters = {
      $expr: {
        $and: [
          { $eq: ['$isDeleted', false] },
          { $gte: ['$createdAt', startDate] },
          { $lte: ['$createdAt', endDate] }
        ]
      }
    }

    let queryFilters

    if (orderCode !== undefined && orderCode !== null && orderCode !== '') {
      queryFilters = { orderCode }
    } else if (clientName !== undefined && clientName.trim() !== '') {
      const clients = await clientService.getAll({
        name: {
          $regex: clientName.trim(),
          $options: 'i'
        }
      })

      const clientIds = clients.map((client: { _id: string }) => String(client._id))

      if (clientIds.length === 0) {
        return res.status(200).json({
          status: 200,
          total: 0,
          data: []
        })
      }

      queryFilters = {
        client: {
          $in: clientIds
        },
        status: {
          $in: [OrderRequestStatus.DRAFT, OrderRequestStatus.CONFIRMED]
        },
        isDeleted: false
      }
    } else {
      queryFilters = (id === undefined || id === null)
        ? !all
            ? filters
            : {}
        : {
            $expr: {
              $and: [{ $eq: ['$_id', id] }]
            }
          }
    }

    const orderRequests = await orderRequestServices.getAll(queryFilters)

    const orderRequestsWithItems = await attachItemsToOrders(orderRequests)

    return res.status(200).json({
      status: 200,
      total: orderRequestsWithItems.length,
      data: orderRequestsWithItems
    })
  },
  getOne: async (req: Request<GetOrderRequestParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const orderRequest = await orderRequestServices.getOne({ _id: id })

    if (orderRequest === null || orderRequest === undefined) {
      return res.status(404).json({
        status: 404,
        message: NOT_FOUND
      })
    }

    const [orderRequestWithItems] = await attachItemsToOrders([orderRequest])

    return res.status(200).json({
      status: 200,
      data: orderRequestWithItems
    })
  },
  store: async (req: Request<{}, {}, CreateOrderRequestBodyType, {}>, res: Response): Promise<Response> => {
    if (
      (req.body.isRetail === null || req.body.isRetail === undefined) ||
      (req.body.client === null || req.body.client === undefined) ||
      (req.body.total === null || req.body.total === undefined)
    ) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    try {
      const orderRequestToStore = { ...req.body }
      orderRequestToStore.createdBy = req?.user?.id
      orderRequestToStore.updatedBy = req?.user?.id
      orderRequestToStore.discount = req.body.discount ?? 0
      orderRequestToStore.status = OrderRequestStatus.DRAFT
      orderRequestToStore.orderCode = await orderRequestCodeService.getNextOrderCode()
      const normalizedPayments: IOrderRequestPayment[] = normalizeOrderRequestPayments((req.body.payments ?? []).map((payment) => ({
        ...payment,
        createdAt: new Date(),
        createdBy: req?.user?.id
      })))
      orderRequestToStore.payments = normalizedPayments
      const paymentSummary = orderRequestWorkflowService.getPaymentSummary(
        Number(orderRequestToStore.total),
        normalizedPayments
      )
      orderRequestToStore.paidAmount = paymentSummary.paidAmount
      orderRequestToStore.pendingAmount = paymentSummary.pendingAmount
      orderRequestToStore.paymentStatus = paymentSummary.paymentStatus

      const orderRequestStored: OrderRequestType = await orderRequestServices.store(orderRequestToStore)

      return res.status(201).json({
        status: 201,
        isStored: true,
        data: orderRequestStored
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
  delete: async (req: Request<DeleteOrderRequestParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const orderRequestDeleted = await orderRequestServices.delete(id)

    if (orderRequestDeleted === null || orderRequestDeleted === undefined) {
      return res.status(404).json({
        status: 404,
        isDeleted: false,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      isDeleted: true,
      data: orderRequestDeleted
    })
  },
  update: async (req: Request<{ id?: string }, {}, UpdateOrderRequestBodyType, UpdateOrderRequestQueryType>, res: Response): Promise<Response> => {
    if (
      (req.body.client === null || req.body.client === undefined) ||
      (req.body.total === null || req.body.total === undefined)
    ) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const id = req.params.id ?? req.query.id

    if (id === undefined) {
      return res.status(400).json({
        status: 400,
        isUpdated: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    try {
      const oldOrderRequest = await orderRequestServices.getOne({ _id: id })

      if (oldOrderRequest === null || oldOrderRequest === undefined) {
        return res.status(404).json({
          status: 404,
          isUpdated: false,
          message: NOT_FOUND
        })
      }

      if ([OrderRequestStatus.CONVERTED, OrderRequestStatus.CANCELLED].includes(oldOrderRequest.status as OrderRequestStatus)) {
        return res.status(409).json({
          status: 409,
          isUpdated: false,
          message: oldOrderRequest.status === OrderRequestStatus.CONVERTED ? ORDER_REQUEST_ALREADY_CONVERTED : INVALID_ORDER_REQUEST_STATUS
        })
      }

      const newOrderRequestData = {
        ...oldOrderRequest._doc,
        ...req.body,
        payments: normalizeOrderRequestPayments(oldOrderRequest.payments as Array<{
          amount?: number
          paymentMethod?: string | { _id?: string }
          createdAt?: Date
          createdBy?: string | { _id?: string }
          note?: string
        }>),
        paidAmount: oldOrderRequest.paidAmount,
        pendingAmount: oldOrderRequest.pendingAmount,
        paymentStatus: oldOrderRequest.paymentStatus,
        status: oldOrderRequest.status,
        orderCode: oldOrderRequest.orderCode,
        convertedSale: oldOrderRequest.convertedSale,
        reservedItems: oldOrderRequest.reservedItems,
        confirmedAt: oldOrderRequest.confirmedAt,
        cancelledAt: oldOrderRequest.cancelledAt,
        convertedAt: oldOrderRequest.convertedAt,
        updatedAt: new Date(),
        updatedBy: req?.user?.id
      }

      if (Number(newOrderRequestData.total) < Number(oldOrderRequest.paidAmount ?? 0)) {
        return res.status(409).json({
          status: 409,
          isUpdated: false,
          message: INVALID_PAYMENT_AMOUNT
        })
      }

      const normalizedPayments: IOrderRequestPayment[] = normalizeOrderRequestPayments(newOrderRequestData.payments as Array<{
        amount?: number
        paymentMethod?: string | { _id?: string }
        createdAt?: Date | string
        createdBy?: string | { _id?: string }
        note?: string
      }>)
      newOrderRequestData.payments = normalizedPayments

      const paymentSummary = orderRequestWorkflowService.getPaymentSummary(
        Number(newOrderRequestData.total),
        normalizedPayments
      )

      newOrderRequestData.paidAmount = paymentSummary.paidAmount
      newOrderRequestData.pendingAmount = paymentSummary.pendingAmount
      newOrderRequestData.paymentStatus = paymentSummary.paymentStatus

      const orderRequestUpdated = await orderRequestServices.update(id, newOrderRequestData)

      if (oldOrderRequest.status === OrderRequestStatus.CONFIRMED && req.user?.id !== undefined) {
        await orderRequestWorkflowService.syncReservation(id, req.user.id)
      }

      return res.status(200).json({
        status: 200,
        isUpdated: true,
        data: orderRequestUpdated
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
  confirm: async (req: Request<OrderRequestActionParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    try {
      const orderRequest = await orderRequestWorkflowService.confirm(req.params.id, req.user?.id ?? '')

      return res.status(200).json({
        status: 200,
        isUpdated: true,
        data: orderRequest
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
  cancel: async (req: Request<OrderRequestActionParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    try {
      const orderRequest = await orderRequestWorkflowService.cancel(req.params.id, req.user?.id ?? '')

      return res.status(200).json({
        status: 200,
        isUpdated: true,
        data: orderRequest
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
  addPayment: async (req: Request<OrderRequestActionParamsType, {}, AddOrderRequestPaymentBodyType, {}>, res: Response): Promise<Response> => {
    try {
      const orderRequest = await orderRequestWorkflowService.addPayment(
        req.params.id,
        req.body,
        req.user?.id ?? ''
      )

      const updatedOrderRequest = await orderRequestServices.getOne({ _id: orderRequest.id })

      return res.status(200).json({
        status: 200,
        isUpdated: true,
        data: updatedOrderRequest
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
  convertToSale: async (req: Request<OrderRequestActionParamsType, {}, ConvertOrderRequestBodyType, {}>, res: Response): Promise<Response> => {
    try {
      const orderRequest = await orderRequestWorkflowService.convertToSale(req.params.id, req.body, req.user?.id ?? '')

      const updatedOrderRequest = await OrderRequest.findById(orderRequest.id)

      return res.status(200).json({
        status: 200,
        isUpdated: true,
        data: updatedOrderRequest
      })
    } catch (error) {
      const mappedError = mapWorkflowError((error as Error).message)
      return res.status(mappedError.status).json({
        status: mappedError.status,
        isUpdated: false,
        message: mappedError.message
      })
    }
  }
}

export default orderRequestsController
