import { z } from 'zod'

export const InventoryTransactionSchema = z.object({
  product: z.string().min(24).max(24),
  transactionType: z.enum(['BUY', 'SELL']),
  affectedAmount: z.number().nonnegative(),
  isDeleted: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  createdBy: z.string().min(24).max(24).optional(),
  updatedBy: z.string().min(24).max(24).optional()
})

export const CreateInventoryTransactionSchema = z.object({
  body: InventoryTransactionSchema
})

export const UpdateInventoryTransactionSchema = z.object({
  body: InventoryTransactionSchema,
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const GetInventoryTransactionSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24).optional()
  }),
  query: z.object({
    id: z.string().min(24).max(24).optional()
  })
})

export const DeleteInventoryTransactionSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export type InventoryTransactionType = z.infer<typeof InventoryTransactionSchema>
export type CreateInventoryTransactionBodyType = z.infer<typeof CreateInventoryTransactionSchema>['body']
export type UpdateInventoryTransactionBodyType = z.infer<typeof UpdateInventoryTransactionSchema>['body']
export type UpdateInventoryTransactionParamsType = z.infer<typeof UpdateInventoryTransactionSchema>['params']
export type GetInventoryTransactionParamsType = z.infer<typeof GetInventoryTransactionSchema>['params']
export type GetInventoryTransactionQueryType = z.infer<typeof GetInventoryTransactionSchema>['query']
export type DeleteInventoryTransactionParamsType = z.infer<typeof DeleteInventoryTransactionSchema>['params']
