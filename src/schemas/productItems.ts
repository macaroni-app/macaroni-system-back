import { z } from 'zod'

export const ProductItemsSchema = z.object({
  id: z.string().optional(),
  product: z.string().min(24).max(24).optional(),
  asset: z.string().min(24).max(24).optional(),
  quantity: z.number().nonnegative().optional(),
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

export const CreateManyProductItemsSchema = z.object({
  body: z.object({
    productItems: z.array(ProductItemsSchema)
  })
})

export const UpdateManyProductItemsSchema = z.object({
  body: z.object({
    productItems: z.array(ProductItemsSchema)
  })
})

export const DeleteManyProductItemsSchema = z.object({
  body: z.object({
    productItems: z.array(ProductItemsSchema)
  })
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
export type CreateManyProductItemsBodyType = z.infer<typeof CreateManyProductItemsSchema>['body']
export type UpdateManyProductItemsBodyType = z.infer<typeof UpdateManyProductItemsSchema>['body']
export type DeleteManyProductItemsBodyType = z.infer<typeof DeleteManyProductItemsSchema>['body']
export type UpdateProductItemsBodyType = z.infer<typeof UpdateProductItemsSchema>['body']
export type UpdateProductItemsParamsType = z.infer<typeof UpdateProductItemsSchema>['params']
export type GetProductItemsParamsType = z.infer<typeof GetProductItemsSchema>['params']
export type GetProductItemsQueryType = z.infer<typeof GetProductItemsSchema>['query']
export type DeleteProductItemsParamsType = z.infer<typeof DeleteProductItemsSchema>['params']
