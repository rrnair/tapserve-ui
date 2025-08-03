
import { Vendor } from "./vendor"

/**
 * An expense record to track daily expense.
 * 
 * @author Ratheesh Nair
 * @since 0.10
 */
export interface Expense {
  id: string
  tenantId: string
  outletId: string
  amount: number
  description?: string
  expenseDate: string
  vendorId?: string
  vendorName: string
  categoryId: string
  categoryName: string
  billNumber?: string
  billImageUrl?: string
  ocrExtractedData?: OCRData
  ocrConfidenceScore?: number
  status: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvedAt?: string
  approvalNotes?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}


export interface OCRData {
  text: string
  confidence: number
  extractedFields: {
    amount?: number
    date?: string
    supplier?: string
    billNumber?: string
  }
}