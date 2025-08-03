import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { 
  getVendors, 
  getVendor, 
  createVendor, 
  updateVendor, 
  deleteVendor,
  VendorFilters 
} from '@/services/vendorService'
import { request } from '@/lib/api'
import { Vendor } from '@/types/vendor'


/**
 * Tests features of Vendor Service
 * 
 * @author Ratheesh Nair
 * @since 0.1.0
 */

// Mock the API client
jest.mock('@/lib/api', () => ({
  request: jest.fn(),
}))

const mockRequest = jest.mocked(request)

// Test data factory
const createMockVendor = (overrides: Partial<Vendor> = {}): Vendor => ({
  id: '123',
  name: 'Test Vendor',
  description: 'Test vendor description',
  category: {
    id: 'cat-1',
    name: 'Food Supplies',
    description: 'Food and beverage supplies',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    type: 'vendor',
    parentId: 'parent-cat-1',
    vendorCount: 10,
    expenseCount: 5,
    totalAmount: 10000, 
  },
  expenseCount: 5,
  contact: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@testvendor.com',
    phone: [{ countryCode: 91, phone: 1234567890 }],
    address: {
      street: '123 Main St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'Test Country'
    }
  },
  accounts: [{
    id: 'acc-1',
    accountNo: '12345678',
    bank: {
      name: 'Test Bank',
      ifsc: 'TB001',
      accountType: 'checking',
      txnMatchRule: 'Test rule',
    },
  }],
  imageUrls: ['https://example.com/vendor1.jpg'],
  isActive: true,
  totalAmount: 1500.50,
  createdBy: 'user-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides
})

/**
 * SERVICE TESTS - Vendor Service Tests
 * 
 * This suite tests the vendor service layer functionality including:
 * - CRUD operations (Create, Read, Update, Delete)
 * - API integration
 * - Error handling
 * - Data transformation
 * - Filter functionality
 */
