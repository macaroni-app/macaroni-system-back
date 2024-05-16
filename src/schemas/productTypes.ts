import { z } from 'zod'

export const ProductTypeSchema = z.object({
  name: z.string().min(1),
  isDeleted: z.boolean().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  createdBy: z.string().min(24).max(24).optional(),
  updatedBy: z.string().min(24).max(24).optional()
})

export const CreateProductTypeSchema = z.object({
  body: ProductTypeSchema
})

export const UpdateProductTypeSchema = z.object({
  body: ProductTypeSchema,
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const GetProductTypeSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24).optional()
  }),
  query: z.object({
    id: z.string().min(24).max(24).optional()
  })
})

export const DeleteProductTypeSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const ChangeIsActiveProductTypeSchema = z.object({
  body: z.object({
    isActive: z.boolean().optional()
  }),
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export type ProductTypeType = z.infer<typeof ProductTypeSchema>
export type CreateProductTypeBodyType = z.infer<typeof CreateProductTypeSchema>['body']
export type UpdateProductTypeBodyType = z.infer<typeof UpdateProductTypeSchema>['body']
export type UpdateProductTypeParamsType = z.infer<typeof UpdateProductTypeSchema>['params']
export type GetProductTypeParamsType = z.infer<typeof GetProductTypeSchema>['params']
export type GetProductTypeQueryType = z.infer<typeof GetProductTypeSchema>['query']
export type DeleteProductTypeParamsType = z.infer<typeof DeleteProductTypeSchema>['params']
export type ChangeIsActiveProductTypeBodyType = z.infer<typeof ChangeIsActiveProductTypeSchema>['body']
export type ChangeIsActiveProductTypeParamsType = z.infer<typeof ChangeIsActiveProductTypeSchema>['params']
