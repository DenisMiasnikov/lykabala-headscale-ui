// types
export type { Namespace, NamespaceList } from '../api/constracts'

// queries
export {
  useNamespaceList
  // useCurrentUser,
  // useCurrentUserSuspense,
} from './queries'

// mutations
export {
  // useCreateClient,
  // useUpdateClient,
  // useDeleteClient,
} from './mutations'

// query keys (for use in prefetching at the page/route level)
export { namespaceKeys } from './query-keys'
