import { z } from 'zod'

export const InventorySchema = z.object({
  id: z.string().optional(),
  asset: z.string().min(24).max(24).optional(),
  quantityAvailable: z.number().nonnegative().optional(),
  isDeleted: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  createdBy: z.string().min(24).max(24).optional(),
  updatedBy: z.string().min(24).max(24).optional()
})

export const CreateInventorySchema = z.object({
  body: InventorySchema
})

export const UpdateManyInventorySchema = z.object({
  body: z.object({
    inventories: z.array(InventorySchema)
  })
})

export const UpdateInventorySchema = z.object({
  body: InventorySchema,
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const GetInventorySchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24).optional()
  }),
  query: z.object({
    id: z.string().min(24).max(24).optional()
  })
})

export const DeleteInventorySchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export type InventoryType = z.infer<typeof InventorySchema>
export type CreateInventoryBodyType = z.infer<typeof CreateInventorySchema>['body']
export type UpdateManyInventoriesBodyType = z.infer<typeof UpdateManyInventorySchema>['body']
export type UpdateInventoryBodyType = z.infer<typeof UpdateInventorySchema>['body']
export type UpdateInventoryParamsType = z.infer<typeof UpdateInventorySchema>['params']
export type GetInventoryParamsType = z.infer<typeof GetInventorySchema>['params']
export type GetInventoryQueryType = z.infer<typeof GetInventorySchema>['query']
export type DeleteInventoryParamsType = z.infer<typeof DeleteInventorySchema>['params']
