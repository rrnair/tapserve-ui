// src/app/categories/page.tsx
'use client'

import { deleteCategory, updateCategory } from '@/services/categoryService'
import AnimatedNumberSimple from '@/components/ui/animated-number-simple'
import { useCategories } from '@/hooks/useCategories'
import { useCategoriesStore, useFilteredCategories } from '@/stores/categories-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Tag,
  Users,
  TrendingUp,
  Settings,
  Edit,
  Trash2,
  Eye,
  FolderOpen,
  ArrowUpDown,
  Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Category } from '@/types/category'



/**
 * Renders categories landing page - Lists summary cards (no of vendors, active vendors),
 * lists all categories, quick actions on Category (delete, edit, view). Allows to add category.
 * 
 * A category helps in grouping expenses - for instance "An Expense of x amount on Vegetables for vendor Y". 
 * A category can have optional sub category called child and each categpry can have one or more vendor associated
 * to it.
 * 
 * @author Ratheesh Nair
 * @since 0.1.0
 * 
 */

export default function CategoriesPage() {
  const router = useRouter()
  
  // Use SWR for data fetching
  const { categories, isLoading, error, mutate } = useCategories({ page: 1, limit: 50 })
  
  // Use Zustand for state management
  const {
    searchTerm,
    statusFilter,
    typeFilter,
    setSearchTerm,
    setStatusFilter,
    setTypeFilter
  } = useCategoriesStore()
  
  // Get filtered categories
  const filteredCategories = useFilteredCategories(categories? categories : [])

  const handleAddCategory = () => {
    router.push('/categories/add')
  }

  const handleEdit = (id: string) => {
    router.push(`/categories/edit/${id}`)
  }

  const handleViewDetails = (id: string) => {
    router.push(`/categories/view/${id}`)
  }

  const handleViewVendorss = (id: string) => {
    router.push(`/vendors?categoryId=${id}`)
  }

  const handleDelete = async (id: string) => {
    const confirmed = confirm('Are you sure you want to delete this category?')
    if (!confirmed) return

    const response = await deleteCategory(id)
    if (response.success) {
      // Refresh the data after deletion
      mutate()
    } else {
      alert(response.error || 'Failed to delete')
    }
  }

  // Calculate summary metrics
  const totalCategories = filteredCategories.length
  const activeCategories = filteredCategories.filter(c => c.isActive).length
  const totalVendors = filteredCategories.reduce((sum, cat) => sum + cat.vendorCount, 0)
  const parentCategories = filteredCategories.filter(c => !c.parentId).length

  const getParentCategoryName = (parentId: string | null) => {
    if (!parentId) return null
    const parent = categories?.find(c => c.id === parentId)
    return parent?.name || 'Unknown'
  }

  const toggleCategoryStatus = async (categoryId: string) => {
    const category = categories?.find(c => c.id === categoryId)
    
    if (category) { 
      const updatedCategory = { ...category, isActive: !category.isActive }
      const response = await updateCategory(categoryId, updatedCategory)
      
      if (response.success) {
        // Refresh the data after update
        mutate()
      } else {
        alert(response.error || 'Failed to update category')
      }
    }
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="p-4 text-red-500 text-center">{error}</div>
        ) : (


          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="border-b">
              <div className="flex h-16 items-center px-4">
                <div className="flex items-center space-x-4 flex-1">
                  <div>
                    <h1 className="text-xl font-semibold">Category Management</h1>
                    <p className="text-sm text-muted-foreground">
                      Manage vendor and vendor categories
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button onClick={handleAddCategory} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-4 p-4">
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Categories
                    </CardTitle>
                    <Tag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <AnimatedNumberSimple 
                      value={totalCategories}
                    />
                    <p className="text-xs text-muted-foreground">
                      {parentCategories} parent categories
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Categories
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <AnimatedNumberSimple 
                      value={activeCategories}
                      className="text-2xl font-bold text-green-600"
                    />
                    <p className="text-xs text-muted-foreground">
                      Currently in use
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Vendors
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <AnimatedNumberSimple 
                      value={totalVendors}
                    />
                    <p className="text-xs text-muted-foreground">
                      Across all categories
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Expenses
                    </CardTitle>
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <AnimatedNumberSimple 
                      value={filteredCategories.reduce((sum, cat) => sum + cat.totalAmount, 0)}
                      prefix="₹"
                      format="currency"
                    />
                    <p className="text-xs text-muted-foreground">
                      This month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Search & Filter</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search categories..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="outline" size="default">
                      <Filter className="w-4 h-4 mr-2" />
                      More
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Categories Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Categories</span>
                    <Button variant="ghost" size="sm">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      Sort
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Parent Category</TableHead>
                          <TableHead>Vendors</TableHead>
                          <TableHead>Expenses</TableHead>
                          <TableHead>Total Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created By</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCategories.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="h-24 text-center">
                              <div className="flex flex-col items-center justify-center space-y-2">
                                <Tag className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  No categories found
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredCategories.map((category) => (
                            <TableRow key={category.id}>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium flex items-center">
                                    {category.parentId && (
                                      <span className="mr-2 text-muted-foreground">└</span>
                                    )}
                                    {category.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {category.description}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {category.type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {category.parentId ? (
                                  <span className="text-sm">
                                    {getParentCategoryName(category.parentId)}
                                  </span>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    Root category
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{category.vendorCount}</div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{category.expenseCount}</div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">
                                  ₹{category.totalAmount.toLocaleString('en-IN')}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={category.isActive}
                                    onCheckedChange={() => toggleCategoryStatus(category.id)}
                                  />
                                  <Badge variant={category.isActive ? "default" : "secondary"}>
                                    {category.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{category.createdBy}</div>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">Open menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleViewDetails(category.id)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEdit(category.id)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Category
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Users className="mr-2 h-4 w-4" />
                                      View Vendors
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                      <Settings className="mr-2 h-4 w-4" />
                                      Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={() => handleDelete(category.id)}>
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}