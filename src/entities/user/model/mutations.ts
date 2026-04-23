import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clientApi } from '../api/api'
import { clientKeys } from './query-keys'

export const useCreateClient = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: clientApi.create,
    onSuccess: () => {
      qc.refetchQueries({ queryKey: clientKeys.list() })
    },
  })
}

export const useUpdateClient = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof clientApi.update>[1] }) =>
      clientApi.update(id, payload),
    onSuccess: () => {
      qc.refetchQueries({ queryKey: clientKeys.list() })
    },
  })
}

export const useDeleteClient = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({id}: {id: string}) => clientApi.delete(id),
    onSuccess: () => {
      qc.refetchQueries({ queryKey: clientKeys.list() })
    },
  })
}
