import { apiInstance } from '@/shared/api'
import { UserListSchema, UserSchema, SuccessResponseSchema, type User } from './constracts'

export const clientApi = {
  getUsers: async (): Promise<User[]> => {
    const res = await apiInstance.get('/api/internal/users')
    return UserListSchema.parse(res).users
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await apiInstance.get(`/api/internal/users/me`)
    return UserSchema.parse(res)
  },

  getUserById: async (id: string): Promise<User> => {
    const res = await apiInstance.get(`/api/internal/users/${id}`)
    return UserSchema.parse(res)
  },

  create: async (payload: { username: string; password: string; isAdmin?: boolean }): Promise<boolean> => {
    const res = await apiInstance.post('/api/internal/users', payload)
    return SuccessResponseSchema.parse(res).success
  },

  update: async (id: string, payload: { username?: string; password?: string; isAdmin?: boolean }): Promise<boolean> => {
    const res = await apiInstance.put(`/api/internal/users/${id}`, payload)
    return SuccessResponseSchema.parse(res).success
  },

  delete: async (id: string): Promise<boolean> => {
    const res = await apiInstance.delete(`/api/internal/users/${id}`)
    return SuccessResponseSchema.parse(res).success
  },
}
