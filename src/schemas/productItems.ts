import { z } from 'zod'

export const PRODUCT_ITEM_SELECTION_TYPES = ['FIXED', 'VARIANT_SELECTION'] as const

const emptyStringToUndefined = (value: unknown): unknown => {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined
  }

  return value
}

const sanitizeStringArray = (value: unknown): unknown => {
  if (!Array.isArray(value)) {
    return value
  }

  return value.filter((item) => typeof item === 'string' && item.trim().length > 0)
}

const VariantSelectionValuesSchema = z.preprocess(
  sanitizeStringArray,
  z.array(z.string().min(24).max(24))
)

export const ProductItemsSchema = z.object({
  id: z.string().optional(),
  product: z.preprocess(emptyStringToUndefined, z.string().min(24).max(24).optional()),
  asset: z.preprocess(emptyStringToUndefined, z.string().min(24).max(24).optional()),
  baseAsset: z.preprocess(emptyStringToUndefined, z.string().min(24).max(24).optional()),
  selectionType: z.enum(PRODUCT_ITEM_SELECTION_TYPES).optional(),
  allowedVariantValues: VariantSelectionValuesSchema.optional(),
  quantity: z.number().nonnegative().optional(),
  isDeleted: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  createdBy: z.string().min(24).max(24).optional(),
  updatedBy: z.string().min(24).max(24).optional()
}).superRefine((value, context) => {
  const selectionType = value.selectionType ?? 'FIXED'

  if (selectionType === 'VARIANT_SELECTION') {
    if (value.baseAsset === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['baseAsset'],
        message: 'Complete el campo'
      })
    }
  } else if (value.asset === undefined) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['asset'],
      message: 'Complete el campo'
    })
  }
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
