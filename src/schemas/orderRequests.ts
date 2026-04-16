import { z } from 'zod'

const ReservedOrderInventoryItemSchema = z.object({
  inventory: z.string().min(24).max(24),
  asset: z.string().min(24).max(24),
  quantity: z.number().positive()
})

const OrderRequestPaymentSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.string().min(24).max(24),
  createdAt: z.date().optional(),
  createdBy: z.string().min(24).max(24).optional(),
  note: z.string().optional()
})

export const OrderRequestSchema = z.object({
  orderCode: z.string().optional(),
  isRetail: z.boolean().optional(),
  client: z.string().min(24).max(24).optional(),
  business: z.string().min(24).max(24).optional(),
  total: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),
  payments: z.array(OrderRequestPaymentSchema).optional(),
  paidAmount: z.number().nonnegative().optional(),
  pendingAmount: z.number().nonnegative().optional(),
  paymentStatus: z.enum(['UNPAID', 'PARTIALLY_PAID', 'PAID']).optional(),
  status: z.enum(['DRAFT', 'CONFIRMED', 'CANCELLED', 'CONVERTED']).optional(),
  convertedSale: z.string().min(24).max(24).optional(),
  reservedItems: z.array(ReservedOrderInventoryItemSchema).optional(),
  isDeleted: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  confirmedAt: z.date().optional(),
  cancelledAt: z.date().optional(),
  convertedAt: z.date().optional(),
  createdBy: z.string().min(24).max(24).optional(),
  updatedBy: z.string().min(24).max(24).optional()
})

export const CreateOrderRequestSchema = z.object({
  body: OrderRequestSchema
})

export const UpdateOrderRequestSchema = z.object({
  body: OrderRequestSchema,
  query: z.object({
    id: z.string().min(24).max(24)
  })
})

export const UpdateOrderRequestParamsSchema = z.object({
  body: OrderRequestSchema,
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const GetOrderRequestSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24).optional()
  }),
  query: z.object({
    id: z.string().min(24).max(24).optional(),
    orderCode: z.string().optional(),
    clientName: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    activeOnly: z.string().optional(),
    all: z.string().optional(),
    historyMonthToRetrieve: z.string().optional()
  })
})

export const DeleteOrderRequestSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const OrderRequestActionParamsSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const ConvertOrderRequestSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  }),
  body: z.object({
    business: z.string().min(24).max(24).optional(),
    paymentMethod: z.string().min(24).max(24),
    discount: z.number().nonnegative().optional()
  })
})

export const AddOrderRequestPaymentSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  }),
  body: z.object({
    amount: z.number().positive(),
    paymentMethod: z.string().min(24).max(24),
    note: z.string().optional()
  })
})

export type OrderRequestType = z.infer<typeof OrderRequestSchema>
export type CreateOrderRequestBodyType = z.infer<typeof CreateOrderRequestSchema>['body']
export type UpdateOrderRequestBodyType = z.infer<typeof UpdateOrderRequestSchema>['body']
export type UpdateOrderRequestQueryType = z.infer<typeof UpdateOrderRequestSchema>['query']
export type UpdateOrderRequestParamsType = z.infer<typeof UpdateOrderRequestParamsSchema>['params']
export type GetOrderRequestParamsType = z.infer<typeof GetOrderRequestSchema>['params']
export type GetOrderRequestQueryType = z.infer<typeof GetOrderRequestSchema>['query']
export type DeleteOrderRequestParamsType = z.infer<typeof DeleteOrderRequestSchema>['params']
export type OrderRequestActionParamsType = z.infer<typeof OrderRequestActionParamsSchema>['params']
export type ConvertOrderRequestBodyType = z.infer<typeof ConvertOrderRequestSchema>['body']
export type AddOrderRequestPaymentBodyType = z.infer<typeof AddOrderRequestPaymentSchema>['body']
