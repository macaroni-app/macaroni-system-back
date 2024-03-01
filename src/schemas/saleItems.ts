import { z } from 'zod'

export const SaleItemSchema = z.object({
  sale: z.string().min(24).max(24).optional(),
  product: z.string().min(24).max(24).optional(),
  pack: z.string().min(24).max(24).optional(),
  quantity: z.number().nonnegative(),
  subtotal: z.number().nonnegative(),
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

export const UpdateSaleItemSchema = z.object({
  body: SaleItemSchema,
  params: z.object({
    id: z.string().min(24).max(24)
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
export type UpdateSaleItemBodyType = z.infer<typeof UpdateSaleItemSchema>['body']
export type UpdateSaleItemParamsType = z.infer<typeof UpdateSaleItemSchema>['params']
export type GetSaleItemParamsType = z.infer<typeof GetSaleItemSchema>['params']
export type GetSaleItemQueryType = z.infer<typeof GetSaleItemSchema>['query']
export type DeleteSaleItemParamsType = z.infer<typeof DeleteSaleItemSchema>['params']
