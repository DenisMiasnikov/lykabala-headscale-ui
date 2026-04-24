import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { namespaceApi } from '../api/api'
import { namespaceKeys } from './query-keys'

export const useNamespaceList = (skip?: boolean) =>
  useQuery({
    queryKey: namespaceKeys.list(),
    queryFn: namespaceApi.getNamespaces,
    enabled: !skip,
    staleTime: 1000 * 60 * 5,
  })

// export const useCurrentUser = () =>
//   useQuery({
//     queryKey: clientKeys.details(),
//     queryFn: clientApi.getCurrentUser,
//     staleTime: 1000 * 60 * 5,
//   })
//
// // Suspense variant for use with React Suspense boundaries
// export const useCurrentUserSuspense = (id: string) =>
//   useSuspenseQuery({
//     queryKey: clientKeys.detail(id),
//     queryFn: () => clientApi.getCurrentUser(),
//   })
