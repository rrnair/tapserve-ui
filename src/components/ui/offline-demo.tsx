'use client'

import { useState, useEffect } from 'react'
import { useExpensesStore } from '@/stores/expenses-store'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NetworkStatus } from '@/components/ui/network-status'
import { offlineStorageService } from '@/services/offlineStorageService'

export function OfflineDemo() {
  const { expenses, loadExpenses, addExpense, syncExpenses } = useExpensesStore()
  const { isOnline, pendingCount } = useNetworkStatus()
  const [stats, setStats] = useState({
    totalExpenses: 0,
    unsyncedExpenses: 0,
    queuedItems: 0,
    lastSync: null as string | null
  })

  useEffect(() => {
    loadExpenses()
    updateStats()
  }, [loadExpenses])

  const updateStats = async () => {
    const storageStats = await offlineStorageService.getStorageStats()
    setStats(storageStats)
  }

  const addSampleExpense = async () => {
    const sampleExpense = {
      tenantId: 'tenant_001',
      outletId: 'outlet_001',
      amount: Math.floor(Math.random() * 1000) + 50,
      description: `Sample expense - ${new Date().toLocaleTimeString()}`,
      vendorId: 'vendor_001',
      vendorName: 'Sample Vendor',
      categoryId: 'cat_001',
      categoryName: 'Office Supplies',
      expenseDate: new Date().toISOString().split('T')[0],
      status: 'pending' as const,
      createdBy: 'demo_user'
    }

    await addExpense(sampleExpense)
    await updateStats()
  }

  const handleSync = async () => {
    await syncExpenses()
    await updateStats()
  }

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Offline Expense Management Demo
            <NetworkStatus showDetails />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalExpenses}</div>
              <div className="text-sm text-muted-foreground">Total Expenses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.unsyncedExpenses}</div>
              <div className="text-sm text-muted-foreground">Unsynced</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.queuedItems}</div>
              <div className="text-sm text-muted-foreground">In Queue</div>
            </div>
            <div className="text-center">
              <Badge variant={isOnline ? 'default' : 'destructive'}>
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">Status</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={addSampleExpense} variant="outline">
              Add Sample Expense
            </Button>
            <Button 
              onClick={handleSync} 
              disabled={!isOnline || pendingCount === 0}
              variant="default"
            >
              Sync Now ({pendingCount})
            </Button>
            <Button onClick={updateStats} variant="ghost" size="sm">
              Refresh Stats
            </Button>
          </div>

          {stats.lastSync && (
            <div className="text-sm text-muted-foreground">
              Last sync: {new Date(stats.lastSync).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {expenses.slice(0, 5).map((expense) => (
              <div 
                key={expense.id} 
                className="flex items-center justify-between p-2 border rounded"
              >
                <div>
                  <div className="font-medium">{expense.description}</div>
                  <div className="text-sm text-muted-foreground">
                    ₹{expense.amount} • {expense.vendorName}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={expense._offline?.synced ? 'default' : 'secondary'}>
                    {expense._offline?.synced ? 'Synced' : 'Offline'}
                  </Badge>
                  {expense._offline?.createdOffline && (
                    <Badge variant="outline" className="text-xs">
                      Created Offline
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}