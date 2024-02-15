import { z } from 'zod'

export const PackSchema = z.object({
  name: z.string().min(1),
  costPrice: z.number().nonnegative(),
  salePrice: z.number().nonnegative(),
  isDeleted: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  createdBy: z.string().min(24).max(24).optional(),
  updatedBy: z.string().min(24).max(24).optional()
})

export const CreatePackSchema = z.object({
  body: PackSchema
})

export const UpdatePackSchema = z.object({
  body: PackSchema,
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const GetPackSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24).optional()
  }),
  query: z.object({
    id: z.string().min(24).max(24).optional()
  })
})

export const DeletePackSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export type PackType = z.infer<typeof PackSchema>
export type CreatePackBodyType = z.infer<typeof CreatePackSchema>['body']
export type UpdatePackBodyType = z.infer<typeof UpdatePackSchema>['body']
export type UpdatePackParamsType = z.infer<typeof UpdatePackSchema>['params']
export type GetPackParamsType = z.infer<typeof GetPackSchema>['params']
export type GetPackQueryType = z.infer<typeof GetPackSchema>['query']
export type DeletePackParamsType = z.infer<typeof DeletePackSchema>['params']
