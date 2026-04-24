export const machinesKeys = {
  all: ['machines'] as const,
  lists: () => [...machinesKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...machinesKeys.lists(), filters ?? {}] as const,
  details: () => [...machinesKeys.all, 'detail'] as const,
  detail: (id: string) => [...machinesKeys.details(), id] as const,
}
