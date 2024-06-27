import { z } from 'zod'

export const SaleSchema = z.object({
  isRetail: z.boolean().optional(),
  client: z.string().min(24).max(24).optional(),
  paymentMethod: z.string().min(24).max(24).optional(),
  costTotal: z.number().nonnegative(),
  total: z.number().nonnegative(),
  status: z.enum(['PAID', 'CANCELLED']),
  isDeleted: z.boolean().optional(),
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
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const GetSaleSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24).optional()
  }),
  query: z.object({
    id: z.string().min(24).max(24).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
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
export type UpdateSaleParamsType = z.infer<typeof UpdateSaleSchema>['params']
export type GetSaleParamsType = z.infer<typeof GetSaleSchema>['params']
export type GetSaleQueryType = z.infer<typeof GetSaleSchema>['query']
export type DeleteSaleParamsType = z.infer<typeof DeleteSaleSchema>['params']
