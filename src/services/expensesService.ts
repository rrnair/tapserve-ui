import { request, ApiResponse } from '@/lib/api'
import { Expense } from '@/types/expense'


/**
 * An expense is a spend item - usually a cashier enters this item either by uploading an image of a invoice/bill or
 * enters by hand. An expense item is always associated with a vendor who supplied the raw material.
 * 
 * @author Ratheesh Nair
 * @since 0.1.0
 */
export interface ExpenseFilters {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  startDate?: string
  endDate?: string
  categoryId?: string
  vendorId?: string
  status?: string
}

/**
 * Returns one or more Expense entries.
 * 
 * @param filters UI search filter
 * @returns a paginated response containing one or more expense entries
 */
export async function getExpenses(filters?: ExpenseFilters): Promise<ApiResponse<{
  items: Expense[]
  total: number
  page: number
  limit: number
}>> {
  console.log(`Fetch all expenses ${JSON.stringify(filters)}`);
  return request('/expenses', {
    method: 'GET',
    params: filters,
  })
}

/**
 * Get a Expense item by Id.
 * 
 * @param id Unique identifier of expense item entry
 * @returns Expense instance or null if not found
 */
export async function getExpense(id: string): Promise<ApiResponse<Expense>> {
  return request<Expense>(`/expenses/${id}`, {
    method: 'GET',
  })
}

/**
 * Creates an Expense entry 
 * 
 * @param expense A expense item instance
 * @returns Created expense instance
 */
export async function createExpense(expense: Partial<Expense>): Promise<ApiResponse<Expense>> {

  console.log(`Creating expense entry ${JSON.stringify(expense)}`);
  
  return request<Expense>('/expenses', {
    method: 'POST',
    data: expense,
  })
}

/**
 * Update a Expense entry
 * 
 * @param id Unique identidier of an Expense entry to update
 * @param Expense item 
 * @returns Updated expense instance
 */
export async function updateExpense(id: string, expense: Partial<Expense>): Promise<ApiResponse<Expense>> {
  return request<Expense>(`/expenses/${id}`, {
    method: 'PUT',
    data: expense,
  })
}

/**
 * Removes an Expense entry
 * 
 * @param id Expense to remove
 * @returns void
 */
export async function deleteVExpense(id: string): Promise<ApiResponse<void>> {
  return request<void>(`/expenses/${id}`, {
    method: 'DELETE',
  })
}
