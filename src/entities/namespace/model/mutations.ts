import { useMutation, useQueryClient } from '@tanstack/react-query'
import { namespaceApi } from '../api/api'
import { namespaceKeys } from './query-keys'

export const useCreateNamespace = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: namespaceApi.create,
    onSuccess: () => {
      qc.refetchQueries({ queryKey: namespaceKeys.list() })
    },
  })
}

export const useUpdateNamespace = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof namespaceApi.update>[1] }) =>
      namespaceApi.update(id, payload),
    onSuccess: () => {
      qc.refetchQueries({ queryKey: namespaceKeys.list() })
    },
  })
}

export const useDeleteNamespace = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({id}: {id: string}) => namespaceApi.delete(id),
    onSuccess: () => {
      qc.refetchQueries({ queryKey: namespaceKeys.list() })
    },
  })
}
