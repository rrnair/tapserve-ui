import { create } from 'zustand'
import { Expense } from '@/types/expense'
import { OfflineExpense, offlineStorageService } from '@/services/offlineStorageService'
import { syncService, SyncStatus } from '@/services/syncService'
import { createExpense } from '@/services/expensesService'

interface ExpensesState {
  // Data state
  expenses: OfflineExpense[]
  
  // Filter state
  searchTerm: string
  statusFilter: 'all' | 'pending' | 'approved' | 'rejected'
  categoryFilter: string
  vendorFilter: string
  
  // UI state
  isLoading: boolean
  error: string | null
  
  // Sync state
  syncStatus: SyncStatus
  
  // Actions
  setSearchTerm: (term: string) => void
  setStatusFilter: (filter: 'all' | 'pending' | 'approved' | 'rejected') => void
  setCategoryFilter: (filter: string) => void
  setVendorFilter: (filter: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Data actions
  loadExpenses: (tenantId?: string, outletId?: string) => Promise<void>
  addExpense: (expense: Partial<Expense>) => Promise<OfflineExpense>
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
  
  // Sync actions
  syncExpenses: () => Promise<void>
  forceSyncExpense: (id: string) => Promise<boolean>
  
  // Reset filters
  resetFilters: () => void
  
  // Cleanup
  cleanup: () => void
}

export const useExpensesStore = create<ExpensesState>((set, get) => {
  // Initialize sync listener (only in browser)
  const handleSyncStatusChange = (syncStatus: SyncStatus) => {
    set({ syncStatus })
  }
  
  if (typeof window !== 'undefined') {
    syncService.addStatusListener(handleSyncStatusChange)
  }

  return {
    // Initial state
    expenses: [],
    searchTerm: '',
    statusFilter: 'all',
    categoryFilter: 'all',
    vendorFilter: 'all',
    isLoading: false,
    error: null,
    syncStatus: {
      isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
      isSyncing: false,
      lastSync: null,
      pendingCount: 0,
      hasErrors: false
    },
    
    // Filter actions
    setSearchTerm: (term) => set({ searchTerm: term }),
    setStatusFilter: (filter) => set({ statusFilter: filter }),
    setCategoryFilter: (filter) => set({ categoryFilter: filter }),
    setVendorFilter: (filter) => set({ vendorFilter: filter }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    
    resetFilters: () => set({
      searchTerm: '',
      statusFilter: 'all',
      categoryFilter: 'all',
      vendorFilter: 'all'
    }),

    // Data actions
    loadExpenses: async (tenantId?: string, outletId?: string) => {
      set({ isLoading: true, error: null })
      
      try {
        // Skip offline operations in SSR
        if (typeof window === 'undefined') {
          set({ expenses: [], isLoading: false })
          return
        }
        
        // Always load from offline storage first for immediate UI
        const offlineExpenses = await offlineStorageService.getAllOfflineExpenses(tenantId, outletId)
        set({ expenses: offlineExpenses })
        
        // If online, try to sync and refresh
        if (syncService.getNetworkStatus()) {
          try {
            await syncService.syncExpenses()
            // Reload after sync
            const updatedExpenses = await offlineStorageService.getAllOfflineExpenses(tenantId, outletId)
            set({ expenses: updatedExpenses })
          } catch (syncError) {
            console.warn('Sync failed during load:', syncError)
            // Continue with offline data
          }
        }
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to load expenses' })
      } finally {
        set({ isLoading: false })
      }
    },

    addExpense: async (expense: Partial<Expense>) => {
      set({ isLoading: true, error: null })
      
      try {
        // Skip offline operations in SSR
        if (typeof window === 'undefined') {
          throw new Error('Offline operations not available in SSR')
        }
        
        const savedExpense = await offlineStorageService.saveExpenseOffline(expense)
        
        // Update local state immediately
        const currentExpenses = get().expenses
        set({ expenses: [...currentExpenses, savedExpense] })
        
        // Trigger sync if online
        if (syncService.getNetworkStatus()) {
          syncService.scheduleSync(1000) // Sync after 1 second
        }
        
        return savedExpense
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add expense'
        set({ error: errorMessage })
        throw new Error(errorMessage)
      } finally {
        set({ isLoading: false })
      }
    },

    updateExpense: async (id: string, updates: Partial<Expense>) => {
      set({ isLoading: true, error: null })
      
      try {
        const existingExpense = await offlineStorageService.getOfflineExpense(id)
        if (!existingExpense) {
          throw new Error('Expense not found')
        }

        const updatedExpense: OfflineExpense = {
          ...existingExpense,
          ...updates,
          updatedAt: new Date().toISOString(),
          _offline: {
            ...existingExpense._offline!,
            synced: false,
            version: (existingExpense._offline?.version || 0) + 1
          }
        }

        await offlineStorageService.saveExpenseOffline(updatedExpense)
        
        // Update local state
        const currentExpenses = get().expenses
        const updatedExpenses = currentExpenses.map(exp => 
          exp.id === id ? updatedExpense : exp
        )
        set({ expenses: updatedExpenses })
        
        // Trigger sync if online
        if (syncService.getNetworkStatus()) {
          syncService.scheduleSync(1000)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update expense'
        set({ error: errorMessage })
        throw new Error(errorMessage)
      } finally {
        set({ isLoading: false })
      }
    },

    deleteExpense: async (id: string) => {
      set({ isLoading: true, error: null })
      
      try {
        await offlineStorageService.deleteOfflineExpense(id)
        
        // Update local state
        const currentExpenses = get().expenses
        const filteredExpenses = currentExpenses.filter(exp => exp.id !== id)
        set({ expenses: filteredExpenses })
        
        // If the expense was synced before, we need to sync the deletion
        if (syncService.getNetworkStatus()) {
          syncService.scheduleSync(1000)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete expense'
        set({ error: errorMessage })
        throw new Error(errorMessage)
      } finally {
        set({ isLoading: false })
      }
    },

    // Sync actions
    syncExpenses: async () => {
      const result = await syncService.syncExpenses()
      
      if (result.success) {
        // Reload expenses after successful sync
        const tenantId = get().expenses[0]?.tenantId
        const outletId = get().expenses[0]?.outletId
        const updatedExpenses = await offlineStorageService.getAllOfflineExpenses(tenantId, outletId)
        set({ expenses: updatedExpenses, error: null })
      } else if (result.errors.length > 0) {
        set({ error: `Sync failed: ${result.errors[0].error}` })
      }
    },

    forceSyncExpense: async (id: string) => {
      const success = await syncService.forceSyncExpense(id)
      
      if (success) {
        // Reload the specific expense
        const updatedExpense = await offlineStorageService.getOfflineExpense(id)
        if (updatedExpense) {
          const currentExpenses = get().expenses
          const updatedExpenses = currentExpenses.map(exp => 
            exp.id === id ? updatedExpense : exp
          )
          set({ expenses: updatedExpenses })
        }
      }
      
      return success
    },

    cleanup: () => {
      if (typeof window !== 'undefined') {
        syncService.removeStatusListener(handleSyncStatusChange)
      }
    }
  }
})

// Selector for filtered expenses
export const useFilteredExpenses = (expenses: Expense[]) => {
  const { searchTerm, statusFilter, categoryFilter, vendorFilter } = useExpensesStore()
  
  return expenses.filter(expense => {
    const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.status?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesVendor = vendorFilter === 'all' || expense.vendorId === vendorFilter
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || expense.categoryId === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory && matchesVendor
  })
}