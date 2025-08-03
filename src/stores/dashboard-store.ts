import { create } from 'zustand'
import { 
  DashboardFilters, 
  DashboardSummary, 
  ExpenseByCategory, 
  ExpenseByVendor,
  getDashboardData,
  getDashboardSummary,
  getExpensesByCategory,
  getExpensesByVendor
} from '@/services/expenseDashboardService'
import { Expense } from '@/types/expense'

interface DashboardStore {
  // State
  loading: boolean
  error: string | null
  filters: DashboardFilters
  summary: DashboardSummary | null
  expensesByCategory: ExpenseByCategory[]
  expensesByVendor: ExpenseByVendor[]
  recentExpenses: Expense[]
  
  // Actions
  setFilters: (filters: DashboardFilters) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Data fetching actions
  fetchDashboardData: () => Promise<void>
  fetchSummary: () => Promise<void>
  fetchExpensesByCategory: () => Promise<void>
  fetchExpensesByVendor: () => Promise<void>
  
  // Reset state
  reset: () => void
}

const initialState = {
  loading: false,
  error: null,
  filters: {},
  summary: null,
  expensesByCategory: [],
  expensesByVendor: [],
  recentExpenses: []
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  ...initialState,

  setFilters: (filters) => {
    set({ filters })
    // Automatically fetch new data when filters change
    get().fetchDashboardData()
  },

  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  fetchDashboardData: async () => {
    const { filters } = get()
    set({ loading: true, error: null })
    
    try {
      const response = await getDashboardData(filters)
      
      if (response.success && response.data) {
        set({
          summary: response.data.summary,
          expensesByCategory: response.data.expensesByCategory,
          expensesByVendor: response.data.expensesByVendor,
          recentExpenses: response.data.recentExpenses,
          loading: false
        })
      } else {
        set({ 
          error: response.error || 'Failed to load dashboard data',
          loading: false 
        })
      }
    } catch {
      set({ 
        error: 'An error occurred while loading dashboard data',
        loading: false 
      })
    }
  },

  fetchSummary: async () => {
    const { filters } = get()
    set({ loading: true, error: null })
    
    try {
      const response = await getDashboardSummary(filters)
      
      if (response.success && response.data) {
        set({
          summary: response.data,
          loading: false
        })
      } else {
        set({ 
          error: response.error || 'Failed to load summary data',
          loading: false 
        })
      }
    } catch {
      set({ 
        error: 'An error occurred while loading summary data',
        loading: false 
      })
    }
  },

  fetchExpensesByCategory: async () => {
    const { filters } = get()
    
    try {
      const response = await getExpensesByCategory(filters)
      
      if (response.success && response.data) {
        set({ expensesByCategory: response.data })
      } else {
        set({ error: response.error || 'Failed to load expenses by category' })
      }
    } catch {
      set({ error: 'An error occurred while loading category data' })
    }
  },

  fetchExpensesByVendor: async () => {
    const { filters } = get()
    
    try {
      const response = await getExpensesByVendor(filters)
      
      if (response.success && response.data) {
        set({ expensesByVendor: response.data })
      } else {
        set({ error: response.error || 'Failed to load expenses by vendor' })
      }
    } catch {
      set({ error: 'An error occurred while loading vendor data' })
    }
  },

  reset: () => set(initialState)
}))