'use client'

import { useState } from 'react'
import { useExpensesStore } from '@/stores/expenses-store'
import { useVendors } from '@/hooks/useVendors'
import { NetworkStatus } from '@/components/ui/network-status'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SelectWithSearch from '@/components/select-with-search'
import { Badge } from '@/components/ui/badge'
import { 
  TooltipProvider,
} from '@/components/ui/tooltip'
import { 
  ArrowLeft, 
  Save, 
  X, 
  Info, 
  Receipt, 
  AlertCircle,
  CheckCircle,
  FileImage
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Expense } from '@/types/expense'

interface ExpenseFormData {
  amount: string
  vendorId: string
  description: string
  expenseDate: string
  billNumber: string
  billImage?: File | null
}

export default function AddExpensePage() {
  const router = useRouter()
  const { addExpense, syncStatus } = useExpensesStore()
  
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: '',
    vendorId: '',
    description: '',
    expenseDate: new Date().toISOString().slice(0, 10),
    billNumber: '',
    billImage: null
  })
  
  // Use SWR to fetch vendors
  const { vendors, isLoading, error } = useVendors({ page: 1, limit: 50 })
  
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Partial<ExpenseFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleInputChange = (field: keyof ExpenseFormData, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ExpenseFormData> = {}

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required'
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number'
    }

    if (!formData.vendorId) {
      newErrors.vendorId = 'Vendor is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    if (!formData.expenseDate) {
      newErrors.expenseDate = 'Expense date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSuccess(false)

    try {
      // Find selected vendor
      const selectedVendor = vendors?.find(v => v.id === formData.vendorId)
      if (!selectedVendor) {
        setErrors(prev => ({ ...prev, vendorId: 'Selected vendor not found' }))
        setIsSubmitting(false)
        return
      }

      // Prepare expense data
      const expenseData: Partial<Expense> = {
        tenantId: 'tenant_001', // TODO: Get from auth context
        outletId: 'outlet_001', // TODO: Get from auth context  
        amount: Number(formData.amount),
        description: formData.description,
        vendorId: selectedVendor.id,
        vendorName: selectedVendor.name,
        categoryId: selectedVendor.category.id,
        categoryName: selectedVendor.category.name,
        expenseDate: formData.expenseDate,
        billNumber: formData.billNumber,
        billImageUrl: formData.billImage?.name,
        status: 'pending',
        createdBy: 'current_user', // TODO: Get from auth context
      }

      await addExpense(expenseData)
      
      setSuccess(true)
      
      // Show different messages based on network status
      const successMessage = syncStatus.isOnline 
        ? 'Expense created and synced successfully!' 
        : 'Expense saved offline. Will sync when online.'
      
      setTimeout(() => {
        router.push(`/expenses?success=created&message=${encodeURIComponent(successMessage)}`)
      }, 1500)
      
    } catch (error) {
      console.error('Error creating expense:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create expense'
      setErrors(prev => ({ ...prev, amount: errorMessage }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/expenses')
  }

  const getVendorName = () => {
    if (!formData.vendorId) return '–'
    const vendor = vendors?.find(v => v.id === formData.vendorId)
    return vendor?.name || '–'
  }

  const getVendorCategory = () => {
    if (!formData.vendorId) return '–'
    const vendor = vendors?.find(v => v.id === formData.vendorId)
    return vendor?.category.name || '–'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-center">
        Error loading vendors: {error}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <div className="flex items-center space-x-4 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Add New Expense</h1>
                <p className="text-sm text-muted-foreground">
                  Record a new expense entry
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <NetworkStatus showDetails />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                size="sm"
                disabled={isSubmitting}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving...' : syncStatus.isOnline ? 'Create Expense' : 'Save Offline'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            {/* Success Alert */}
            {success && (
              <Alert className="mb-compact-lg border-green-200 bg-green-50 dark:bg-green-900/30">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-200">
                  {syncStatus.isOnline 
                    ? 'Expense created successfully! Redirecting...' 
                    : 'Expense saved offline! Will sync when connection is restored. Redirecting...'}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Offline Info Alert */}
            {!syncStatus.isOnline && (
              <Alert className="mb-compact-lg border-orange-200 bg-orange-50 dark:bg-orange-900/30">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <AlertDescription className="text-orange-700 dark:text-orange-200">
                  You&apos;re currently offline. Expenses will be saved locally and synced when connection is restored.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Form Section */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center">
                      <Receipt className="w-5 h-5 mr-2" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="amount">
                          Amount *
                        </Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.amount}
                          onChange={(e) => handleInputChange('amount', e.target.value)}
                          className={errors.amount ? 'border-destructive' : ''}
                        />
                        {errors.amount && (
                          <p className="text-sm text-destructive flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.amount}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className={errors.vendorId ? 'border-destructive rounded-md' : ''}>
                          <SelectWithSearch
                            label="Vendor *"
                            options={vendors?.map(vendor => ({
                              value: vendor.id,
                              label: `${vendor.name} - ${vendor.category.name}`
                            })) || []}
                            value={formData.vendorId}
                            onValueChange={(value) => handleInputChange('vendorId', value)}
                            placeholder="Select vendor..."
                            searchPlaceholder="Search vendors..."
                            emptyMessage="No vendors found."
                          />
                        </div>
                        {errors.vendorId && (
                          <p className="text-sm text-destructive flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.vendorId}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="What is this expense for? (e.g., Raw materials, utilities, maintenance)"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className={errors.description ? 'border-destructive' : ''}
                        rows={2}
                      />
                      <div className="flex justify-between items-center">
                        {errors.description ? (
                          <p className="text-sm text-destructive flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.description}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {formData.description.length}/500 characters
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expenseDate">
                        Expense Date *
                      </Label>
                      <Input
                        id="expenseDate"
                        type="date"
                        value={formData.expenseDate}
                        onChange={(e) => handleInputChange('expenseDate', e.target.value)}
                        className={errors.expenseDate ? 'border-destructive' : ''}
                      />
                      {errors.expenseDate && (
                        <p className="text-sm text-destructive flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.expenseDate}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Bill Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileImage className="w-5 h-5 mr-2" />
                      Bill Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="billNumber">
                        Bill Number
                      </Label>
                      <Input
                        id="billNumber"
                        placeholder="Enter bill/invoice number"
                        value={formData.billNumber}
                        onChange={(e) => handleInputChange('billNumber', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="billImage">
                        Bill/Receipt Image
                      </Label>
                      <Input
                        id="billImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleInputChange('billImage', e.target.files?.[0] || null)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Upload a photo of the bill or receipt
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview Section */}
              {showPreview && (
                <Card className="lg:col-span-1">
                  <CardHeader className="pb-compact-lg">
                    <CardTitle className="flex items-center">
                      <Info className="w-5 h-5 mr-2" />
                      Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-sm">Amount</Label>
                      <p className="text-base font-medium">
                        {formData.amount ? `₹${Number(formData.amount).toLocaleString('en-IN')}` : '–'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Vendor</Label>
                      <p className="text-base font-medium">{getVendorName()}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Category</Label>
                      <p className="text-base font-medium">{getVendorCategory()}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Description</Label>
                      <p className="text-base font-normal whitespace-pre-wrap">
                        {formData.description || '–'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Date</Label>
                      <p className="text-base font-medium">
                        {formData.expenseDate ? new Date(formData.expenseDate).toLocaleDateString('en-IN') : '–'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Bill Number</Label>
                      <p className="text-base font-medium">{formData.billNumber || '–'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Status</Label>
                      <Badge variant="secondary">
                        Pending
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}