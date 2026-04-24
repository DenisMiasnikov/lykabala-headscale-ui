export const namespaceKeys = {
  all: ['namespaces'] as const,
  lists: () => [...namespaceKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...namespaceKeys.lists(), filters ?? {}] as const,
  details: () => [...namespaceKeys.all, 'detail'] as const,
  detail: (id: string) => [...namespaceKeys.details(), id] as const,
}
