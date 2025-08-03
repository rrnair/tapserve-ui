// src/app/suppliers/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { deleteVendor, getVendor, getVendors, updateVendor } from '@/services/vendorService'
import AnimatedNumberSimple from '@/components/ui/animated-number-simple'
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
import { Vendor } from '@/types/vendor'
import { Category } from '@/types/category'
import { getCategories } from '@/services/categoryService'



/**
 * Renders vendors landing page - Lists summary cards (no of suppliers, active suppliers),
 * lists all vendors, quick actions (delete, edit, view). Allows to add vendor.
 * 
 * A Vendor is an entity/person who supplies/provides a raw material or a service. Each supplier is tied to a 
 * cateogry "Poultry, Utlities, Bakery etc" which helps in trackign expenses.
 * 
 * @author Ratheesh Nair
 * @since 0.1.0
 * 
 */
export default function VendorsPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all')

  const fetchCategories = async () => {
      setLoading(true)
      const response = await getCategories({ page: 1, limit: 20 })
      if (response.success && response.data) {
        setCategories(response.data.items)
        setError(null)
      } else {
        setError(response.error || 'Failed to load categories')
      }
      setLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])
  

  const fetchVendors = async () => {
    setLoading(true)
    const response = await getVendors({ page: 1, limit: 20 })
    if (response.success && response.data) {
      setVendors(response.data.items)
      setError(null)
    } else {
      setError(response.error || 'Failed to load Suppliers')
    }
    setLoading(false)
  };

  useEffect(() => {
    fetchVendors()
  }, [])

  const handleAddVendor = () => {
    router.push('/vendors/add')
  }

  const handleEdit = (id: string) => {
    router.push(`/vendors/edit/${id}`)
  }

  const handleViewDetails = (id: string) => {
    router.push(`/vendors/view/${id}`)
  }

  const handleViewCategory = (id: string) => {
    router.push(`/vendors?vendorId=${id}`)
  }

  const handleDelete = async (id: string) => {
    const confirmed = confirm('Are you sure you want to delete this vendor?')
    if (!confirmed) return

    const response = await deleteVendor(id)
    if (response.success) {
      setVendors((prev) => prev.filter((vt) => vt.id !== id))
    } else {
      alert(response.error || 'Failed to delete')
    }
  }

  /**
   * Filter - keyword search operations on the Vendors table
   */
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.category.name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && vendor.isActive) ||
      (statusFilter === 'inactive' && !vendor.isActive)

    return matchesSearch && matchesStatus
  })

  const totalVendors = filteredVendors.length
  const activeVendors = filteredVendors.filter(c => c.isActive).length
  const totalAmount = filteredVendors.reduce((sum, vendor) => sum + vendor.totalAmount, 0)
  const totalExpenses = filteredVendors.reduce((sum, vendor) => sum + vendor.expenseCount, 0)

  const toggleVendorStatus = (vendorId: string) => {
    // This would be handled by your state management
    const vendor = vendors.find(v => v.id == vendorId)
    
    if (vendor) { 
      vendor.isActive = ! vendor?.isActive 
      updateVendor(vendorId, vendor)  
    }
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        {loading ? (
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
                    <h1 className="text-xl font-semibold">Vendor Management</h1>
                    <p className="text-sm text-muted-foreground">
                      Manage Vendors
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button onClick={handleAddVendor} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vendor
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
                      Active Vendors
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <AnimatedNumberSimple 
                      value={activeVendors}
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
                      Total #Expenses
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <AnimatedNumberSimple 
                      value={totalExpenses}
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
                      value={filteredVendors.reduce((sum, v) => sum + v.totalAmount, 0)}
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
                          placeholder="Search vendors..."
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

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem key="all" value="all">All Categories</SelectItem>
                        {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>        
                        ))}                    
                      </SelectContent>
                    </Select>

                    <Button variant="outline" size="default">
                      <Filter className="w-4 h-4 mr-2" />
                      More
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Vendors Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Vendors</span>
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
                          <TableHead>Vendor Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Expenses</TableHead>
                          <TableHead>Total Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created By</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredVendors.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="h-24 text-center">
                              <div className="flex flex-col items-center justify-center space-y-2">
                                <Tag className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  No vendors found
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredVendors.map((vendor) => (
                            <TableRow key={vendor.id}>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium flex items-center">
                                    {vendor.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {vendor.description}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground">
                                  {vendor.category.name}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{vendor.expenseCount}</div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">
                                  ₹{vendor.totalAmount.toLocaleString('en-IN')}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={vendor.isActive}
                                    onCheckedChange={() => toggleVendorStatus(vendor.id)}
                                  />
                                  <Badge variant={vendor.isActive ? "default" : "secondary"}>
                                    {vendor.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{vendor.createdBy}</div>
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
                                    <DropdownMenuItem onClick={() => handleViewDetails(vendor.id)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEdit(vendor.id)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Vendor
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Users className="mr-2 h-4 w-4" />
                                      View Category
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                      <Settings className="mr-2 h-4 w-4" />
                                      Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={() => handleDelete(vendor.id)}>
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