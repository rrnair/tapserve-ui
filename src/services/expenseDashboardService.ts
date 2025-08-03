import { request, ApiResponse } from '@/lib/api'
import { Expense } from '@/types/expense'

export interface DashboardSummary {
  totalExpenses: number
  totalAmount: number
  activeExpenses: number
  pendingExpenses: number
  approvedExpenses: number
  rejectedExpenses: number
  activeVendorsCount: number
}

export interface ExpenseByCategory {
  categoryId: string
  categoryName: string
  totalAmount: number
  count: number
}

export interface ExpenseByVendor {
  vendorId: string
  vendorName: string
  totalAmount: number
  count: number
}

export interface DashboardFilters {
  startDate?: string
  endDate?: string
  categoryId?: string
  categoryIds?: string[]
  vendorId?: string
  vendorIds?: string[]
  status?: string
}

export interface DashboardData {
  summary: DashboardSummary
  expensesByCategory: ExpenseByCategory[]
  expensesByVendor: ExpenseByVendor[]
  recentExpenses: Expense[]
}

/**
 * Get comprehensive dashboard data for expenses
 * 
 * @param filters Dashboard filter parameters
 * @returns Dashboard data with summary, charts data and recent expenses
 */
export async function getDashboardData(filters?: DashboardFilters): Promise<ApiResponse<DashboardData>> {
  return request('/expenses/dashboard', {
    method: 'GET',
    params: filters,
  })
}

/**
 * Get dashboard summary statistics
 * 
 * @param filters Dashboard filter parameters
 * @returns Summary statistics for the dashboard
 */
export async function getDashboardSummary(filters?: DashboardFilters): Promise<ApiResponse<DashboardSummary>> {
  return request('/expenses/dashboard/summary', {
    method: 'GET',
    params: filters,
  })
}

/**
 * Get expenses grouped by category for chart display
 * 
 * @param filters Dashboard filter parameters
 * @returns Expenses grouped by category
 */
export async function getExpensesByCategory(filters?: DashboardFilters): Promise<ApiResponse<ExpenseByCategory[]>> {
  return request('/expenses/dashboard/by-category', {
    method: 'GET',
    params: filters,
  })
}

/**
 * Get expenses grouped by vendor for chart display
 * 
 * @param filters Dashboard filter parameters
 * @returns Expenses grouped by vendor
 */
export async function getExpensesByVendor(filters?: DashboardFilters): Promise<ApiResponse<ExpenseByVendor[]>> {
  return request('/expenses/dashboard/by-vendor', {
    method: 'GET',
    params: filters,
  })
}