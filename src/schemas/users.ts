import { z } from 'zod'

export const UserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
  email: z.string().min(1).optional(),
  refreshToken: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  isDeleted: z.boolean().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  createdBy: z.string().min(24).max(24).optional(),
  updatedBy: z.string().min(24).max(24).optional()
})

export const CreateUserSchema = z.object({
  body: UserSchema
})

export const UpdateUserSchema = z.object({
  body: UserSchema,
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const GetUserSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24).optional()
  }),
  query: z.object({
    id: z.string().min(24).max(24).optional()
  })
})

export const DeleteUserSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export const ChangeIsActiveUserSchema = z.object({
  body: z.object({
    isActive: z.boolean().optional()
  }),
  params: z.object({
    id: z.string().min(24).max(24)
  })
})

export type UserType = z.infer<typeof UserSchema>
export type CreateUserBodyType = z.infer<typeof CreateUserSchema>['body']
export type UpdateUserBodyType = z.infer<typeof UpdateUserSchema>['body']
export type UpdateUserParamsType = z.infer<typeof UpdateUserSchema>['params']
export type GetUserParamsType = z.infer<typeof GetUserSchema>['params']
export type GetUserQueryType = z.infer<typeof GetUserSchema>['query']
export type DeleteUserParamsType = z.infer<typeof DeleteUserSchema>['params']
export type ChangeIsActiveUserBodyType = z.infer<typeof ChangeIsActiveUserSchema>['body']
export type ChangeIsActiveUserParamsType = z.infer<typeof ChangeIsActiveUserSchema>['params']
