import { z } from 'zod'

export const RoleSchema = z.object({
  name: z.string().min(1),
  code: z.number()
})

export const CreateRoleSchema = z.object({
  body: RoleSchema
})

export const UpdateRoleSchema = z.object({
  body: RoleSchema,
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const GetRoleSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24).optional()
  }),
  query: z.object({
    id: z.string().min(24).max(24).optional()
  })
})

export const DeleteRoleSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export type RoleType = z.infer<typeof RoleSchema>
export type CreateRoleBodyType = z.infer<typeof CreateRoleSchema>['body']
export type UpdateRoleBodyType = z.infer<typeof UpdateRoleSchema>['body']
export type UpdateRoleParamsType = z.infer<typeof UpdateRoleSchema>['params']
export type GetRoleParamsType = z.infer<typeof GetRoleSchema>['params']
export type GetRoleQueryType = z.infer<typeof GetRoleSchema>['query']
export type DeleteRoleParamsType = z.infer<typeof DeleteRoleSchema>['params']
