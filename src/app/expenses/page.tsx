'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
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
import { Separator } from '@/components/ui/separator'
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
  Calendar,
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  AlertCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Expense } from '@/types/expense'
import { Category } from '@/types/category'
import { Vendor } from '@/types/vendor'
import { getCategories } from '@/services/categoryService'
import { getVendors } from '@/services/vendorService'
import { getExpenses } from '@/services/expensesService'
import AnimatedNumberSimple from '@/components/ui/animated-number-simple'



const getStatusVariant = (status: string) => {
  switch (status) {
    case 'approved':
      return 'default'
    case 'pending':
      return 'secondary'
    case 'rejected':
      return 'destructive'
    default:
      return 'outline'
  }
}

const statusIcons = {
  pending: <Clock className="w-3 h-3" />,
  approved: <CheckCircle className="w-3 h-3" />,
  rejected: <XCircle className="w-3 h-3" />
}

export default function ExpensesPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [vendorFilter, setVendorFilter] = useState('all')

  const fetchExpenses = async () => {
      setLoading(true)
      const response = await getExpenses({ page: 1, limit: 20 })
      console.log(`Pulled expenses ${JSON.stringify(response.data)}`)
      if (response.success && response.data) {
        setExpenses(response.data.items)
        setError(null)
      } else {
        setError(response.error || 'Failed to load categories')
      }
      setLoading(false)
  }

  useEffect(() => {
    fetchExpenses()
  }, [])
  

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
      setError(response.error || 'Failed to load Vendors')
    }
    setLoading(false)
  };

  useEffect(() => {
    fetchVendors()
  }, [])

  const handleAddExpense = () => {
    router.push('/expenses/add')
  }

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.status?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesVendors = vendorFilter === 'all' || expense.vendorName === vendorFilter
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || expense.categoryName === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory && matchesVendors
  })

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const pendingCount = filteredExpenses.filter(e => e.status === 'pending').length
  const approvedCount = filteredExpenses.filter(e => e.status === 'approved').length

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <div className="flex items-center space-x-4 flex-1">
              <div>
                <h1 className="text-xl font-semibold">Expense Management</h1>
                <p className="text-sm text-muted-foreground">
                  Track and manage all your restaurant expenses
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={handleAddExpense} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
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
                  Total Expenses
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <AnimatedNumberSimple 
                  value={totalAmount}
                  prefix="₹"
                  format="currency"
                />
                <p className="text-xs text-muted-foreground">
                  {filteredExpenses.length} entries
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Approval
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <AnimatedNumberSimple 
                  value={pendingCount}
                  className="text-2xl font-bold text-orange-600"
                />
                <p className="text-xs text-muted-foreground">
                  Awaiting review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Approved Today
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <AnimatedNumberSimple 
                  value={approvedCount}
                  className="text-2xl font-bold text-green-600"
                />
                <p className="text-xs text-muted-foreground">
                  Ready for processing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Vendors
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <AnimatedNumberSimple 
                  value={new Set(filteredExpenses.map(e => e.vendorId)).size}
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
                      placeholder="Search expenses..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
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

                <Select value={vendorFilter} onValueChange={setVendorFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="all" value="all">All Vendors</SelectItem>
                    {vendors.map((v) => (
                        <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>        
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

          {/* Expenses Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <Receipt className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              No expenses found
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {new Date(expense.createdAt).toLocaleDateString('en-IN')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{expense.description}</div>
                              <div className="text-sm text-muted-foreground">
                                Bill: {expense.billNumber}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{expense.categoryName}</div>
                              <div className="text-sm text-muted-foreground">
                                {expense.categoryName}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{expense.vendorName}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              ₹{expense.amount.toLocaleString('en-IN')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(expense.status)} className="gap-1">
                              {statusIcons[expense.status]}
                              {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{expense.createdBy}</div>
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
                                <DropdownMenuItem>
                                  <Receipt className="mr-2 h-4 w-4" />
                                  View Bill
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Edit Expense
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {expense.status === 'pending' && (
                                  <>
                                    <DropdownMenuItem className="text-green-600">
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
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
    </TooltipProvider>
  )
}