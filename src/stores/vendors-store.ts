import { create } from 'zustand'
import { Vendor } from '@/types/vendor'

interface VendorsState {
  // Filter state
  searchTerm: string
  statusFilter: 'all' | 'active' | 'inactive'
  categoryFilter: string
  
  // UI state
  isLoading: boolean
  error: string | null
  
  // Actions
  setSearchTerm: (term: string) => void
  setStatusFilter: (filter: 'all' | 'active' | 'inactive') => void
  setCategoryFilter: (filter: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Reset filters
  resetFilters: () => void
}

export const useVendorsStore = create<VendorsState>((set) => ({
  // Initial state
  searchTerm: '',
  statusFilter: 'all',
  categoryFilter: 'all',
  isLoading: false,
  error: null,
  
  // Actions
  setSearchTerm: (term) => set({ searchTerm: term }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setCategoryFilter: (filter) => set({ categoryFilter: filter }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  resetFilters: () => set({
    searchTerm: '',
    statusFilter: 'all',
    categoryFilter: 'all'
  })
}))

// Selector for filtered vendors
export const useFilteredVendors = (vendors: Vendor[]) => {
  const { searchTerm, statusFilter, categoryFilter } = useVendorsStore()
  
  return vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.category.name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && vendor.isActive) ||
      (statusFilter === 'inactive' && !vendor.isActive)

    const matchesCategory = categoryFilter === 'all' || vendor.category.id === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })
}