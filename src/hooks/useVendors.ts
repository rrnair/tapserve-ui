import useSWR from 'swr'
import { getVendors, getVendor, VendorFilters } from '@/services/vendorService'

export function useVendors(filters?: VendorFilters) {
  const key = filters ? ['vendors', filters] : ['vendors']
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => getVendors(filters),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  )

  return {
    vendors: data?.success ? data.data?.items : [],
    total: data?.success ? data.data?.total : 0,
    page: data?.success ? data.data?.page : 1,
    limit: data?.success ? data.data?.limit : 20,
    isLoading,
    error: error || (!data?.success ? data?.error : null),
    mutate,
    refetch: () => mutate()
  }
}

export function useVendor(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['vendor', id] : null,
    () => getVendor(id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    vendor: data?.success ? data.data : null,
    isLoading,
    error: error || (!data?.success ? data?.error : null),
    mutate,
    refetch: () => mutate()
  }
}