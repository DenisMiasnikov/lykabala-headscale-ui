import { apiInstance } from '@/shared/api'
import {Machine, MachinesListSchema} from './constracts'

export const machinesApi = {
  getMachines: async (): Promise<Machine[]> => {
    const res = await apiInstance.get('/api/internal/machines')
    const result = MachinesListSchema.safeParse(res)
    if (!result.success) {
      console.error('Machines validation error:', JSON.stringify(res, null, 2))
      console.error('Validation errors:', result.error.flatten())
      throw new Error('Schema mismatch - check server logs')
    }
    return result.data.machines
  },

  // create: async (payload: {
  //   name?: string;
  //   displayName?: string,
  //   email?: string;
  //   pictureUrl?: string;
  // }): Promise<boolean> => {
  //   const res = await apiInstance.post('/api/internal/namespaces', payload)
  //   return SuccessResponseSchema.parse(res).success
  // },
  //
  // update: async (id: string, payload: {
  //   name?: string;
  //   pictureUrl?: string;
  // }): Promise<boolean> => {
  //   const res = await apiInstance.put(`/api/internal/namespaces/${id}`, payload)
  //   return SuccessResponseSchema.parse(res).success
  // },
  //
  // delete: async (id: string): Promise<boolean> => {
  //   const res = await apiInstance.delete(`/api/internal/namespaces/${id}`)
  //   return SuccessResponseSchema.parse(res).success
  // },
}
