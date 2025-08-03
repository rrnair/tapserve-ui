import { request, ApiResponse } from '@/lib/api'
import { Category } from '@/types/category'


/**
 * A category service handles CRUD on category in the system. The category may be 'Fresh market', 'Beverages'
 * etc which are closely related to restuarant food industry. A category can have sub categories which are children
 * for instance: category "Utilities" can have "LPG", "Maintenance - Electricity" etc which are running exprenses
 * of a restuarant. A category is used for grouping expenses and it can be supplied by a supplier/vendor and there
 * can be multiple vendors for a given category. For instance "Poultry" is a category and there can be multiple suppliers
 * for a child category "Chicken".
 * 
 * @author Ratheesh Nair
 * @since 0.1.0
 */
export interface CategoryFilters {
  page?: number
  limit?: number
  search?: string
  type?: 'supplier' | 'vendor'
  parentId?: string
  isActive?: boolean
}

/**
 * Returns one or more categories.
 * 
 * @param filters UI search filter
 * @returns a paginated response containing one or more categories
 */
export async function getCategories(filters?: CategoryFilters): Promise<ApiResponse<{
  items: Category[]
  total: number
  page: number
  limit: number
}>> {
  return request('/categories', {
    method: 'GET',
    params: filters,
  })
}

/**
 * Get a category by Id.
 * 
 * @param id Unique identifier of category
 * @returns Category instance or null if not found
 */
export async function getCategory(id: string): Promise<ApiResponse<Category>> {
  return request<Category>(`/categories/${id}`, {
    method: 'GET',
  })
}

/**
 * Creates a category 
 * 
 * @param category A category instance
 * @returns Created category instance
 */
export async function createCategory(category: Partial<Category>): Promise<ApiResponse<Category>> {

  // Is this a child category
  if (category.parentId === 'No') {
    // Keep parentId as undefined
    delete category.parentId
  }

  return request<Category>('/categories', {
    method: 'POST',
    data: category,
  })
}

/**
 * Update a category
 * 
 * @param id Unique identidier of category to update
 * @param category 
 * @returns Updated category instance
 */
export async function updateCategory(id: string, category: Partial<Category>): Promise<ApiResponse<Category>> {
  return request<Category>(`/categories/${id}`, {
    method: 'PUT',
    data: category,
  })
}

/**
 * Removes a category
 * 
 * @param id Category to remove
 * @returns void
 */
export async function deleteCategory(id: string): Promise<ApiResponse<void>> {
  return request<void>(`/categories/${id}`, {
    method: 'DELETE',
  })
}
