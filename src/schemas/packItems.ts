import { z } from 'zod'

export const PackItemsSchema = z.object({
  product: z.string().min(24).max(24),
  pack: z.string().min(24).max(24),
  quantity: z.number().nonnegative(),
  isDeleted: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  createdBy: z.string().min(24).max(24).optional(),
  updatedBy: z.string().min(24).max(24).optional()
})

export const CreatePackItemsSchema = z.object({
  body: PackItemsSchema
})

export const UpdatePackItemsSchema = z.object({
  body: PackItemsSchema,
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const GetPackItemsSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24).optional()
  }),
  query: z.object({
    id: z.string().min(24).max(24).optional()
  })
})

export const DeletePackItemsSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export type PackItemsType = z.infer<typeof PackItemsSchema>
export type CreatePackItemsBodyType = z.infer<typeof CreatePackItemsSchema>['body']
export type UpdatePackItemsBodyType = z.infer<typeof UpdatePackItemsSchema>['body']
export type UpdatePackItemsParamsType = z.infer<typeof UpdatePackItemsSchema>['params']
export type GetPackItemsParamsType = z.infer<typeof GetPackItemsSchema>['params']
export type GetPackItemsQueryType = z.infer<typeof GetPackItemsSchema>['query']
export type DeletePackItemsParamsType = z.infer<typeof DeletePackItemsSchema>['params']
