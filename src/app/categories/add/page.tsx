// src/app/categories/add/page.tsx
'use client'

import { useState } from 'react'
import { createCategory } from '@/services/categoryService'
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
  Tag, 
  FolderOpen,
  AlertCircle,
} from 'lucide-react'



interface CategoryFormData {
  name: string
  description: string
  type: 'vendor' 
  parentId: string
  isActive: boolean
  sortOrder: number
}

export default function AddCategoryPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    type: 'vendor',
    parentId: '',
    isActive: true,
    sortOrder: 0
  })
  
  // Use SWR to fetch categories
  const { categories, isLoading, error } = useCategories({ page: 1, limit: 50 })
  
  const [errors, setErrors] = useState<Partial<CategoryFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleInputChange = (field: keyof CategoryFormData, value: string | boolean | number) => {
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
    const newErrors: Partial<CategoryFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Category name must be at least 2 characters'
    } else if (formData.name.length > 50) {
      newErrors.name = 'Category name must be less than 50 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    } else if (formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters'
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

    try {
      // Check if category with same name exists in the current categories
      const existingCategory = categories?.find(
        cat => cat.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
      )
      
      if (existingCategory) {
        setErrors(prev => ({ ...prev, name: 'Category with this name already exists' }))
        setIsSubmitting(false)
        return
      }

      const response = await createCategory(formData)

      if (response.success) {
        router.push('/categories?success=created')
      } else {
        alert(response.error || 'Failed to create category')
      }
    } catch (error) {
      console.error('Error creating category:', error)
      alert('Unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }   


  const handleCancel = () => {
    router.push('/categories')
  }

  const getParentCategoryName = () => {
    if (!formData.parentId) return 'Root Category'
    const parent = categories?.find(c => c.id === formData.parentId)
    return parent?.name || 'Unknown'
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
                <h1 className="text-xl font-semibold">Add New Category</h1>
                <p className="text-sm text-muted-foreground">
                  Create a new vendor or vendor category
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
                {isSubmitting ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Form Section */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Tag className="w-5 h-5 mr-2" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Category Name *
                        </Label>
                        <Input
                          id="name"
                          placeholder="e.g., Fresh Vegetables"
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
                        <Label htmlFor="type">
                          Category Type *
                        </Label>
                        <Select 
                          value={formData.type} 
                          onValueChange={(value) => handleInputChange('type', value)}
                        >
                          <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select category type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vendor">Vendor</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.type && (
                          <p className="text-sm text-destructive flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.type}
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
                        placeholder="Describe what this category includes..."
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
                            {formData.description.length}/200 characters
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Hierarchy Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FolderOpen className="w-5 h-5 mr-2" />
                      Hierarchy Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="parentId">
                        Parent Category
                      </Label>
                      <Select 
                        value={formData.parentId} 
                        onValueChange={(value) => handleInputChange('parentId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent category (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="No">No Parent (Root Category)</SelectItem>
                          {categories?.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Leave empty to create a root category
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sortOrder">
                        Sort Order
                      </Label>
                      <Input
                        id="sortOrder"
                        type="number"
                        placeholder="0"
                        value={formData.sortOrder}
                        onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                        min="0"
                        max="999"
                      />
                      <p className="text-sm text-muted-foreground">
                        Lower numbers appear first in lists
                      </p>
                    </div>
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
                          Toggle to activate or deactivate this category
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
                      <Label className="text-muted-foreground text-sm">Type</Label>
                      <p className="text-base font-medium capitalize">{formData.type || '–'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Description</Label>
                      <p className="text-base font-normal whitespace-pre-wrap">
                        {formData.description || '–'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Parent</Label>
                      <p className="text-base font-medium">{getParentCategoryName()}</p>
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
  );
}