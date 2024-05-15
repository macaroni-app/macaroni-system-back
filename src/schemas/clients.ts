import { z } from 'zod'

export const ClientSchema = z.object({
  name: z.string().min(1),
  isDeleted: z.boolean().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  createdBy: z.string().min(24).max(24).optional(),
  updatedBy: z.string().min(24).max(24).optional()
})

export const CreateClientSchema = z.object({
  body: ClientSchema
})

export const UpdateClientSchema = z.object({
  body: ClientSchema,
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const GetClientSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24).optional()
  }),
  query: z.object({
    id: z.string().min(24).max(24).optional()
  })
})

export const DeleteClientSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const DeactivateClientSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export type ClientType = z.infer<typeof ClientSchema>
export type CreateClientBodyType = z.infer<typeof CreateClientSchema>['body']
export type UpdateClientBodyType = z.infer<typeof UpdateClientSchema>['body']
export type UpdateClientParamsType = z.infer<typeof UpdateClientSchema>['params']
export type GetClientParamsType = z.infer<typeof GetClientSchema>['params']
export type GetClientQueryType = z.infer<typeof GetClientSchema>['query']
export type DeleteClientParamsType = z.infer<typeof DeleteClientSchema>['params']
export type DeactivateClientParamsType = z.infer<typeof DeactivateClientSchema>['params']
