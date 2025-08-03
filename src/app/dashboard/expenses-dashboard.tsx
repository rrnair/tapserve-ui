'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { 
  Search, 
  Filter, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Receipt,
  Calendar,
  SearchIcon
} from 'lucide-react'
import { useDashboardStore } from '@/stores/dashboard-store'
import { Category } from '@/types/category'
import { Vendor } from '@/types/vendor'
import { getCategories } from '@/services/categoryService'
import { getVendors } from '@/services/vendorService'
import CalendarWithDateRange from '@/components/calendar-date-range'
import AnimatedNumberSimple from '@/components/ui/animated-number-simple'
import SelectWithMultiSearch from '@/components/select-with-multi-search'
import { Option } from '@/components/ui/multiselect'

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
  rejected: <AlertCircle className="w-3 h-3" />
}

// Use CSS custom properties for theme-aware colors
const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
]

export default function ExpensesDashboard() {
  const {
    summary,
    expensesByCategory,
    expensesByVendor,
    recentExpenses,
    setFilters,
    fetchDashboardData
  } = useDashboardStore()

  const [categories, setCategories] = useState<Category[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCategories, setSelectedCategories] = useState<Option[]>([])
  const [selectedVendors, setSelectedVendors] = useState<Option[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [timePeriod, setTimePeriod] = useState('last-30-days')

  useEffect(() => {
    fetchDashboardData()
    loadCategories()
    loadVendors()
  }, [fetchDashboardData])

  const loadCategories = async () => {
    const response = await getCategories({ page: 1, limit: 100 })
    if (response.success && response.data) {
      setCategories(response.data.items)
    }
  }

  const loadVendors = async () => {
    const response = await getVendors({ page: 1, limit: 100 })
    if (response.success && response.data) {
      setVendors(response.data.items)
    }
  }

  const handleFilterChange = () => {
    const newFilters = {
      ...(dateRange?.from && { startDate: format(dateRange.from, 'yyyy-MM-dd') }),
      ...(dateRange?.to && { endDate: format(dateRange.to, 'yyyy-MM-dd') }),
      ...(selectedCategories.length > 0 && { categoryIds: selectedCategories.map(c => c.value) }),
      ...(selectedVendors.length > 0 && { vendorIds: selectedVendors.map(v => v.value) }),
      ...(statusFilter !== 'all' && { status: statusFilter })
    }
    setFilters(newFilters)
  }

  const filteredExpenses = recentExpenses.filter(expense => {
    const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Simple bar chart data for category expenses
  const categoryBarData = expensesByCategory.map((item, index) => ({
    name: item.categoryName.length > 12 ? item.categoryName.substring(0, 12) + '...' : item.categoryName,
    fullName: item.categoryName,
    amount: item.totalAmount,
    count: item.count,
    fill: CHART_COLORS[index % CHART_COLORS.length]
  }))

  // Time-series data (mock data based on selected period)
  const generateTimeSeriesData = (period: string) => {
    const days = period === 'last-10-days' ? 10 : period === 'last-week' ? 7 : 30
    const data = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      // Generate realistic daily expense patterns
      const baseAmount = summary?.totalAmount || 100000
      const dailyBase = baseAmount / 30 // Average daily
      const randomFactor = 0.6 + (Math.random() * 0.8) // 60% to 140% of base
      const weekendFactor = date.getDay() === 0 || date.getDay() === 6 ? 1.3 : 1 // Higher on weekends
      
      data.push({
        date: date.toISOString().split('T')[0],
        displayDate: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        amount: Math.floor(dailyBase * randomFactor * weekendFactor),
        expenses: Math.floor(Math.random() * 8) + 3 // 3-10 expenses per day
      })
    }
    
    return data
  }

  const timeSeriesData = generateTimeSeriesData(timePeriod)

  const categoryChartConfig = expensesByCategory.reduce((config, item, index) => {
    config[item.categoryName] = {
      label: item.categoryName,
      color: CHART_COLORS[index % CHART_COLORS.length]
    }
    return config
  }, {} as Record<string, { label: string; color: string }>)

  const vendorChartData = expensesByVendor.slice(0, 6).map((item, index) => ({
    ...item,
    fill: CHART_COLORS[index % CHART_COLORS.length]
  }))

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-4 flex-1">
            <div>
              <h1 className="text-xl font-semibold">Expenses Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Comprehensive overview of restaurant expenses
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4 p-4">
        {/* Filters */}
        <Card>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 ">
              <div>
                <label className="text-sm font-medium">Date Range</label>
                <CalendarWithDateRange
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder="Select date range"
                />
              </div>

              <div>
                <SelectWithMultiSearch
                  label="Categories"
                  options={categories.map(c => ({ value: c.id, label: c.name }))}
                  value={selectedCategories}
                  onChange={setSelectedCategories}
                  placeholder="Select categories..."
                />
              </div>

              <div>
                <SelectWithMultiSearch
                  label="Vendors"
                  options={vendors.map(v => ({ value: v.id, label: v.name }))}
                  value={selectedVendors}
                  onChange={setSelectedVendors}
                  placeholder="Select vendors..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={handleFilterChange} className="w-full">
                  <Filter className="w-4 h-4 mr-2" />
                  Apply
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <AnimatedNumberSimple 
                value={summary?.totalAmount || 0} 
                prefix="₹"
                format="currency"
              />
              <p className="text-xs text-muted-foreground">
                {summary?.totalExpenses || 0} entries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Expenses</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <AnimatedNumberSimple 
                value={summary?.activeExpenses || 0} 
                className="text-2xl font-bold text-green-600"
              />
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <AnimatedNumberSimple 
                value={summary?.pendingExpenses || 0} 
                className="text-2xl font-bold text-orange-600"
              />
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <AnimatedNumberSimple 
                value={summary?.activeVendorsCount || 0} 
              />
              <p className="text-xs text-muted-foreground">
                This period
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Category Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
              <p className="text-sm text-muted-foreground">
                Total spending across different expense categories
              </p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={categoryChartConfig} className="h-[300px]">
                <BarChart data={categoryBarData}>
                  <XAxis 
                    dataKey="name" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                  />
                  <Bar 
                    dataKey="amount" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Vendor Donut Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Vendor</CardTitle>
              <p className="text-sm text-muted-foreground">
                Distribution of expenses across vendors
              </p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px]">
                <PieChart>
                  <Pie
                    data={vendorChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="totalAmount"
                    startAngle={90}
                    endAngle={450}
                    label={({vendorName, totalAmount, percent}) => {
                      // Only show label if the slice is large enough (> 5%)
                      if (percent < 0.05) return '';
                      
                      const shortName = vendorName?.length > 10 
                        ? vendorName.substring(0, 10) + '...' 
                        : vendorName;
                      
                      return `${shortName}\n₹${(totalAmount/1000).toFixed(0)}k`;
                    }}
                    labelLine={false}
                  >
                    {vendorChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                  />
                  {/* Center Text */}
                  <text 
                    x="50%" 
                    y="47%" 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    className="fill-foreground text-3xl font-bold"
                  >
                    {summary?.totalAmount ? Math.floor(summary.totalAmount / 1000) : '0'}
                  </text>
                  <text 
                    x="50%" 
                    y="55%" 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    className="fill-muted-foreground text-sm"
                  >
                    Total (K ₹)
                  </text>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Time Series Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Daily Expenses Trend</span>
              <div className="flex gap-2">
                <Button
                  variant={timePeriod === 'last-week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimePeriod('last-week')}
                >
                  Last Week
                </Button>
                <Button
                  variant={timePeriod === 'last-10-days' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimePeriod('last-10-days')}
                >
                  Last 10 Days
                </Button>
                <Button
                  variant={timePeriod === 'last-30-days' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimePeriod('last-30-days')}
                >
                  Last 30 Days
                </Button>
              </div>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Daily expense patterns and trends over selected period
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="displayDate" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.date || label}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Daily Total']}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="var(--chart-2)" 
                  strokeWidth={3}
                  dot={{ fill: 'var(--chart-2)', r: 4 }}
                  activeDot={{ r: 6, fill: 'var(--chart-2)' }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Expenses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
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
                          <div className="font-medium">{expense.categoryName}</div>
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
  )
}