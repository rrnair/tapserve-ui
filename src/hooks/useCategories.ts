import useSWR from 'swr'
import { getCategories, CategoryFilters } from '@/services/categoryService'

export function useCategories(filters?: CategoryFilters) {
  const key = filters ? ['categories', filters] : ['categories']
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => getCategories(filters),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  )

  return {
    categories: data?.success ? data.data?.items : [],
    total: data?.success ? data.data?.total : 0,
    page: data?.success ? data.data?.page : 1,
    limit: data?.success ? data.data?.limit : 20,
    isLoading,
    error: error || (!data?.success ? data?.error : null),
    mutate,
    refetch: () => mutate()
  }
}

export function useCategory(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['category', id] : null,
    () => import('@/services/categoryService').then(m => m.getCategory(id)),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    category: data?.success ? data.data : null,
    isLoading,
    error: error || (!data?.success ? data?.error : null),
    mutate,
    refetch: () => mutate()
  }
}