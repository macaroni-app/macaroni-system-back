import { z } from 'zod'

export const SaleSchema = z.object({
  isRetail: z.boolean().optional(),
  client: z.string().min(24).max(24).optional(),
  business: z.string().min(24).max(24).optional(),
  paymentMethod: z.string().min(24).max(24).optional(),
  costTotal: z.number().nonnegative().optional(),
  total: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),
  status: z.enum(['PAID', 'CANCELLED']).optional(),
  isDeleted: z.boolean().optional(),
  isBilled: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  createdBy: z.string().min(24).max(24).optional(),
  updatedBy: z.string().min(24).max(24).optional()
})

export const CreateSaleSchema = z.object({
  body: SaleSchema
})

export const UpdateSaleSchema = z.object({
  body: SaleSchema,
  query: z.object({
    id: z.string().min(24).max(24)
  })
})

export const GetSaleSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24).optional()
  }),
  query: z.object({
    id: z.string().min(24).max(24).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    all: z.string().optional(),
    historyMonthToRetrieve: z.string().optional()
  })
})

export const DeleteSaleSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export type SaleType = z.infer<typeof SaleSchema>
export type CreateSaleBodyType = z.infer<typeof CreateSaleSchema>['body']
export type UpdateSaleBodyType = z.infer<typeof UpdateSaleSchema>['body']
export type UpdateSaleQueryType = z.infer<typeof UpdateSaleSchema>['query']
export type GetSaleParamsType = z.infer<typeof GetSaleSchema>['params']
export type GetSaleQueryType = z.infer<typeof GetSaleSchema>['query']
export type DeleteSaleParamsType = z.infer<typeof DeleteSaleSchema>['params']
