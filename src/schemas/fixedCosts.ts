import { z } from 'zod'

export const FixedCostSchema = z.object({
  name: z.string().min(1),
  amount: z.number(),
  isDeleted: z.boolean().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  createdBy: z.string().min(24).max(24).optional(),
  updatedBy: z.string().min(24).max(24).optional()
})

export const CreateFixedCostSchema = z.object({
  body: FixedCostSchema
})

export const UpdateFixedCostSchema = z.object({
  body: FixedCostSchema,
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const GetFixedCostSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24).optional()
  }),
  query: z.object({
    id: z.string().min(24).max(24).optional()
  })
})

export const DeleteFixedCostSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const ChangeIsActiveFixedCostSchema = z.object({
  body: z.object({
    isActive: z.boolean().optional()
  }),
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export type FixedCostType = z.infer<typeof FixedCostSchema>
export type CreateFixedCostBodyType = z.infer<typeof CreateFixedCostSchema>['body']
export type UpdateFixedCostBodyType = z.infer<typeof UpdateFixedCostSchema>['body']
export type UpdateFixedCostParamsType = z.infer<typeof UpdateFixedCostSchema>['params']
export type GetFixedCostParamsType = z.infer<typeof GetFixedCostSchema>['params']
export type GetFixedCostQueryType = z.infer<typeof GetFixedCostSchema>['query']
export type DeleteFixedCostParamsType = z.infer<typeof DeleteFixedCostSchema>['params']
export type ChangeIsActiveFixedCostBodyType = z.infer<typeof ChangeIsActiveFixedCostSchema>['body']
export type ChangeIsActiveFixedCostParamsType = z.infer<typeof ChangeIsActiveFixedCostSchema>['params']
