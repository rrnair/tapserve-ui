import useSWR from 'swr'
import { getExpenses, getExpense, ExpenseFilters } from '@/services/expensesService'

export function useExpenses(filters?: ExpenseFilters) {
  const key = filters ? ['expenses', filters] : ['expenses']
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => getExpenses(filters),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  )

  return {
    expenses: data?.success ? data.data?.items : [],
    total: data?.success ? data.data?.total : 0,
    page: data?.success ? data.data?.page : 1,
    limit: data?.success ? data.data?.limit : 20,
    isLoading,
    error: error || (!data?.success ? data?.error : null),
    mutate,
    refetch: () => mutate()
  }
}

export function useExpense(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['expense', id] : null,
    () => getExpense(id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    expense: data?.success ? data.data : null,
    isLoading,
    error: error || (!data?.success ? data?.error : null),
    mutate,
    refetch: () => mutate()
  }
}