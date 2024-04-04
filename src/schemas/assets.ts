import { z } from 'zod'

export const AssetSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(24).max(24).optional(),
  isDeleted: z.boolean().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  createdBy: z.string().min(24).max(24).optional(),
  updatedBy: z.string().min(24).max(24).optional()
})

export const CreateAssetSchema = z.object({
  body: AssetSchema
})

export const UpdateAssetSchema = z.object({
  body: AssetSchema,
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const GetAssetSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24).optional()
  }),
  query: z.object({
    id: z.string().min(24).max(24).optional()
  })
})

export const DeleteAssetSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export type AssetType = z.infer<typeof AssetSchema>
export type CreateAssetBodyType = z.infer<typeof CreateAssetSchema>['body']
export type UpdateAssetBodyType = z.infer<typeof UpdateAssetSchema>['body']
export type UpdateAssetParamsType = z.infer<typeof UpdateAssetSchema>['params']
export type GetAssetParamsType = z.infer<typeof GetAssetSchema>['params']
export type GetAssetQueryType = z.infer<typeof GetAssetSchema>['query']
export type DeleteAssetParamsType = z.infer<typeof DeleteAssetSchema>['params']
