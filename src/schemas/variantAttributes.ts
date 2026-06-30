import { z } from 'zod'

export const VariantAttributeSchema = z.object({
  name: z.string().min(1),
  isDeleted: z.boolean().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  createdBy: z.string().min(24).max(24).optional(),
  updatedBy: z.string().min(24).max(24).optional()
})

export const CreateVariantAttributeSchema = z.object({
  body: VariantAttributeSchema
})

export const UpdateVariantAttributeSchema = z.object({
  body: VariantAttributeSchema,
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const GetVariantAttributeSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24).optional()
  }),
  query: z.object({
    id: z.string().min(24).max(24).optional()
  })
})

export const DeleteVariantAttributeSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const ChangeIsActiveVariantAttributeSchema = z.object({
  body: z.object({
    isActive: z.boolean().optional()
  }),
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export type VariantAttributeType = z.infer<typeof VariantAttributeSchema>
export type CreateVariantAttributeBodyType = z.infer<typeof CreateVariantAttributeSchema>['body']
export type UpdateVariantAttributeBodyType = z.infer<typeof UpdateVariantAttributeSchema>['body']
export type UpdateVariantAttributeParamsType = z.infer<typeof UpdateVariantAttributeSchema>['params']
export type GetVariantAttributeParamsType = z.infer<typeof GetVariantAttributeSchema>['params']
export type GetVariantAttributeQueryType = z.infer<typeof GetVariantAttributeSchema>['query']
export type DeleteVariantAttributeParamsType = z.infer<typeof DeleteVariantAttributeSchema>['params']
export type ChangeIsActiveVariantAttributeBodyType = z.infer<typeof ChangeIsActiveVariantAttributeSchema>['body']
export type ChangeIsActiveVariantAttributeParamsType = z.infer<typeof ChangeIsActiveVariantAttributeSchema>['params']
