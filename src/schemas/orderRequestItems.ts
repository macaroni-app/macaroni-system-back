import { z } from 'zod'

export const OrderRequestItemSchema = z.object({
  id: z.string().optional(),
  orderRequest: z.string().min(24).max(24).optional(),
  product: z.string().min(24).max(24).optional(),
  quantity: z.number().positive().optional(),
  unitPrice: z.number().nonnegative().optional(),
  subtotal: z.number().nonnegative().optional(),
  isDeleted: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  createdBy: z.string().min(24).max(24).optional(),
  updatedBy: z.string().min(24).max(24).optional()
})

export const CreateOrderRequestItemSchema = z.object({
  body: OrderRequestItemSchema
})

export const CreateManyOrderRequestItemsSchema = z.object({
  body: z.object({
    orderRequestItems: z.array(OrderRequestItemSchema)
  })
})

export const UpdateOrderRequestItemSchema = z.object({
  body: OrderRequestItemSchema,
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const DeleteManyOrderRequestItemsSchema = z.object({
  body: z.object({
    orderRequestItems: z.array(OrderRequestItemSchema)
  })
})

export const GetOrderRequestItemSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24).optional()
  }),
  query: z.object({
    id: z.string().min(24).max(24).optional(),
    all: z.string().optional()
  })
})

export const DeleteOrderRequestItemSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export type OrderRequestItemType = z.infer<typeof OrderRequestItemSchema>
export type CreateOrderRequestItemBodyType = z.infer<typeof CreateOrderRequestItemSchema>['body']
export type CreateManyOrderRequestItemsBodyType = z.infer<typeof CreateManyOrderRequestItemsSchema>['body']
export type DeleteManyOrderRequestItemsBodyType = z.infer<typeof DeleteManyOrderRequestItemsSchema>['body']
export type UpdateOrderRequestItemBodyType = z.infer<typeof UpdateOrderRequestItemSchema>['body']
export type UpdateOrderRequestItemParamsType = z.infer<typeof UpdateOrderRequestItemSchema>['params']
export type GetOrderRequestItemParamsType = z.infer<typeof GetOrderRequestItemSchema>['params']
export type GetOrderRequestItemQueryType = z.infer<typeof GetOrderRequestItemSchema>['query']
export type DeleteOrderRequestItemParamsType = z.infer<typeof DeleteOrderRequestItemSchema>['params']
