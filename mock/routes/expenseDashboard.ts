import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { Expense } from '../../src/types/expense';

/**
 * Expense Dashboard mock routes and handlers for dashboard analytics
 * 
 * @author Ratheesh Nair
 * @since 0.1.0
 */
const expenseDashboardRoute = Router();
const dashboardDataFile = path.resolve(__dirname, '../data/dashboardData.json');
const expensesDataFile = path.resolve(__dirname, '../data/expenses.json');

const loadDashboardData = () => {
  const raw = fs.readFileSync(dashboardDataFile, 'utf-8');
  return JSON.parse(raw);
};

const loadExpensesData = () => {
  const raw = fs.readFileSync(expensesDataFile, 'utf-8');
  return JSON.parse(raw) as Expense[];
};

// Helper function to filter data based on query parameters
const applyFilters = (data: any, filters: any) => {
  const { startDate, endDate, categoryId, categoryIds, vendorId, vendorIds, status } = filters;
  
  // Parse array parameters if they come as strings
  const parsedCategoryIds = categoryIds ? (typeof categoryIds === 'string' ? categoryIds.split(',') : categoryIds) : [];
  const parsedVendorIds = vendorIds ? (typeof vendorIds === 'string' ? vendorIds.split(',') : vendorIds) : [];
  
  if (!startDate && !endDate && !categoryId && !vendorId && !status && parsedCategoryIds.length === 0 && parsedVendorIds.length === 0) {
    return data;
  }

  // For summary data, apply basic filtering logic
  const filteredData = JSON.parse(JSON.stringify(data)); // Deep clone
  
  // Apply date filters to expenses
  if (startDate || endDate) {
    filteredData.recentExpenses = filteredData.recentExpenses.filter((expense: any) => {
      const expenseDate = new Date(expense.expenseDate);
      const start = startDate ? new Date(startDate) : new Date('2000-01-01');
      const end = endDate ? new Date(endDate) : new Date('2099-12-31');
      return expenseDate >= start && expenseDate <= end;
    });
  }
  
  // Apply category filters (handle both single and multiple)
  if ((categoryId && categoryId !== 'all') || parsedCategoryIds.length > 0) {
    const categoryIdsToFilter = parsedCategoryIds.length > 0 ? parsedCategoryIds : [categoryId];
    filteredData.recentExpenses = filteredData.recentExpenses.filter((expense: any) => 
      categoryIdsToFilter.includes(expense.categoryId)
    );
    filteredData.expensesByCategory = filteredData.expensesByCategory.filter((item: any) => 
      categoryIdsToFilter.includes(item.categoryId)
    );
  }
  
  // Apply vendor filters (handle both single and multiple)
  if ((vendorId && vendorId !== 'all') || parsedVendorIds.length > 0) {
    const vendorIdsToFilter = parsedVendorIds.length > 0 ? parsedVendorIds : [vendorId];
    filteredData.recentExpenses = filteredData.recentExpenses.filter((expense: any) => 
      vendorIdsToFilter.includes(expense.vendorId)
    );
    filteredData.expensesByVendor = filteredData.expensesByVendor.filter((item: any) => 
      vendorIdsToFilter.includes(item.vendorId)
    );
  }
  
  // Apply status filter
  if (status && status !== 'all') {
    filteredData.recentExpenses = filteredData.recentExpenses.filter((expense: any) => 
      expense.status === status
    );
  }

  // Recalculate summary based on filtered expenses
  const filteredExpenses = filteredData.recentExpenses;
  filteredData.summary = {
    totalExpenses: filteredExpenses.length,
    totalAmount: filteredExpenses.reduce((sum: number, expense: any) => sum + expense.amount, 0),
    activeExpenses: filteredExpenses.filter((e: any) => e.status === 'approved').length,
    pendingExpenses: filteredExpenses.filter((e: any) => e.status === 'pending').length,
    approvedExpenses: filteredExpenses.filter((e: any) => e.status === 'approved').length,
    rejectedExpenses: filteredExpenses.filter((e: any) => e.status === 'rejected').length,
    activeVendorsCount: new Set(filteredExpenses.map((e: any) => e.vendorId)).size
  };

  return filteredData;
};

// GET /api/v1/expenses/dashboard - Get complete dashboard data
expenseDashboardRoute.get('/', (req, res) => {
  console.log(`Get dashboard data: ${JSON.stringify(req.query)}`);
  
  try {
    const rawData = loadDashboardData();
    const filteredData = applyFilters(rawData, req.query);
    
    res.json({
      success: true,
      data: filteredData
    });
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load dashboard data'
    });
  }
});

// GET /api/v1/expenses/dashboard/summary - Get dashboard summary only
expenseDashboardRoute.get('/summary', (req, res) => {
  console.log(`Get dashboard summary: ${JSON.stringify(req.query)}`);
  
  try {
    const rawData = loadDashboardData();
    const filteredData = applyFilters(rawData, req.query);
    
    res.json({
      success: true,
      data: filteredData.summary
    });
  } catch (error) {
    console.error('Error loading dashboard summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load dashboard summary'
    });
  }
});

// GET /api/v1/expenses/dashboard/by-category - Get expenses grouped by category
expenseDashboardRoute.get('/by-category', (req, res) => {
  console.log(`Get expenses by category: ${JSON.stringify(req.query)}`);
  
  try {
    const rawData = loadDashboardData();
    const filteredData = applyFilters(rawData, req.query);
    
    res.json({
      success: true,
      data: filteredData.expensesByCategory
    });
  } catch (error) {
    console.error('Error loading expenses by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load expenses by category'
    });
  }
});

// GET /api/v1/expenses/dashboard/by-vendor - Get expenses grouped by vendor
expenseDashboardRoute.get('/by-vendor', (req, res) => {
  console.log(`Get expenses by vendor: ${JSON.stringify(req.query)}`);
  
  try {
    const rawData = loadDashboardData();
    const filteredData = applyFilters(rawData, req.query);
    
    res.json({
      success: true,
      data: filteredData.expensesByVendor
    });
  } catch (error) {
    console.error('Error loading expenses by vendor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load expenses by vendor'
    });
  }
});

export default expenseDashboardRoute;