import { z } from 'zod'

export const MethodPaymentsSchema = z.object({
  name: z.string().min(1),
  isDeleted: z.boolean().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  createdBy: z.string().min(24).max(24).optional(),
  updatedBy: z.string().min(24).max(24).optional()
})

export const CreateMethodPaymentsSchema = z.object({
  body: MethodPaymentsSchema
})

export const UpdateMethodPaymentsSchema = z.object({
  body: MethodPaymentsSchema,
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const GetMethodPaymentsSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24).optional()
  }),
  query: z.object({
    id: z.string().min(24).max(24).optional()
  })
})

export const DeleteMethodPaymentsSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const ChangeIsActiveMethodPaymentSchema = z.object({
  body: z.object({
    isActive: z.boolean().optional()
  }),
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export type MethodPaymentsType = z.infer<typeof MethodPaymentsSchema>
export type CreateMethodPaymentsBodyType = z.infer<typeof CreateMethodPaymentsSchema>['body']
export type UpdateMethodPaymentsBodyType = z.infer<typeof UpdateMethodPaymentsSchema>['body']
export type UpdateMethodPaymentsParamsType = z.infer<typeof UpdateMethodPaymentsSchema>['params']
export type GetMethodPaymentsParamsType = z.infer<typeof GetMethodPaymentsSchema>['params']
export type GetMethodPaymentsQueryType = z.infer<typeof GetMethodPaymentsSchema>['query']
export type DeleteMethodPaymentsParamsType = z.infer<typeof DeleteMethodPaymentsSchema>['params']
export type ChangeIsActiveMethodPaymentBodyType = z.infer<typeof ChangeIsActiveMethodPaymentSchema>['body']
export type ChangeIsActiveMethodPaymentParamsType = z.infer<typeof ChangeIsActiveMethodPaymentSchema>['params']
