import { z } from 'zod'

export const VariantAttributeValueSchema = z.object({
  name: z.string().min(1),
  attribute: z.string().min(24).max(24),
  isDeleted: z.boolean().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  createdBy: z.string().min(24).max(24).optional(),
  updatedBy: z.string().min(24).max(24).optional()
})

export const CreateVariantAttributeValueSchema = z.object({
  body: VariantAttributeValueSchema
})

export const UpdateVariantAttributeValueSchema = z.object({
  body: VariantAttributeValueSchema,
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const GetVariantAttributeValueSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24).optional()
  }),
  query: z.object({
    id: z.string().min(24).max(24).optional(),
    attribute: z.string().min(24).max(24).optional()
  })
})

export const DeleteVariantAttributeValueSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const ChangeIsActiveVariantAttributeValueSchema = z.object({
  body: z.object({
    isActive: z.boolean().optional()
  }),
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export type VariantAttributeValueType = z.infer<typeof VariantAttributeValueSchema>
export type CreateVariantAttributeValueBodyType = z.infer<typeof CreateVariantAttributeValueSchema>['body']
export type UpdateVariantAttributeValueBodyType = z.infer<typeof UpdateVariantAttributeValueSchema>['body']
export type UpdateVariantAttributeValueParamsType = z.infer<typeof UpdateVariantAttributeValueSchema>['params']
export type GetVariantAttributeValueParamsType = z.infer<typeof GetVariantAttributeValueSchema>['params']
export type GetVariantAttributeValueQueryType = z.infer<typeof GetVariantAttributeValueSchema>['query']
export type DeleteVariantAttributeValueParamsType = z.infer<typeof DeleteVariantAttributeValueSchema>['params']
export type ChangeIsActiveVariantAttributeValueBodyType = z.infer<typeof ChangeIsActiveVariantAttributeValueSchema>['body']
export type ChangeIsActiveVariantAttributeValueParamsType = z.infer<typeof ChangeIsActiveVariantAttributeValueSchema>['params']