describe('Service Tests - Vendor Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const mockVendor = createMockVendor()

  describe('getVendors - Fetch Multiple Vendors', () => {
    const mockVendorsResponse = {
      success: true,
      data: {
        items: [mockVendor],
        total: 1,
        page: 1,
        limit: 10
      }
    }

    it('should successfully fetch vendors without filters', async () => {
      mockRequest.mockResolvedValue(mockVendorsResponse)

      const result = await getVendors()

      expect(mockRequest).toHaveBeenCalledWith('/vendors', {
        method: 'GET',
        params: undefined,
      })
      expect(result).toEqual(mockVendorsResponse)
      expect(result.success).toBe(true)
      expect(result.data?.items).toHaveLength(1)
    })

    it('should fetch vendors with complete filter set', async () => {
      const filters: VendorFilters = {
        page: 2,
        limit: 20,
        search: 'test supplier',
        type: 'supplier',
        isActive: true
      }
      mockRequest.mockResolvedValue(mockVendorsResponse)

      const result = await getVendors(filters)

      expect(mockRequest).toHaveBeenCalledWith('/vendors', {
        method: 'GET',
        params: filters,
      })
      expect(result).toEqual(mockVendorsResponse)
    })

    it('should handle pagination correctly', async () => {
      const paginationFilter = { page: 5, limit: 50 }
      mockRequest.mockResolvedValue({
        ...mockVendorsResponse,
        data: { ...mockVendorsResponse.data, page: 5, limit: 50 }
      })

      const result = await getVendors(paginationFilter)

      expect(result.data?.page).toBe(5)
      expect(result.data?.limit).toBe(50)
    })

    it('should handle search functionality', async () => {
      const searchFilter = { search: 'food vendor' }
      mockRequest.mockResolvedValue(mockVendorsResponse)

      await getVendors(searchFilter)

      expect(mockRequest).toHaveBeenCalledWith('/vendors', {
        method: 'GET',
        params: searchFilter,
      })
    })

    it('should handle type filtering (supplier)', async () => {
      const typeFilter = { type: 'supplier' as const }
      mockRequest.mockResolvedValue(mockVendorsResponse)

      await getVendors(typeFilter)

      expect(mockRequest).toHaveBeenCalledWith('/vendors', {
        method: 'GET',
        params: typeFilter,
      })
    })

    it('should handle type filtering (vendor)', async () => {
      const typeFilter = { type: 'vendor' as const }
      mockRequest.mockResolvedValue(mockVendorsResponse)

      await getVendors(typeFilter)

      expect(mockRequest).toHaveBeenCalledWith('/vendors', {
        method: 'GET',
        params: typeFilter,
      })
    })

    it('should handle active status filtering', async () => {
      const activeFilter = { isActive: false }
      mockRequest.mockResolvedValue(mockVendorsResponse)

      await getVendors(activeFilter)

      expect(mockRequest).toHaveBeenCalledWith('/vendors', {
        method: 'GET',
        params: activeFilter,
      })
    })

    it('should handle API errors gracefully', async () => {
      const errorResponse = {
        success: false,
        error: 'Internal server error'
      }
      mockRequest.mockResolvedValue(errorResponse)

      const result = await getVendors()

      expect(result).toEqual(errorResponse)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle network failures', async () => {
      const networkError = {
        success: false,
        error: 'Network request failed'
      }
      mockRequest.mockResolvedValue(networkError)

      const result = await getVendors()

      expect(result.success).toBe(false)
    })

    it('should log filter information', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
      mockRequest.mockResolvedValue(mockVendorsResponse)
      
      const filters = { search: 'test', page: 1 }
      await getVendors(filters)

      expect(consoleSpy).toHaveBeenCalledWith(`Fetch all vendors ${filters}`)
      consoleSpy.mockRestore()
    })
  })

  describe('getVendor - Fetch Single Vendor', () => {
    const mockVendorResponse = {
      success: true,
      data: mockVendor
    }

    it('should successfully fetch vendor by valid id', async () => {
      mockRequest.mockResolvedValue(mockVendorResponse)

      const result = await getVendor('123')

      expect(mockRequest).toHaveBeenCalledWith('/vendors/123', {
        method: 'GET',
      })
      expect(result).toEqual(mockVendorResponse)
      expect(result.data?.id).toBe('123')
    })

    it('should handle vendor not found', async () => {
      const notFoundResponse = {
        success: false,
        error: 'Vendor not found'
      }
      mockRequest.mockResolvedValue(notFoundResponse)

      const result = await getVendor('nonexistent-id')

      expect(result).toEqual(notFoundResponse)
      expect(result.success).toBe(false)
    })

    it('should handle empty vendor id', async () => {
      mockRequest.mockResolvedValue(mockVendorResponse)

      await getVendor('')

      expect(mockRequest).toHaveBeenCalledWith('/vendors/', {
        method: 'GET',
      })
    })

    it('should handle malformed vendor id', async () => {
      const invalidResponse = {
        success: false,
        error: 'Invalid vendor ID format'
      }
      mockRequest.mockResolvedValue(invalidResponse)

      const result = await getVendor('invalid-id-format')

      expect(result.success).toBe(false)
    })
  })

  describe('createVendor - Create New Vendor', () => {
    it('should successfully create vendor with complete data', async () => {
      const newVendor: Partial<Vendor> = {
        name: 'New Fresh Produce Vendor',
        description: 'Supplies fresh vegetables and fruits',
        category: mockVendor.category,
        contact: mockVendor.contact,
        isActive: true,
        imageUrls: ['https://example.com/newvendor.jpg']
      }
      
      const createResponse = {
        success: true,
        data: createMockVendor(newVendor)
      }
      mockRequest.mockResolvedValue(createResponse)

      const result = await createVendor(newVendor)

      expect(mockRequest).toHaveBeenCalledWith('/vendors', {
        method: 'POST',
        data: newVendor,
      })
      expect(result).toEqual(createResponse)
      expect(result.data?.name).toBe('New Fresh Produce Vendor')
    })

    it('should create vendor with minimal required data', async () => {
      const minimalVendor: Partial<Vendor> = {
        name: 'Minimal Vendor',
        isActive: true
      }
      
      const response = {
        success: true,
        data: createMockVendor(minimalVendor)
      }
      mockRequest.mockResolvedValue(response)

      const result = await createVendor(minimalVendor)

      expect(mockRequest).toHaveBeenCalledWith('/vendors', {
        method: 'POST',
        data: minimalVendor,
      })
      expect(result.success).toBe(true)
    })

    it('should handle validation errors for invalid data', async () => {
      const invalidVendor = { name: '', description: 'No name provided' }
      const validationError = {
        success: false,
        error: 'Validation failed: name is required'
      }
      mockRequest.mockResolvedValue(validationError)

      const result = await createVendor(invalidVendor)

      expect(result).toEqual(validationError)
      expect(result.success).toBe(false)
    })

    it('should handle duplicate vendor name error', async () => {
      const duplicateVendor = { name: 'Existing Vendor' }
      const duplicateError = {
        success: false,
        error: 'Vendor with this name already exists'
      }
      mockRequest.mockResolvedValue(duplicateError)

      const result = await createVendor(duplicateVendor)

      expect(result.success).toBe(false)
      expect(result.error).toContain('already exists')
    })

    it('should handle server errors during creation', async () => {
      const vendor = { name: 'Test Vendor' }
      const serverError = {
        success: false,
        error: 'Internal server error'
      }
      mockRequest.mockResolvedValue(serverError)

      const result = await createVendor(vendor)

      expect(result.success).toBe(false)
    })
  })

  describe('updateVendor - Update Existing Vendor', () => {
    it('should successfully update vendor with complete data', async () => {
      const updates: Partial<Vendor> = {
        name: 'Updated Vendor Name',
        description: 'Updated comprehensive description',
        isActive: false,
        totalAmount: 2500.75
      }
      
      const updateResponse = {
        success: true,
        data: createMockVendor({ ...mockVendor, ...updates })
      }
      mockRequest.mockResolvedValue(updateResponse)

      const result = await updateVendor('123', updates)

      expect(mockRequest).toHaveBeenCalledWith('/vendors/123', {
        method: 'PUT',
        data: updates,
      })
      expect(result).toEqual(updateResponse)
      expect(result.data?.name).toBe('Updated Vendor Name')
      expect(result.data?.isActive).toBe(false)
    })

    it('should handle partial updates', async () => {
      const partialUpdate = { description: 'Only description updated' }
      const response = {
        success: true,
        data: createMockVendor({ ...mockVendor, ...partialUpdate })
      }
      mockRequest.mockResolvedValue(response)

      const result = await updateVendor('123', partialUpdate)

      expect(result.data?.description).toBe('Only description updated')
      expect(result.data?.name).toBe(mockVendor.name) // Should remain unchanged
    })

    it('should handle contact information updates', async () => {
      const contactUpdate: Partial<Vendor> = {
        contact: {
          ...mockVendor.contact,
          email: 'updated@vendor.com',
          phone: [{ countryCode: 91, phone: 9876543210 }]
        }
      }
      
      const response = {
        success: true,
        data: createMockVendor(contactUpdate)
      }
      mockRequest.mockResolvedValue(response)

      const result = await updateVendor('123', contactUpdate)

      expect(result.data?.contact.email).toBe('updated@vendor.com')
      expect(result.data?.contact.phone).toStrictEqual([{"countryCode": 91, "phone": 9876543210}])
    })

    it('should handle account information updates', async () => {
      const accountUpdate: Partial<Vendor> = {
        accounts: [{
          ...mockVendor.accounts![0],
          accountNo: '87654321',
          bank: {
            name: 'Updated Bank', ifsc: 'UPDATED123', 
            accountType: 'savings',
            // Optional address update
            address: mockVendor.accounts![0].bank?.address
          }
        }]
      }
      
      const response = {
        success: true,
        data: createMockVendor(accountUpdate)
      }
      mockRequest.mockResolvedValue(response)

      const result = await updateVendor('123', accountUpdate)

      expect(result.data?.accounts![0].accountNo).toBe('87654321')
      expect(result.data?.accounts![0].bank?.name).toBe('Updated Bank')
    })

    it('should handle vendor not found during update', async () => {
      const updates = { name: 'Updated Name' }
      const notFoundError = {
        success: false,
        error: 'Vendor not found'
      }
      mockRequest.mockResolvedValue(notFoundError)

      const result = await updateVendor('nonexistent', updates)

      expect(result).toEqual(notFoundError)
      expect(result.success).toBe(false)
    })

    it('should handle empty updates object', async () => {
      const emptyUpdates = {}
      const response = {
        success: true,
        data: mockVendor
      }
      mockRequest.mockResolvedValue(response)

      const result = await updateVendor('123', emptyUpdates)

      expect(mockRequest).toHaveBeenCalledWith('/vendors/123', {
        method: 'PUT',
        data: emptyUpdates,
      })
      expect(result.success).toBe(true)
    })

    it('should handle validation errors during update', async () => {
      const invalidUpdate = { name: '' }
      const validationError = {
        success: false,
        error: 'Validation failed: name cannot be empty'
      }
      mockRequest.mockResolvedValue(validationError)

      const result = await updateVendor('123', invalidUpdate)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Validation failed')
    })
  })

  describe('deleteVendor - Remove Vendor', () => {
    it('should successfully delete vendor', async () => {
      const deleteResponse = {
        success: true,
        data: undefined
      }
      mockRequest.mockResolvedValue(deleteResponse)

      const result = await deleteVendor('123')

      expect(mockRequest).toHaveBeenCalledWith('/vendors/123', {
        method: 'DELETE',
      })
      expect(result).toEqual(deleteResponse)
      expect(result.success).toBe(true)
    })

    it('should handle vendor not found during deletion', async () => {
      const notFoundError = {
        success: false,
        error: 'Vendor not found'
      }
      mockRequest.mockResolvedValue(notFoundError)

      const result = await deleteVendor('nonexistent')

      expect(result).toEqual(notFoundError)
      expect(result.success).toBe(false)
    })

    it('should handle deletion of vendor with existing expenses', async () => {
      const conflictError = {
        success: false,
        error: 'Cannot delete vendor with existing expenses. Archive the vendor instead.'
      }
      mockRequest.mockResolvedValue(conflictError)

      const result = await deleteVendor('vendor-with-expenses')

      expect(result).toEqual(conflictError)
      expect(result.success).toBe(false)
      expect(result.error).toContain('existing expenses')
    })

    it('should handle cascading deletion restrictions', async () => {
      const cascadeError = {
        success: false,
        error: 'Cannot delete vendor due to foreign key constraints'
      }
      mockRequest.mockResolvedValue(cascadeError)

      const result = await deleteVendor('123')

      expect(result.success).toBe(false)
    })

    it('should handle empty vendor id during deletion', async () => {
      const response = { success: true, data: undefined }
      mockRequest.mockResolvedValue(response)

      await deleteVendor('')

      expect(mockRequest).toHaveBeenCalledWith('/vendors/', {
        method: 'DELETE',
      })
    })

    it('should handle authorization errors', async () => {
      const authError = {
        success: false,
        error: 'Insufficient permissions to delete vendor'
      }
      mockRequest.mockResolvedValue(authError)

      const result = await deleteVendor('123')

      expect(result.success).toBe(false)
      expect(result.error).toContain('permissions')
    })
  })

  describe('VendorFilters - Type Safety and Validation', () => {
    it('should accept all valid filter combinations', () => {
      const validFilters: VendorFilters[] = [
        {},
        { page: 1 },
        { limit: 10 },
        { search: 'test query' },
        { type: 'supplier' },
        { type: 'vendor' },
        { isActive: true },
        { isActive: false },
        {
          page: 2,
          limit: 50,
          search: 'food supplies',
          type: 'supplier',
          isActive: true
        }
      ]

      validFilters.forEach(filter => {
        expect(typeof filter).toBe('object')
        if (filter.page) expect(typeof filter.page).toBe('number')
        if (filter.limit) expect(typeof filter.limit).toBe('number')
        if (filter.search) expect(typeof filter.search).toBe('string')
        if (filter.type) expect(['supplier', 'vendor'].includes(filter.type)).toBe(true)
        if (filter.isActive !== undefined) expect(typeof filter.isActive).toBe('boolean')
      })
    })

    it('should handle edge cases in filter values', () => {
      const edgeCaseFilters: VendorFilters[] = [
        { page: 0 },          // Edge case: page 0
        { limit: 1 },         // Edge case: minimal limit
        { search: '' },       // Edge case: empty search
        { search: '   ' },    // Edge case: whitespace search
      ]

      edgeCaseFilters.forEach(filter => {
        expect(() => getVendors(filter)).not.toThrow()
      })
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle undefined responses', async () => {
      mockRequest.mockResolvedValue(undefined as any)

      const result = await getVendors()

      expect(result).toBeUndefined()
    })

    it('should handle null responses', async () => {
      mockRequest.mockResolvedValue(null as any)

      const result = await getVendor('123')

      expect(result).toBeNull()
    })

    it('should handle malformed API responses', async () => {
      const malformedResponse = {
        success: true,
        data: 'invalid-data-format'
      }
      mockRequest.mockResolvedValue(malformedResponse)

      const result = await getVendors()

      expect(result).toEqual(malformedResponse)
    })

    it('should handle timeout scenarios', async () => {
      const timeoutError = {
        success: false,
        error: 'Request timeout'
      }
      mockRequest.mockResolvedValue(timeoutError)

      const result = await getVendors()

      expect(result.success).toBe(false)
      expect(result.error).toContain('timeout')
    })
  })
})