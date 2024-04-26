import { z } from 'zod'

export const SaleItemSchema = z.object({
  id: z.string().optional(),
  sale: z.string().min(24).max(24).optional(),
  product: z.string().min(24).max(24).optional(),
  quantity: z.number().nonnegative().optional(),
  subtotal: z.number().nonnegative().optional(),
  isDeleted: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  createdBy: z.string().min(24).max(24).optional(),
  updatedBy: z.string().min(24).max(24).optional()
})

export const CreateSaleItemSchema = z.object({
  body: SaleItemSchema
})

export const CreateManySaleItemsSchema = z.object({
  body: z.object({
    saleItems: z.array(SaleItemSchema)
  })
})

export const UpdateSaleItemSchema = z.object({
  body: SaleItemSchema,
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const DeleteManySaleItemsSchema = z.object({
  body: z.object({
    saleItems: z.array(SaleItemSchema)
  })
})

export const GetSaleItemSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24).optional()
  }),
  query: z.object({
    id: z.string().min(24).max(24).optional()
  })
})

export const DeleteSaleItemSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export type SaleItemType = z.infer<typeof SaleItemSchema>
export type CreateSaleItemBodyType = z.infer<typeof CreateSaleItemSchema>['body']
export type CreateManySaleItemsBodyType = z.infer<typeof CreateManySaleItemsSchema>['body']
export type DeleteManySaleItemsBodyType = z.infer<typeof DeleteManySaleItemsSchema>['body']
export type UpdateSaleItemBodyType = z.infer<typeof UpdateSaleItemSchema>['body']
export type UpdateSaleItemParamsType = z.infer<typeof UpdateSaleItemSchema>['params']
export type GetSaleItemParamsType = z.infer<typeof GetSaleItemSchema>['params']
export type GetSaleItemQueryType = z.infer<typeof GetSaleItemSchema>['query']
export type DeleteSaleItemParamsType = z.infer<typeof DeleteSaleItemSchema>['params']
