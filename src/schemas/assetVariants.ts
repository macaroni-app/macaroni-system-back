import { z } from 'zod'

export const AssetVariantSchema = z.object({
  name: z.string().min(1),
  baseAsset: z.string().min(24).max(24),
  values: z.array(z.string().min(24).max(24)).optional(),
  sku: z.string().optional(),
  costPrice: z.number().nonnegative().optional(),
  isDeleted: z.boolean().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  createdBy: z.string().min(24).max(24).optional(),
  updatedBy: z.string().min(24).max(24).optional()
})

export const CreateAssetVariantSchema = z.object({
  body: AssetVariantSchema
})

export const UpdateAssetVariantSchema = z.object({
  body: AssetVariantSchema,
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const GetAssetVariantSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24).optional()
  }),
  query: z.object({
    id: z.string().min(24).max(24).optional(),
    baseAsset: z.string().min(24).max(24).optional()
  })
})

export const DeleteAssetVariantSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const ChangeIsActiveAssetVariantSchema = z.object({
  body: z.object({
    isActive: z.boolean().optional()
  }),
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export type AssetVariantType = z.infer<typeof AssetVariantSchema>
export type CreateAssetVariantBodyType = z.infer<typeof CreateAssetVariantSchema>['body']
export type UpdateAssetVariantBodyType = z.infer<typeof UpdateAssetVariantSchema>['body']
export type UpdateAssetVariantParamsType = z.infer<typeof UpdateAssetVariantSchema>['params']
export type GetAssetVariantParamsType = z.infer<typeof GetAssetVariantSchema>['params']
export type GetAssetVariantQueryType = z.infer<typeof GetAssetVariantSchema>['query']
export type DeleteAssetVariantParamsType = z.infer<typeof DeleteAssetVariantSchema>['params']
export type ChangeIsActiveAssetVariantBodyType = z.infer<typeof ChangeIsActiveAssetVariantSchema>['body']
export type ChangeIsActiveAssetVariantParamsType = z.infer<typeof ChangeIsActiveAssetVariantSchema>['params']
