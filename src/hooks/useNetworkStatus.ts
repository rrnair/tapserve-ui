import { useState, useEffect } from 'react'
import { syncService, SyncStatus } from '@/services/syncService'

export interface NetworkStatus {
  isOnline: boolean
  isSyncing: boolean
  lastSync: Date | null
  pendingCount: number
  hasErrors: boolean
  syncNow: () => Promise<void>
  clearErrors: () => Promise<void>
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    lastSync: null,
    pendingCount: 0,
    hasErrors: false
  })

  useEffect(() => {
    const handleStatusChange = (newStatus: SyncStatus) => {
      setStatus(newStatus)
    }

    syncService.addStatusListener(handleStatusChange)

    return () => {
      syncService.removeStatusListener(handleStatusChange)
    }
  }, [])

  const syncNow = async () => {
    await syncService.syncExpenses()
  }

  const clearErrors = async () => {
    await syncService.clearSyncErrors()
  }

  return {
    ...status,
    syncNow,
    clearErrors
  }
}