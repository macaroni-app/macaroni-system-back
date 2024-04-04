import { z } from 'zod'

export const ProductItemsSchema = z.object({
  product: z.string().min(24).max(24),
  asset: z.string().min(24).max(24),
  quantity: z.number().nonnegative(),
  isDeleted: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  createdBy: z.string().min(24).max(24).optional(),
  updatedBy: z.string().min(24).max(24).optional()
})

export const CreateProductItemsSchema = z.object({
  body: ProductItemsSchema
})

export const UpdateProductItemsSchema = z.object({
  body: ProductItemsSchema,
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const GetProductItemsSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24).optional()
  }),
  query: z.object({
    id: z.string().min(24).max(24).optional()
  })
})

export const DeleteProductItemsSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export type ProductItemsType = z.infer<typeof ProductItemsSchema>
export type CreateProductItemsBodyType = z.infer<typeof CreateProductItemsSchema>['body']
export type UpdateProductItemsBodyType = z.infer<typeof UpdateProductItemsSchema>['body']
export type UpdateProductItemsParamsType = z.infer<typeof UpdateProductItemsSchema>['params']
export type GetProductItemsParamsType = z.infer<typeof GetProductItemsSchema>['params']
export type GetProductItemsQueryType = z.infer<typeof GetProductItemsSchema>['query']
export type DeleteProductItemsParamsType = z.infer<typeof DeleteProductItemsSchema>['params']
