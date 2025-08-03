import { create } from 'zustand'
import { Category } from '@/types/category'

interface CategoriesState {
  // Filter state
  searchTerm: string
  statusFilter: 'all' | 'active' | 'inactive'
  typeFilter: 'all' | 'vendor'
  
  // UI state
  isLoading: boolean
  error: string | null
  
  // Actions
  setSearchTerm: (term: string) => void
  setStatusFilter: (filter: 'all' | 'active' | 'inactive') => void
  setTypeFilter: (filter: 'all' | 'vendor') => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Reset filters
  resetFilters: () => void
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  // Initial state
  searchTerm: '',
  statusFilter: 'all',
  typeFilter: 'all',
  isLoading: false,
  error: null,
  
  // Actions
  setSearchTerm: (term) => set({ searchTerm: term }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setTypeFilter: (filter) => set({ typeFilter: filter }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  resetFilters: () => set({
    searchTerm: '',
    statusFilter: 'all',
    typeFilter: 'all'
  })
}))

// Selector for filtered categories
export const useFilteredCategories = (categories: Category[]) => {
  const { searchTerm, statusFilter, typeFilter } = useCategoriesStore()
  
  return categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && category.isActive) ||
      (statusFilter === 'inactive' && !category.isActive)

    const matchesType = typeFilter === 'all' || category.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })
}