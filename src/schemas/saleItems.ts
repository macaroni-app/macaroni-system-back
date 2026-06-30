import { z } from 'zod'

const emptyStringToUndefined = (value: unknown): unknown => {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined
  }

  return value
}

const sanitizeVariantSelections = (value: unknown): unknown => {
  if (!Array.isArray(value)) {
    return value
  }

  return value.filter((selection) => {
    if (selection == null || typeof selection !== 'object') {
      return false
    }

    const currentSelection = selection as {
      productItem?: unknown
      assetVariant?: unknown
      quantity?: unknown
    }

    const hasProductItem = typeof currentSelection.productItem === 'string' && currentSelection.productItem.trim().length > 0
    const hasAssetVariant = typeof currentSelection.assetVariant === 'string' && currentSelection.assetVariant.trim().length > 0
    const hasQuantity = Number(currentSelection.quantity ?? 0) > 0

    return hasProductItem || hasAssetVariant || hasQuantity
  })
}

const SaleItemVariantSelectionSchema = z.object({
  productItem: z.preprocess(emptyStringToUndefined, z.string().min(24).max(24)),
  assetVariant: z.preprocess(emptyStringToUndefined, z.string().min(24).max(24)),
  quantity: z.number().positive()
})

export const SaleItemSchema = z.object({
  id: z.string().optional(),
  sale: z.string().min(24).max(24).optional(),
  product: z.string().min(24).max(24).optional(),
  quantity: z.number().nonnegative().optional(),
  subtotal: z.number().nonnegative().optional(),
  variantSelections: z.preprocess(
    sanitizeVariantSelections,
    z.array(SaleItemVariantSelectionSchema).optional()
  ),
  isDeleted: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  createdBy: z.string().min(24).max(24).optional(),
  updatedBy: z.string().min(24).max(24).optional()
})

export const CreateSaleItemSchema = z.object({
  body: SaleItemSchema
})

export const CreateManySaleItemsSchema = z.object({
  body: z.object({
    saleItems: z.array(SaleItemSchema)
  })
})

export const UpdateSaleItemSchema = z.object({
  body: SaleItemSchema,
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const DeleteManySaleItemsSchema = z.object({
  body: z.object({
    saleItems: z.array(SaleItemSchema)
  })
})

export const GetSaleItemSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24).optional()
  }),
  query: z.object({
    id: z.string().min(24).max(24).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    all: z.string().optional(),
    historyMonthToRetrieve: z.string().optional()
  })
})

export const DeleteSaleItemSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export type SaleItemType = z.infer<typeof SaleItemSchema>
export type CreateSaleItemBodyType = z.infer<typeof CreateSaleItemSchema>['body']
export type CreateManySaleItemsBodyType = z.infer<typeof CreateManySaleItemsSchema>['body']
export type DeleteManySaleItemsBodyType = z.infer<typeof DeleteManySaleItemsSchema>['body']
export type UpdateSaleItemBodyType = z.infer<typeof UpdateSaleItemSchema>['body']
export type UpdateSaleItemParamsType = z.infer<typeof UpdateSaleItemSchema>['params']
export type GetSaleItemParamsType = z.infer<typeof GetSaleItemSchema>['params']
export type GetSaleItemQueryType = z.infer<typeof GetSaleItemSchema>['query']
export type DeleteSaleItemParamsType = z.infer<typeof DeleteSaleItemSchema>['params']
