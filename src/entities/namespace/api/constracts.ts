import { z } from 'zod'

export const NamespaceSchema = z.object({
  createdAt: z.string().datetime(),
  displayName: z.string(),
  id: z.string(),
  name: z.string(),
  email: z.string(),
  profilePicUrl: z.string(),
  providerId: z.string(),
  provider: z.string(),
})

export const NamespaceListSchema = z.object({
  namespaces: z.array(NamespaceSchema),
})

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
})

export type Namespace = z.infer<typeof NamespaceSchema>
export type NamespaceList = z.infer<typeof NamespaceListSchema>
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>
