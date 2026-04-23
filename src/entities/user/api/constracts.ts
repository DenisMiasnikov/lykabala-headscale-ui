import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  passwordHash: z.string(),
  salt: z.string(),
  isAdmin: z.boolean(),
  createdAt: z.string().datetime(),
})

export const UserListSchema = z.object({
  users: z.array(UserSchema),
})

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
})

export type User = z.infer<typeof UserSchema>
export type UserList = z.infer<typeof UserListSchema>
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>
