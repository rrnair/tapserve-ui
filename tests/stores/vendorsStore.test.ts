import { describe, it, expect, beforeEach } from '@jest/globals'
import { renderHook, act } from '@testing-library/react'
import { useVendorsStore, useFilteredVendors } from '@/stores/vendors-store'
import { Vendor } from '@/types/vendor'
import { NIL } from 'uuid'


/**
 * Tests features of Vendor Store
 * 
 * @author Ratheesh Nair
 * @since 0.1.0
 */

// Test data factory
const createMockVendor = (overrides: Partial<Vendor> = {}): Vendor => ({
  id: `vendor-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test Vendor',
  description: 'Test vendor description',
  category: {
    id: 'cat-1',
    name: 'Food Supplies',
    description: 'Food and beverage supplies',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    type: NIL,
    parentId: NIL,
    vendorCount: 0,
    expenseCount: 0,
    totalAmount: 0
  },
  expenseCount: 0,
  contact: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@testvendor.com',
    phone: [{countryCode: 91, phone: 34567890}],
    address: {
      street: '123 Main St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'Test Country'
    }
  },
  imageUrls: [],
  isActive: true,
  totalAmount: 0,
  createdBy: 'user-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides
})

/**
 * STORE TESTS - Vendor Store Tests
 * 
 * This suite tests the Zustand store functionality including:
 * - State management
 * - Action dispatching
 * - State updates
 * - Filter functionality
 * - State persistence
 * - Selector functions
 */
describe('Store Tests - Vendor Store Tests', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { resetFilters, setLoading, setError } = useVendorsStore.getState()
    resetFilters()
    setLoading(false)
    setError(null)
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useVendorsStore.getState()

      expect(state.searchTerm).toBe('')
      expect(state.statusFilter).toBe('all')
      expect(state.categoryFilter).toBe('all')
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should provide all required action functions', () => {
      const state = useVendorsStore.getState()

      expect(typeof state.setSearchTerm).toBe('function')
      expect(typeof state.setStatusFilter).toBe('function')
      expect(typeof state.setCategoryFilter).toBe('function')
      expect(typeof state.setLoading).toBe('function')
      expect(typeof state.setError).toBe('function')
      expect(typeof state.resetFilters).toBe('function')
    })
  })

  describe('Search Term Management', () => {
    it('should update search term correctly', () => {
      const { result } = renderHook(() => useVendorsStore())

      act(() => {
        result.current.setSearchTerm('food vendor')
      })

      expect(result.current.searchTerm).toBe('food vendor')
    })

    it('should handle empty search term', () => {
      const { result } = renderHook(() => useVendorsStore())

      act(() => {
        result.current.setSearchTerm('initial search')
        result.current.setSearchTerm('')
      })

      expect(result.current.searchTerm).toBe('')
    })

    it('should handle special characters in search term', () => {
      const { result } = renderHook(() => useVendorsStore())
      const specialSearch = 'café & restaurant supplies! @#$%'

      act(() => {
        result.current.setSearchTerm(specialSearch)
      })

      expect(result.current.searchTerm).toBe(specialSearch)
    })

    it('should handle very long search terms', () => {
      const { result } = renderHook(() => useVendorsStore())
      const longSearch = 'a'.repeat(1000)

      act(() => {
        result.current.setSearchTerm(longSearch)
      })

      expect(result.current.searchTerm).toBe(longSearch)
      expect(result.current.searchTerm.length).toBe(1000)
    })

    it('should trim whitespace in search terms', () => {
      const { result } = renderHook(() => useVendorsStore())

      act(() => {
        result.current.setSearchTerm('  spaced search  ')
      })

      expect(result.current.searchTerm).toBe('  spaced search  ')
    })
  })

  describe('Status Filter Management', () => {
    it('should update status filter to active', () => {
      const { result } = renderHook(() => useVendorsStore())

      act(() => {
        result.current.setStatusFilter('active')
      })

      expect(result.current.statusFilter).toBe('active')
    })

    it('should update status filter to inactive', () => {
      const { result } = renderHook(() => useVendorsStore())

      act(() => {
        result.current.setStatusFilter('inactive')
      })

      expect(result.current.statusFilter).toBe('inactive')
    })

    it('should update status filter to all', () => {
      const { result } = renderHook(() => useVendorsStore())

      act(() => {
        result.current.setStatusFilter('active')
        result.current.setStatusFilter('all')
      })

      expect(result.current.statusFilter).toBe('all')
    })

    it('should handle multiple status filter changes', () => {
      const { result } = renderHook(() => useVendorsStore())

      act(() => {
        result.current.setStatusFilter('active')
      })
      expect(result.current.statusFilter).toBe('active')

      act(() => {
        result.current.setStatusFilter('inactive')
      })
      expect(result.current.statusFilter).toBe('inactive')

      act(() => {
        result.current.setStatusFilter('all')
      })
      expect(result.current.statusFilter).toBe('all')
    })
  })

  describe('Category Filter Management', () => {
    it('should update category filter', () => {
      const { result } = renderHook(() => useVendorsStore())

      act(() => {
        result.current.setCategoryFilter('food-supplies')
      })

      expect(result.current.categoryFilter).toBe('food-supplies')
    })

    it('should handle category filter reset to all', () => {
      const { result } = renderHook(() => useVendorsStore())

      act(() => {
        result.current.setCategoryFilter('beverages')
        result.current.setCategoryFilter('all')
      })

      expect(result.current.categoryFilter).toBe('all')
    })

    it('should handle empty category filter', () => {
      const { result } = renderHook(() => useVendorsStore())

      act(() => {
        result.current.setCategoryFilter('')
      })

      expect(result.current.categoryFilter).toBe('')
    })

    it('should handle special category IDs', () => {
      const { result } = renderHook(() => useVendorsStore())
      const specialCategoryId = 'cat-123-$pecial'

      act(() => {
        result.current.setCategoryFilter(specialCategoryId)
      })

      expect(result.current.categoryFilter).toBe(specialCategoryId)
    })
  })

  describe('Loading State Management', () => {
    it('should set loading state to true', () => {
      const { result } = renderHook(() => useVendorsStore())

      act(() => {
        result.current.setLoading(true)
      })

      expect(result.current.isLoading).toBe(true)
    })

    it('should set loading state to false', () => {
      const { result } = renderHook(() => useVendorsStore())

      act(() => {
        result.current.setLoading(true)
        result.current.setLoading(false)
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('should handle multiple loading state changes', () => {
      const { result } = renderHook(() => useVendorsStore())

      act(() => {
        result.current.setLoading(true)
      })
      expect(result.current.isLoading).toBe(true)

      act(() => {
        result.current.setLoading(false)
      })
      expect(result.current.isLoading).toBe(false)

      act(() => {
        result.current.setLoading(true)
      })
      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('Error State Management', () => {
    it('should set error message', () => {
      const { result } = renderHook(() => useVendorsStore())
      const errorMessage = 'Failed to fetch vendors'

      act(() => {
        result.current.setError(errorMessage)
      })

      expect(result.current.error).toBe(errorMessage)
    })

    it('should clear error message', () => {
      const { result } = renderHook(() => useVendorsStore())

      act(() => {
        result.current.setError('Some error')
        result.current.setError(null)
      })

      expect(result.current.error).toBeNull()
    })

    it('should handle empty error string', () => {
      const { result } = renderHook(() => useVendorsStore())

      act(() => {
        result.current.setError('')
      })

      expect(result.current.error).toBe('')
    })

    it('should handle long error messages', () => {
      const { result } = renderHook(() => useVendorsStore())
      const longError = 'A very long error message that describes in detail what went wrong during the vendor operation processing pipeline and includes multiple technical details about the failure scenarios and recovery options available to the user interface layer for proper error handling and user feedback mechanisms.'

      act(() => {
        result.current.setError(longError)
      })

      expect(result.current.error).toBe(longError)
    })

    it('should replace previous error messages', () => {
      const { result } = renderHook(() => useVendorsStore())

      act(() => {
        result.current.setError('First error')
      })
      expect(result.current.error).toBe('First error')

      act(() => {
        result.current.setError('Second error')
      })
      expect(result.current.error).toBe('Second error')
    })
  })

  describe('Reset Filters Functionality', () => {
    it('should reset all filters to initial state', () => {
      const { result } = renderHook(() => useVendorsStore())

      // Set various filter states
      act(() => {
        result.current.setSearchTerm('test search')
        result.current.setStatusFilter('active')
        result.current.setCategoryFilter('beverages')
      })

      // Verify filters are set
      expect(result.current.searchTerm).toBe('test search')
      expect(result.current.statusFilter).toBe('active')
      expect(result.current.categoryFilter).toBe('beverages')

      // Reset filters
      act(() => {
        result.current.resetFilters()
      })

      // Verify reset
      expect(result.current.searchTerm).toBe('')
      expect(result.current.statusFilter).toBe('all')
      expect(result.current.categoryFilter).toBe('all')
    })

    it('should not affect loading and error states when resetting filters', () => {
      const { result } = renderHook(() => useVendorsStore())

      act(() => {
        result.current.setLoading(true)
        result.current.setError('Test error')
        result.current.setSearchTerm('search')
        result.current.resetFilters()
      })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBe('Test error')
      expect(result.current.searchTerm).toBe('')
    })

    it('should handle multiple consecutive resets', () => {
      const { result } = renderHook(() => useVendorsStore())

      act(() => {
        result.current.setSearchTerm('test')
        result.current.resetFilters()
        result.current.resetFilters()
        result.current.resetFilters()
      })

      expect(result.current.searchTerm).toBe('')
      expect(result.current.statusFilter).toBe('all')
      expect(result.current.categoryFilter).toBe('all')
    })
  })

  describe('Combined State Operations', () => {
    it('should handle simultaneous state updates', () => {
      const { result } = renderHook(() => useVendorsStore())

      act(() => {
        result.current.setSearchTerm('restaurant supplies')
        result.current.setStatusFilter('active')
        result.current.setCategoryFilter('food')
        result.current.setLoading(true)
        result.current.setError('Loading vendors...')
      })

      expect(result.current.searchTerm).toBe('restaurant supplies')
      expect(result.current.statusFilter).toBe('active')
      expect(result.current.categoryFilter).toBe('food')
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBe('Loading vendors...')
    })

    it('should maintain state consistency during complex operations', () => {
      const { result } = renderHook(() => useVendorsStore())

      // Simulate a complex filtering scenario
      act(() => {
        result.current.setLoading(true)
        result.current.setSearchTerm('beverage')
        result.current.setStatusFilter('active')
        result.current.setLoading(false)
        result.current.setCategoryFilter('drinks')
        result.current.setError(null)
      })

      expect(result.current.searchTerm).toBe('beverage')
      expect(result.current.statusFilter).toBe('active')
      expect(result.current.categoryFilter).toBe('drinks')
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })
})

/**
 * HELPER TESTS - Vendor Filter Helper Tests
 * 
 * This suite tests the useFilteredVendors selector function including:
 * - Vendor filtering logic
 * - Search functionality
 * - Status filtering
 * - Category filtering
 * - Combined filter scenarios
 */
describe('Helper Tests - Vendor Filter Helper Tests', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { resetFilters } = useVendorsStore.getState()
    resetFilters()
  })

  const mockVendors: Vendor[] = [
    createMockVendor({
      id: 'vendor-1',
      name: 'Fresh Food Supplies',
      description: 'Organic vegetables and fruits',
      category: { 
        id: 'cat-food', name: 'Food Supplies', description: '', 
        isActive: true, createdAt: '', updatedAt: '',
        type: 'vendor', parentId: NIL,
        vendorCount: 0, expenseCount: 0, totalAmount: 0
      },
      isActive: true
    }),
    createMockVendor({
      id: 'vendor-2',
      name: 'Beverage Distributors',
      description: 'Soft drinks and juices',
      category: { 
        id: 'cat-beverage', name: 'Beverages', description: '', isActive: true, 
        createdAt: '', updatedAt: '', type: 'vendor', parentId: NIL,
        vendorCount: 0, expenseCount: 0, totalAmount: 0
      },
      isActive: true
    }),
    createMockVendor({
      id: 'vendor-3',
      name: 'Catering Equipment',
      description: 'Kitchen equipment and utensils',
      category: { 
        id: 'cat-equipment', name: 'Equipment', description: '', isActive: true, 
        createdAt: '', updatedAt: '', type: 'vendor', parentId: NIL,
        vendorCount: 0, expenseCount: 0, totalAmount: 0
      },
      isActive: false
    }),
    createMockVendor({
      id: 'vendor-4',
      name: 'Spice & Seasonings Co',
      description: 'Premium spices and food seasonings',
      category: { 
        id: 'cat-food', name: 'Food Supplies', description: '', isActive: true, 
        createdAt: '', updatedAt: '', type: 'vendor', parentId: NIL,
        vendorCount: 0, expenseCount: 0, totalAmount: 0
      },
      isActive: true
    })
  ]

  describe('Search Filtering', () => {
    it('should filter vendors by name (case insensitive)', () => {
      const { result } = renderHook(() => {
        const store = useVendorsStore()
        const filteredVendors = useFilteredVendors(mockVendors)
        return { store, filteredVendors }
      })
      
      act(() => {
        result.current.store.setSearchTerm('fresh')
      })

      expect(result.current.filteredVendors).toHaveLength(1)
      expect(result.current.filteredVendors[0].name).toBe('Fresh Food Supplies')
    })

    it('should filter vendors by description (case insensitive)', () => {
      const { result } = renderHook(() => {
        const store = useVendorsStore()
        const filteredVendors = useFilteredVendors(mockVendors)
        return { store, filteredVendors }
      })
      
      act(() => {
        result.current.store.setSearchTerm('organic')
      })

      expect(result.current.filteredVendors).toHaveLength(1)
      expect(result.current.filteredVendors[0].description).toContain('Organic')
    })

    it('should filter vendors by category name (case insensitive)', () => {
      const { result } = renderHook(() => {
        const store = useVendorsStore()
        const filteredVendors = useFilteredVendors(mockVendors)
        return { store, filteredVendors }
      })
      
      act(() => {
        result.current.store.setSearchTerm('beverages')
      })

      expect(result.current.filteredVendors).toHaveLength(1)
      expect(result.current.filteredVendors[0].category.name).toBe('Beverages')
    })

    it('should return all vendors when search term is empty', () => {
      const { result } = renderHook(() => {
        const store = useVendorsStore()
        const filteredVendors = useFilteredVendors(mockVendors)
        return { store, filteredVendors }
      })
      
      act(() => {
        result.current.store.setSearchTerm('')
      })

      expect(result.current.filteredVendors).toHaveLength(mockVendors.length)
    })

    it('should handle partial matches in vendor names', () => {
      const { result } = renderHook(() => {
        const store = useVendorsStore()
        const filteredVendors = useFilteredVendors(mockVendors)
        return { store, filteredVendors }
      })
      
      act(() => {
        result.current.store.setSearchTerm('food')
      })

      expect(result.current.filteredVendors).toHaveLength(2)
      expect(result.current.filteredVendors.map(v => v.name)).toEqual([
        'Fresh Food Supplies',
        'Spice & Seasonings Co' // Matches via category name "Food Supplies"
      ])
    })

    it('should return empty array for non-matching search terms', () => {
      const { result } = renderHook(() => {
        const store = useVendorsStore()
        const filteredVendors = useFilteredVendors(mockVendors)
        return { store, filteredVendors }
      })
      
      act(() => {
        result.current.store.setSearchTerm('nonexistent-vendor')
      })

      expect(result.current.filteredVendors).toHaveLength(0)
    })

    it('should handle special characters in search', () => {
      const { result } = renderHook(() => {
        const store = useVendorsStore()
        const filteredVendors = useFilteredVendors(mockVendors)
        return { store, filteredVendors }
      })
      
      act(() => {
        result.current.store.setSearchTerm('spice & seasonings')
      })

      expect(result.current.filteredVendors).toHaveLength(1)
      expect(result.current.filteredVendors[0].name).toBe('Spice & Seasonings Co')
    })
  })

  describe('Status Filtering', () => {
    it('should filter active vendors only', () => {
      const { result } = renderHook(() => {
        const store = useVendorsStore()
        const filteredVendors = useFilteredVendors(mockVendors)
        return { store, filteredVendors }
      })
      
      act(() => {
        result.current.store.setStatusFilter('active')
      })

      expect(result.current.filteredVendors).toHaveLength(3)
      expect(result.current.filteredVendors.every(v => v.isActive)).toBe(true)
    })

    it('should filter inactive vendors only', () => {
      const { result } = renderHook(() => {
        const store = useVendorsStore()
        const filteredVendors = useFilteredVendors(mockVendors)
        return { store, filteredVendors }
      })
      
      act(() => {
        result.current.store.setStatusFilter('inactive')
      })

      expect(result.current.filteredVendors).toHaveLength(1)
      expect(result.current.filteredVendors[0].isActive).toBe(false)
      expect(result.current.filteredVendors[0].name).toBe('Catering Equipment')
    })

    it('should return all vendors when status filter is "all"', () => {
      const { result } = renderHook(() => {
        const store = useVendorsStore()
        const filteredVendors = useFilteredVendors(mockVendors)
        return { store, filteredVendors }
      })
      
      act(() => {
        result.current.store.setStatusFilter('all')
      })

      expect(result.current.filteredVendors).toHaveLength(mockVendors.length)
    })
  })

  describe('Category Filtering', () => {
    it('should filter vendors by specific category', () => {
      const { result } = renderHook(() => {
        const store = useVendorsStore()
        const filteredVendors = useFilteredVendors(mockVendors)
        return { store, filteredVendors }
      })
      
      act(() => {
        result.current.store.setCategoryFilter('cat-food')
      })

      expect(result.current.filteredVendors).toHaveLength(2)
      expect(result.current.filteredVendors.every(v => v.category.id === 'cat-food')).toBe(true)
    })

    it('should return all vendors when category filter is "all"', () => {
      const { result } = renderHook(() => {
        const store = useVendorsStore()
        const filteredVendors = useFilteredVendors(mockVendors)
        return { store, filteredVendors }
      })
      
      act(() => {
        result.current.store.setCategoryFilter('all')
      })

      expect(result.current.filteredVendors).toHaveLength(mockVendors.length)
    })

    it('should return empty array for non-existing category', () => {
      const { result } = renderHook(() => {
        const store = useVendorsStore()
        const filteredVendors = useFilteredVendors(mockVendors)
        return { store, filteredVendors }
      })
      
      act(() => {
        result.current.store.setCategoryFilter('non-existing-category')
      })

      expect(result.current.filteredVendors).toHaveLength(0)
    })
  })

  describe('Combined Filtering Scenarios', () => {
    it('should apply search and status filters together', () => {
      const { result } = renderHook(() => {
        const store = useVendorsStore()
        const filteredVendors = useFilteredVendors(mockVendors)
        return { store, filteredVendors }
      })
      
      act(() => {
        result.current.store.setSearchTerm('food')
        result.current.store.setStatusFilter('active')
      })

      expect(result.current.filteredVendors).toHaveLength(2)
      expect(result.current.filteredVendors.every(v => v.isActive)).toBe(true)
      expect(result.current.filteredVendors.some(v => v.name.toLowerCase().includes('food') || 
                                       v.description?.toLowerCase().includes('food') || 
                                       v.category.name?.toLowerCase().includes('food'))).toBe(true)
    })

    it('should apply search and category filters together', () => {
      const { result } = renderHook(() => {
        const store = useVendorsStore()
        const filteredVendors = useFilteredVendors(mockVendors)
        return { store, filteredVendors }
      })
      
      act(() => {
        result.current.store.setSearchTerm('supplies')
        result.current.store.setCategoryFilter('cat-food')
      })

      expect(result.current.filteredVendors).toHaveLength(2)
      expect(result.current.filteredVendors.every(v => v.category.id === 'cat-food')).toBe(true)
    })

    it('should apply status and category filters together', () => {
      const { result } = renderHook(() => {
        const store = useVendorsStore()
        const filteredVendors = useFilteredVendors(mockVendors)
        return { store, filteredVendors }
      })
      
      act(() => {
        result.current.store.setStatusFilter('active')
        result.current.store.setCategoryFilter('cat-food')
      })

      expect(result.current.filteredVendors).toHaveLength(2)
      expect(result.current.filteredVendors.every(v => v.isActive && v.category.id === 'cat-food')).toBe(true)
    })

    it('should apply all filters together', () => {
      const { result } = renderHook(() => {
        const store = useVendorsStore()
        const filteredVendors = useFilteredVendors(mockVendors)
        return { store, filteredVendors }
      })
      
      act(() => {
        result.current.store.setSearchTerm('fresh')
        result.current.store.setStatusFilter('active')
        result.current.store.setCategoryFilter('cat-food')
      })

      expect(result.current.filteredVendors).toHaveLength(1)
      expect(result.current.filteredVendors[0].name).toBe('Fresh Food Supplies')
      expect(result.current.filteredVendors[0].isActive).toBe(true)
      expect(result.current.filteredVendors[0].category.id).toBe('cat-food')
    })

    it('should return empty array when filters produce no matches', () => {
      const { result } = renderHook(() => {
        const store = useVendorsStore()
        const filteredVendors = useFilteredVendors(mockVendors)
        return { store, filteredVendors }
      })
      
      act(() => {
        result.current.store.setSearchTerm('beverage')
        result.current.store.setStatusFilter('inactive')
        result.current.store.setCategoryFilter('cat-food')
      })

      expect(result.current.filteredVendors).toHaveLength(0)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty vendor array', () => {
      const { result } = renderHook(() => {
        const filteredVendors = useFilteredVendors([])
        return filteredVendors
      })
      
      expect(result.current).toHaveLength(0)
      expect(Array.isArray(result.current)).toBe(true)
    })

    it('should handle vendors with missing optional fields', () => {
      const vendorsWithMissingFields: Vendor[] = [
        createMockVendor({
          id: 'vendor-missing',
          name: 'Vendor Without Description',
          description: '', // Empty description
          category: { 
            id: 'cat-1', name: '', description: '', isActive: true, 
            createdAt: '', updatedAt: '', type: 'vendor', parentId: NIL,
            vendorCount: 0, expenseCount: 0, totalAmount: 0
          } // Empty category name
        })
      ]

      const { result } = renderHook(() => {
        const store = useVendorsStore()
        const filteredVendors = useFilteredVendors(vendorsWithMissingFields)
        return { store, filteredVendors }
      })
      
      act(() => {
        result.current.store.setSearchTerm('vendor')
      })
      
      expect(result.current.filteredVendors).toHaveLength(1)
    })

    it('should handle null/undefined vendor properties gracefully', () => {
      const vendorsWithNulls: Vendor[] = [
        {
          ...createMockVendor(),
          description: null,
          category: { ...createMockVendor().category, name: undefined }
        } as any
      ]

      const { result } = renderHook(() => {
        const filteredVendors = useFilteredVendors(vendorsWithNulls)
        return filteredVendors
      })
      
      expect(result.current).toHaveLength(1)
    })

    it('should handle very large vendor arrays efficiently', () => {
      const largeVendorArray = Array.from({ length: 1000 }, (_, index) => 
        createMockVendor({
          id: `vendor-${index}`,
          name: `Vendor ${index}`,
          isActive: index % 2 === 0
        })
      )

      const startTime = performance.now()
      const { result } = renderHook(() => {
        const filteredVendors = useFilteredVendors(largeVendorArray)
        return filteredVendors
      })
      const endTime = performance.now()

      expect(result.current).toHaveLength(1000)
      expect(endTime - startTime).toBeLessThan(100) // Should complete in under 100ms
    })
  })
})