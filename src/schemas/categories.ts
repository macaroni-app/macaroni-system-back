import { z } from 'zod'

export const CategorySchema = z.object({
  name: z.string().min(1),
  isDeleted: z.boolean().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  createdBy: z.string().min(24).max(24).optional(),
  updatedBy: z.string().min(24).max(24).optional()
})

export const CreateCategorySchema = z.object({
  body: CategorySchema
})

export const UpdateCategorySchema = z.object({
  body: CategorySchema,
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const GetCategorySchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24).optional()
  }),
  query: z.object({
    id: z.string().min(24).max(24).optional()
  })
})

export const DeleteCategorySchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export type CategoryType = z.infer<typeof CategorySchema>
export type CreateCategoryBodyType = z.infer<typeof CreateCategorySchema>['body']
export type UpdateCategoryBodyType = z.infer<typeof UpdateCategorySchema>['body']
export type UpdateCategoryParamsType = z.infer<typeof UpdateCategorySchema>['params']
export type GetCategoryParamsType = z.infer<typeof GetCategorySchema>['params']
export type GetCategoryQueryType = z.infer<typeof GetCategorySchema>['query']
export type DeleteCategoryParamsType = z.infer<typeof DeleteCategorySchema>['params']
