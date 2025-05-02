import { z } from 'zod'

export const BusinessSchema = z.object({
  name: z.string().min(1),
  cuit: z.string().optional(),
  ivaCondition: z.string().optional(),
  address: z.string().optional(),
  isDeleted: z.boolean().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  createdBy: z.string().min(24).max(24).optional(),
  updatedBy: z.string().min(24).max(24).optional()
})

export const CreateBusinessSchema = z.object({
  body: BusinessSchema
})

export const UpdateBusinessSchema = z.object({
  body: BusinessSchema,
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const GetBusinessSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24).optional()
  }),
  query: z.object({
    id: z.string().min(24).max(24).optional()
  })
})

export const DeleteBusinessSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const ChangeIsActiveBusinessSchema = z.object({
  body: z.object({
    isActive: z.boolean().optional()
  }),
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export type BusinessType = z.infer<typeof BusinessSchema>
export type CreateBusinessBodyType = z.infer<typeof CreateBusinessSchema>['body']
export type UpdateBusinessBodyType = z.infer<typeof UpdateBusinessSchema>['body']
export type UpdateBusinessParamsType = z.infer<typeof UpdateBusinessSchema>['params']
export type GetBusinessParamsType = z.infer<typeof GetBusinessSchema>['params']
export type GetBusinessQueryType = z.infer<typeof GetBusinessSchema>['query']
export type DeleteBusinessParamsType = z.infer<typeof DeleteBusinessSchema>['params']
export type ChangeIsActiveBusinessBodyType = z.infer<typeof ChangeIsActiveBusinessSchema>['body']
export type ChangeIsActiveBusinessParamsType = z.infer<typeof ChangeIsActiveBusinessSchema>['params']
