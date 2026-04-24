import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import {machinesApi} from '../api/api'
import { machinesKeys } from './query-keys'

export const useMachinesList = (skip?: boolean) =>
  useQuery({
    queryKey: machinesKeys.list(),
    queryFn: machinesApi.getMachines,
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
