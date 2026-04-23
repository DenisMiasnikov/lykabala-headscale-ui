import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { clientApi } from '../api/api'
import { clientKeys } from './query-keys'

export const useUsersList = (skip?: boolean) =>
  useQuery({
    queryKey: clientKeys.list(),
    queryFn: clientApi.getUsers,
    enabled: !skip,
    staleTime: 1000 * 60 * 5,
  })

export const useCurrentUser = () =>
  useQuery({
    queryKey: clientKeys.details(),
    queryFn: clientApi.getCurrentUser,
    staleTime: 1000 * 60 * 5,
  })

// Suspense variant for use with React Suspense boundaries
export const useCurrentUserSuspense = (id: string) =>
  useSuspenseQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => clientApi.getCurrentUser(),
  })
