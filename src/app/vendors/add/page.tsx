'use client'

import { useState } from 'react'
import { createVendor, getVendors } from '@/services/vendorService'
import { useCategories } from '@/hooks/useCategories'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import SelectWithSearch from '@/components/select-with-search'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  TooltipProvider,
} from '@/components/ui/tooltip'
import { 
  ArrowLeft, 
  Save, 
  X, 
  Info, 
  Store, 
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Plus,
  Trash2,
  User
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Vendor } from '@/types/vendor'

interface AccountFormData {
  id: string
  accountNo: string
  bankName: string
  ifsc: string
  accountType: string
  txnMatchRule: string
  // Bank address
  bankHead: string
  bankBuilding: string
  bankStreet: string
  bankCity: string
  bankState: string
  bankCountry: string
  bankZipCode: string
}

interface VendorFormData {
  name: string
  description: string
  category: string
  // Contact details
  firstName: string
  lastName: string
  email: string
  phone: string
  countryCode: string
  // Address details
  head: string
  building: string
  street: string
  city: string
  state: string
  country: string
  zipCode: string
  isActive: boolean
  imageUrls: string[]
  // Multiple accounts
  accounts: AccountFormData[]
}

export default function AddVendorPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<VendorFormData>({
    name: '',
    description: '',
    category: '',
    // Contact details
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+91',
    // Address details
    head: '',
    building: '',
    street: '',
    city: '',
    state: '',
    country: 'IN',
    zipCode: '',
    isActive: true,
    imageUrls: [],
    // Multiple accounts
    accounts: []
  })
  
  // Use SWR to fetch categories
  const { categories, error } = useCategories({ page: 1, limit: 50 })
  
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Partial<VendorFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleInputChange = (field: keyof VendorFormData, value: string | boolean | string[] | AccountFormData[]) => {
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

  const createEmptyAccount = (): AccountFormData => ({
    id: '',
    accountNo: '',
    bankName: '',
    ifsc: '',
    accountType: 'savings',
    txnMatchRule: '',
    bankHead: '',
    bankBuilding: '',
    bankStreet: '',
    bankCity: '',
    bankState: '',
    bankCountry: 'IN',
    bankZipCode: ''
  })

  const addAccount = () => {
    const newAccount = createEmptyAccount()
    setFormData(prev => ({
      ...prev,
      accounts: [...prev.accounts, newAccount]
    }))
  }

  const removeAccount = (index: number) => {
    setFormData(prev => ({
      ...prev,
      accounts: prev.accounts.filter((_, i) => i !== index)
    }))
  }

  const updateAccount = (index: number, field: keyof AccountFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      accounts: prev.accounts.map((account, i) => 
        i === index ? { ...account, [field]: value } : account
      )
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<VendorFormData> = {}

    // Basic validations
    if (!formData.name.trim()) {
      newErrors.name = 'Vendor name is required'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Vendor name must be at least 2 characters'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Vendor name must be less than 100 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    // Contact validations
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits'
    }

    // Address validations (city, state, country are required)
    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required'
    }

    if (formData.zipCode && !/^\d{5,10}$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Zip code must be 5-10 digits'
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
      // Check if vendor with same name exists
      const existing = await getVendors({ search: formData.name })
      if (
        existing.success &&
        existing.data?.items?.some(
          vendor => vendor.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
        )
      ) {
        setErrors(prev => ({ ...prev, name: 'Vendor with this name already exists' }))
        setIsSubmitting(false)
        return
      }

      // Find selected category
      const selectedCategory = categories?.find(cat => cat.id === formData.category)
      if (!selectedCategory) {
        setErrors(prev => ({ ...prev, name: 'Selected category not found' }))
        setIsSubmitting(false)
        return
      }

      // Prepare vendor data
      const vendorData: Partial<Vendor> = {
        name: formData.name,
        description: formData.description,
        category: selectedCategory,
        contact: {
          firstName: formData.firstName,
          lastName: formData.lastName || undefined,
          email: formData.email || undefined,
          phone: formData.phone ? [{
            phone: parseInt(formData.phone),
            countryCode: parseInt(formData.countryCode.replace('+', ''))
          }] : undefined,
          address: {
            head: formData.head || undefined,
            building: formData.building || undefined,
            street: formData.street || undefined,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            zipCode: formData.zipCode || undefined
          }
        },
        imageUrls: formData.imageUrls,
        isActive: formData.isActive,
        totalAmount: 0,
        expenseCount: 0,
        // Include accounts if provided
        accounts: formData.accounts.length > 0 ? formData.accounts.map(account => ({
          id: account.id || '', // Will be generated by the server
          accountNo: account.accountNo,
          bank: account.bankName || account.ifsc ? {
            name: account.bankName,
            ifsc: account.ifsc,
            accountType: account.accountType,
            txnMatchRule: account.txnMatchRule || undefined,
            address: (account.bankCity || account.bankState) ? {
              head: account.bankHead || undefined,
              building: account.bankBuilding || undefined,
              street: account.bankStreet || undefined,
              city: account.bankCity,
              state: account.bankState,
              country: account.bankCountry,
              zipCode: account.bankZipCode || undefined
            } : undefined
          } : undefined
        })) : undefined
      }

      const response = await createVendor(vendorData)

      if (response.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/vendors?success=created')
        }, 1500)
      } else {
        alert(response.error || 'Failed to create vendor')
      }
    } catch (error) {
      console.error('Error creating vendor:', error)
      alert('Unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/vendors')
  }

  const getCategoryName = () => {
    if (!formData.category) return '–'
    const category = categories?.find(c => c.id === formData.category)
    return category?.name || '–'
  }

  const getFullAddress = () => {
    const parts = [
      formData.head,
      formData.building,
      formData.street,
      formData.city,
      formData.state,
      formData.country,
      formData.zipCode
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : '–'
  }

  const getContactName = () => {
    const name = [formData.firstName, formData.lastName].filter(Boolean).join(' ')
    return name || '–'
  }

  const getAccountsDetails = () => {
    if (formData.accounts.length === 0) {
      return '–'
    }
    return `${formData.accounts.length} account(s) configured`
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
                <h1 className="text-xl font-semibold">Add New Vendor</h1>
                <p className="text-sm text-muted-foreground">
                  Create a new vendor/supplier
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
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
                {isSubmitting ? 'Creating...' : 'Create Vendor'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="max-w-6xl mx-auto">
            {/* Success Alert */}
            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50 dark:bg-green-900/30">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-200">
                  Vendor created successfully! Redirecting...
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Form Section */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Store className="w-5 h-5 mr-2" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Vendor Name *
                        </Label>
                        <Input
                          id="name"
                          placeholder="e.g., Fresh Farms Pvt Ltd"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={errors.name ? 'border-destructive' : ''}
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className={errors.category ? 'border-destructive rounded-md' : ''}>
                          <SelectWithSearch
                            label="Category *"
                            options={categories?.map(category => ({
                              value: category.id,
                              label: `${category.name}${category.description ? ` - ${category.description}` : ''}`
                            })) || []}
                            value={formData.category}
                            onValueChange={(value) => handleInputChange('category', value)}
                            placeholder="Select category..."
                            searchPlaceholder="Search categories..."
                            emptyMessage="No categories found."
                          />
                        </div>
                        {errors.category && (
                          <p className="text-sm text-destructive flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.category}
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
                        placeholder="What does this vendor supply? (e.g., Fresh vegetables, dairy products, cleaning supplies)"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className={errors.description ? 'border-destructive' : ''}
                        rows={3}
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
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">
                          First Name *
                        </Label>
                        <Input
                          id="firstName"
                          placeholder="Enter first name"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className={errors.firstName ? 'border-destructive' : ''}
                        />
                        {errors.firstName && (
                          <p className="text-sm text-destructive flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.firstName}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Enter last name (optional)"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email address (optional)"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="countryCode">Country Code</Label>
                        <Select 
                          value={formData.countryCode} 
                          onValueChange={(value) => handleInputChange('countryCode', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+91">+91 (India)</SelectItem>
                            <SelectItem value="+1">+1 (US)</SelectItem>
                            <SelectItem value="+44">+44 (UK)</SelectItem>
                            <SelectItem value="+86">+86 (China)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="Enter 10-digit phone number (optional)"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={errors.phone ? 'border-destructive' : ''}
                          maxLength={10}
                        />
                        {errors.phone && (
                          <p className="text-sm text-destructive flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Address Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Address Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="head">Address Head</Label>
                      <Input
                        id="head"
                        placeholder="e.g., Head Office, Regional Office, Branch Office"
                        value={formData.head}
                        onChange={(e) => handleInputChange('head', e.target.value)}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="building">Building/House</Label>
                        <Input
                          id="building"
                          placeholder="Building name or number"
                          value={formData.building}
                          onChange={(e) => handleInputChange('building', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="street">Street</Label>
                        <Input
                          id="street"
                          placeholder="Street name"
                          value={formData.street}
                          onChange={(e) => handleInputChange('street', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          placeholder="City"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className={errors.city ? 'border-destructive' : ''}
                        />
                        {errors.city && (
                          <p className="text-sm text-destructive flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.city}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          placeholder="State"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          className={errors.state ? 'border-destructive' : ''}
                        />
                        {errors.state && (
                          <p className="text-sm text-destructive flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.state}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select 
                          value={formData.country} 
                          onValueChange={(value) => handleInputChange('country', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IN">India</SelectItem>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="UK">United Kingdom</SelectItem>
                            <SelectItem value="CN">China</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zipCode">Zip Code</Label>
                        <Input
                          id="zipCode"
                          placeholder="Postal code"
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange('zipCode', e.target.value)}
                          className={errors.zipCode ? 'border-destructive' : ''}
                        />
                        {errors.zipCode && (
                          <p className="text-sm text-destructive flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.zipCode}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bank/Account Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 mr-2" />
                        Bank/Account Information
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addAccount}
                        className="flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Account
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {formData.accounts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No accounts added yet</p>
                        <p className="text-sm">Click "Add Account" to add bank account details</p>
                      </div>
                    ) : (
                      formData.accounts.map((account, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Account {index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAccount(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Account Number</Label>
                              <Input
                                placeholder="Enter account number"
                                value={account.accountNo}
                                onChange={(e) => updateAccount(index, 'accountNo', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>IFSC Code</Label>
                              <Input
                                placeholder="e.g., SBIN0001234"
                                value={account.ifsc}
                                onChange={(e) => updateAccount(index, 'ifsc', e.target.value.toUpperCase())}
                              />
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Bank Name</Label>
                              <Input
                                placeholder="Enter bank name"
                                value={account.bankName}
                                onChange={(e) => updateAccount(index, 'bankName', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Account Type</Label>
                              <Select 
                                value={account.accountType} 
                                onValueChange={(value) => updateAccount(index, 'accountType', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="savings">Savings</SelectItem>
                                  <SelectItem value="current">Current</SelectItem>
                                  <SelectItem value="checking">Checking</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Transaction Match Rule</Label>
                            <Input
                              placeholder="e.g., keywords to match in bank transactions"
                              value={account.txnMatchRule}
                              onChange={(e) => updateAccount(index, 'txnMatchRule', e.target.value)}
                            />
                            <p className="text-sm text-muted-foreground">
                              Used for matching bank transactions during reconciliation
                            </p>
                          </div>

                          {/* Bank Address Section */}
                          <div className="border-t pt-4">
                            <h5 className="font-medium mb-3">Bank Address (Optional)</h5>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Bank Head</Label>
                                <Input
                                  placeholder="e.g., Main Branch, Regional Office"
                                  value={account.bankHead}
                                  onChange={(e) => updateAccount(index, 'bankHead', e.target.value)}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Building/House</Label>
                                <Input
                                  placeholder="Building name or number"
                                  value={account.bankBuilding}
                                  onChange={(e) => updateAccount(index, 'bankBuilding', e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 mt-4">
                              <div className="space-y-2">
                                <Label>Street</Label>
                                <Input
                                  placeholder="Street name"
                                  value={account.bankStreet}
                                  onChange={(e) => updateAccount(index, 'bankStreet', e.target.value)}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>City</Label>
                                <Input
                                  placeholder="City"
                                  value={account.bankCity}
                                  onChange={(e) => updateAccount(index, 'bankCity', e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3 mt-4">
                              <div className="space-y-2">
                                <Label>State</Label>
                                <Input
                                  placeholder="State"
                                  value={account.bankState}
                                  onChange={(e) => updateAccount(index, 'bankState', e.target.value)}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Country</Label>
                                <Select 
                                  value={account.bankCountry} 
                                  onValueChange={(value) => updateAccount(index, 'bankCountry', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="IN">India</SelectItem>
                                    <SelectItem value="US">United States</SelectItem>
                                    <SelectItem value="UK">United Kingdom</SelectItem>
                                    <SelectItem value="CN">China</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Zip Code</Label>
                                <Input
                                  placeholder="Postal code"
                                  value={account.bankZipCode}
                                  onChange={(e) => updateAccount(index, 'bankZipCode', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Status Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Status Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="isActive">Active Status</Label>
                        <p className="text-sm text-muted-foreground">
                          Toggle to activate or deactivate this vendor
                        </p>
                      </div>
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview Section */}
              {showPreview && (
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Info className="w-5 h-5 mr-2" />
                      Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-sm">Name</Label>
                      <p className="text-base font-medium">{formData.name || '–'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Category</Label>
                      <p className="text-base font-medium">{getCategoryName()}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Description</Label>
                      <p className="text-base font-normal whitespace-pre-wrap">
                        {formData.description || '–'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Contact Person</Label>
                      <p className="text-base font-medium">{getContactName()}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Email</Label>
                      <p className="text-base font-medium">{formData.email || '–'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Phone</Label>
                      <p className="text-base font-medium">
                        {formData.phone ? `${formData.countryCode} ${formData.phone}` : '–'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Address</Label>
                      <p className="text-base font-normal">{getFullAddress()}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Accounts</Label>
                      <p className="text-base font-normal">{getAccountsDetails()}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Status</Label>
                      <Badge variant={formData.isActive ? 'default' : 'secondary'}>
                        {formData.isActive ? 'Active' : 'Inactive'}
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