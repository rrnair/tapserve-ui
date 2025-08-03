import { request, ApiResponse } from '@/lib/api'
import { Vendor } from '@/types/vendor'


/**
 * A vendor supplies a raw material or provides a service service, this service handles CRUD on vendors
 * 
 * @author Ratheesh Nair
 * @since 0.1.0
 */
export interface VendorFilters {
  page?: number
  limit?: number
  search?: string
  type?: 'supplier' | 'vendor'
  isActive?: boolean
}

/**
 * Returns one or more Vendors.
 * 
 * @param filters UI search filter
 * @returns a paginated response containing one or more Vendors
 */
export async function getVendors(filters?: VendorFilters): Promise<ApiResponse<{
  items: Vendor[]
  total: number
  page: number
  limit: number
}>> {
  console.log(`Fetch all vendors ${filters}`);
  return request('/vendors', {
    method: 'GET',
    params: filters,
  })
}

/**
 * Get a Vendor by Id.
 * 
 * @param id Unique identifier of Vendor
 * @returns Vendor instance or null if not found
 */
export async function getVendor(id: string): Promise<ApiResponse<Vendor>> {
  return request<Vendor>(`/vendors/${id}`, {
    method: 'GET',
  })
}

/**
 * Creates a Vendor 
 * 
 * @param Vendor A vendor instance
 * @returns Created Vendor instance
 */
export async function createVendor(vendor: Partial<Vendor>): Promise<ApiResponse<Vendor>> {


  return request<Vendor>('/vendors', {
    method: 'POST',
    data: vendor,
  })
}

/**
 * Update a Vendor
 * 
 * @param id Unique identidier of Vendor to update
 * @param Vendor 
 * @returns Updated Vendor instance
 */
export async function updateVendor(id: string, vendor: Partial<Vendor>): Promise<ApiResponse<Vendor>> {
  return request<Vendor>(`/vendors/${id}`, {
    method: 'PUT',
    data: vendor,
  })
}

/**
 * Removes a Vendor
 * 
 * @param id Vendor to remove
 * @returns void
 */
export async function deleteVendor(id: string): Promise<ApiResponse<void>> {
  return request<void>(`/vendors/${id}`, {
    method: 'DELETE',
  })
}
