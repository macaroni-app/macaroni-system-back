import { z } from 'zod'

export const ProductSchema = z.object({
  name: z.string().min(1),
  costPrice: z.number().nonnegative(),
  wholesalePrice: z.number().nonnegative(),
  retailsalePrice: z.number().nonnegative(),
  productType: z.string().min(24).max(24).optional(),
  category: z.string().min(24).max(24).optional(),
  isDeleted: z.boolean().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  createdBy: z.string().min(24).max(24).optional(),
  updatedBy: z.string().min(24).max(24).optional()
})

export const CreateProductSchema = z.object({
  body: ProductSchema
})

export const UpdateProductSchema = z.object({
  body: ProductSchema,
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const GetProductSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24).optional()
  }),
  query: z.object({
    id: z.string().min(24).max(24).optional()
  })
})

export const DeleteProductSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export type ProductType = z.infer<typeof ProductSchema>
export type CreateProductBodyType = z.infer<typeof CreateProductSchema>['body']
export type UpdateProductBodyType = z.infer<typeof UpdateProductSchema>['body']
export type UpdateProductParamsType = z.infer<typeof UpdateProductSchema>['params']
export type GetProductParamsType = z.infer<typeof GetProductSchema>['params']
export type GetProductQueryType = z.infer<typeof GetProductSchema>['query']
export type DeleteProductParamsType = z.infer<typeof DeleteProductSchema>['params']
