import { apiInstance } from '@/shared/api'
import { NamespaceSchema, NamespaceListSchema, SuccessResponseSchema, type Namespace } from './constracts'

export const namespaceApi = {
  getNamespaces: async (): Promise<Namespace[]> => {
    const res = await apiInstance.get('/api/internal/namespaces')
    return NamespaceListSchema.parse(res).namespaces
  },

  // getCurrentUser: async (): Promise<User> => {
  //   const res = await apiInstance.get(`/api/internal/users/me`)
  //   return UserSchema.parse(res)
  // },
  //
  // getUserById: async (id: string): Promise<User> => {
  //   const res = await apiInstance.get(`/api/internal/users/${id}`)
  //   return UserSchema.parse(res)
  // },
  //
  create: async (payload: {
    name?: string;
    displayName?: string,
    email?: string;
    pictureUrl?: string;
  }): Promise<boolean> => {
    const res = await apiInstance.post('/api/internal/namespaces', payload)
    return SuccessResponseSchema.parse(res).success
  },

  update: async (id: string, payload: {
    name?: string;
    pictureUrl?: string;
  }): Promise<boolean> => {
    const res = await apiInstance.put(`/api/internal/namespaces/${id}`, payload)
    return SuccessResponseSchema.parse(res).success
  },

  delete: async (id: string): Promise<boolean> => {
    const res = await apiInstance.delete(`/api/internal/namespaces/${id}`)
    return SuccessResponseSchema.parse(res).success
  },
}
