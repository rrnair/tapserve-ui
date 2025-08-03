import { offlineStorageService, OfflineExpense, SyncQueueItem } from './offlineStorageService'
import { createExpense, updateExpense, deleteVExpense, getExpenses } from './expensesService'
import { Expense } from '@/types/expense'

export interface SyncResult {
  success: boolean
  synced: number
  failed: number
  errors: Array<{ id: string; error: string }>
}

export interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  lastSync: Date | null
  pendingCount: number
  hasErrors: boolean
}

class SyncService {
  private isOnline = typeof window !== 'undefined' ? navigator.onLine : true
  private isSyncing = false
  private syncListeners: Array<(status: SyncStatus) => void> = []
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map()
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.setupNetworkListeners()
      this.init()
    }
  }

  private async init() {
    await offlineStorageService.init()
    
    // Auto-sync on network connection
    if (this.isOnline) {
      this.scheduleSync()
    }
  }

  private setupNetworkListeners() {
    if (typeof window === 'undefined') return
    
    window.addEventListener('online', () => {
      this.isOnline = true
      this.notifyStatusChange()
      this.scheduleSync()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.notifyStatusChange()
    })
  }

  // Status management
  addStatusListener(callback: (status: SyncStatus) => void) {
    this.syncListeners.push(callback)
    this.notifyStatusChange() // Immediately notify with current status
  }

  removeStatusListener(callback: (status: SyncStatus) => void) {
    this.syncListeners = this.syncListeners.filter(listener => listener !== callback)
  }

  private async notifyStatusChange() {
    const stats = await offlineStorageService.getStorageStats()
    const lastSync = await offlineStorageService.getMetadata('lastSyncTime')
    
    const status: SyncStatus = {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSync: lastSync && typeof lastSync === 'string' ? new Date(lastSync) : null,
      pendingCount: stats.unsyncedExpenses,
      hasErrors: stats.queuedItems > 0
    }

    this.syncListeners.forEach(listener => listener(status))
  }

  // Main sync operations
  async syncExpenses(): Promise<SyncResult> {
    if (this.isSyncing || !this.isOnline) {
      return { success: false, synced: 0, failed: 0, errors: [] }
    }

    this.isSyncing = true
    this.notifyStatusChange()

    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: []
    }

    try {
      // First, sync down any server changes
      await this.syncFromServer()

      // Then sync up local changes
      const syncQueue = await offlineStorageService.getSyncQueue()
      
      for (const item of syncQueue) {
        try {
          await this.syncQueueItem(item)
          result.synced++
        } catch (error) {
          result.failed++
          result.errors.push({
            id: item.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          
          // Update retry attempt
          await this.updateRetryAttempt(item, error instanceof Error ? error.message : 'Unknown error')
        }
      }

      // Update last sync time
      await offlineStorageService.setMetadata('lastSyncTime', new Date().toISOString())
      
    } catch (error) {
      result.success = false
      console.error('Sync failed:', error)
    } finally {
      this.isSyncing = false
      this.notifyStatusChange()
    }

    return result
  }

  private async syncFromServer() {
    try {
      // Get last sync time to only fetch new/updated records
      const lastSync = await offlineStorageService.getMetadata('lastSyncTime')
      const filters = lastSync && typeof lastSync === 'string' ? { startDate: lastSync } : undefined

      const response = await getExpenses(filters)
      
      if (response.success && response.data) {
        for (const serverExpense of response.data.items) {
          const localExpense = await offlineStorageService.getOfflineExpense(serverExpense.id)
          
          if (!localExpense) {
            // New expense from server - save locally
            const offlineExpense: OfflineExpense = {
              ...serverExpense,
              _offline: {
                localId: serverExpense.id,
                synced: true,
                createdOffline: false,
                version: 1
              }
            }
            
            const store = await offlineStorageService.getStore('expenses', 'readwrite')
            await new Promise((resolve, reject) => {
              const request = store.put(offlineExpense)
              request.onsuccess = () => resolve(request.result)
              request.onerror = () => reject(request.error)
            })
          } else if (localExpense._offline?.synced && serverExpense.updatedAt > localExpense.updatedAt) {
            // Server version is newer - update local
            const updatedExpense: OfflineExpense = {
              ...serverExpense,
              _offline: {
                ...localExpense._offline,
                synced: true
              }
            }
            
            const store = await offlineStorageService.getStore('expenses', 'readwrite')
            await new Promise((resolve, reject) => {
              const request = store.put(updatedExpense)
              request.onsuccess = () => resolve(request.result)
              request.onerror = () => reject(request.error)
            })
          }
        }
      }
    } catch (error) {
      console.error('Failed to sync from server:', error)
    }
  }

  private async syncQueueItem(item: SyncQueueItem): Promise<void> {
    const expense = item.data
    
    try {
      let response
      
      switch (item.type) {
        case 'create':
          // Remove offline metadata before sending to server
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _offline, ...expenseData } = expense
          response = await createExpense(expenseData)
          
          if (response.success && response.data) {
            await offlineStorageService.markExpenseAsSynced(item.id, response.data)
          }
          break
          
        case 'update':
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _offline: _, ...updateData } = expense
          response = await updateExpense(expense.id, updateData)
          
          if (response.success && response.data) {
            await offlineStorageService.markExpenseAsSynced(item.id, response.data)
          }
          break
          
        case 'delete':
          response = await deleteVExpense(expense.id)
          
          if (response.success) {
            await offlineStorageService.deleteOfflineExpense(item.id)
          }
          break
      }
      
      if (!response?.success) {
        throw new Error(response?.error || 'Server request failed')
      }
      
    } catch (error) {
      // Clear any existing retry timeout
      const timeoutId = this.retryTimeouts.get(item.id)
      if (timeoutId) {
        clearTimeout(timeoutId)
        this.retryTimeouts.delete(item.id)
      }
      
      throw error
    }
  }

  private async updateRetryAttempt(item: SyncQueueItem, error: string) {
    const maxAttempts = 5
    const newAttempts = item.attempts + 1
    
    if (newAttempts >= maxAttempts) {
      // Mark as permanently failed
      await offlineStorageService.markExpenseSyncError(item.id, `Max attempts reached: ${error}`)
      await offlineStorageService.removeFromSyncQueue(item.id)
    } else {
      // Schedule retry with exponential backoff
      const retryDelay = Math.min(1000 * Math.pow(2, newAttempts), 30000) // Max 30 seconds
      
      await offlineStorageService.updateSyncQueueItem(item.id, {
        attempts: newAttempts,
        lastAttempt: new Date().toISOString(),
        error
      })
      
      // Schedule retry
      const timeoutId = setTimeout(() => {
        this.retryTimeouts.delete(item.id)
        if (this.isOnline) {
          this.syncExpenses()
        }
      }, retryDelay)
      
      this.retryTimeouts.set(item.id, timeoutId)
    }
  }

  // Manual sync triggers
  async forceSyncExpense(expenseId: string): Promise<boolean> {
    if (!this.isOnline) return false
    
    const syncQueue = await offlineStorageService.getSyncQueue()
    const queueItem = syncQueue.find(item => item.id === expenseId)
    
    if (queueItem) {
      try {
        await this.syncQueueItem(queueItem)
        return true
      } catch (error) {
        await this.updateRetryAttempt(queueItem, error instanceof Error ? error.message : 'Unknown error')
        return false
      }
    }
    
    return false
  }

  async scheduleSync(delay: number = 5000) {
    if (!this.isOnline || this.isSyncing) return
    
    setTimeout(() => {
      if (this.isOnline && !this.isSyncing) {
        this.syncExpenses()
      }
    }, delay)
  }

  // Conflict resolution
  async resolveConflict(localExpense: OfflineExpense, serverExpense: Expense, resolution: 'local' | 'server' | 'merge'): Promise<void> {
    switch (resolution) {
      case 'local':
        // Keep local version, mark for sync
        await offlineStorageService.addToSyncQueue({
          id: localExpense.id,
          type: 'update',
          data: localExpense,
          attempts: 0
        })
        break
        
      case 'server':
        // Accept server version
        await offlineStorageService.markExpenseAsSynced(localExpense.id, serverExpense)
        break
        
      case 'merge':
        // Create merged version (this would need custom logic based on business rules)
        const mergedExpense: OfflineExpense = {
          ...serverExpense,
          ...localExpense,
          // Keep more recent values for specific fields
          updatedAt: new Date().toISOString(),
          _offline: {
            ...localExpense._offline!,
            synced: false,
            version: (localExpense._offline?.version || 0) + 1
          }
        }
        
        const store = await offlineStorageService.getStore('expenses', 'readwrite')
        await new Promise((resolve, reject) => {
          const request = store.put(mergedExpense)
          request.onsuccess = () => resolve(request.result)
          request.onerror = () => reject(request.error)
        })
        
        await offlineStorageService.addToSyncQueue({
          id: mergedExpense.id,
          type: 'update',
          data: mergedExpense,
          attempts: 0
        })
        break
    }
  }

  // Utility methods
  getNetworkStatus(): boolean {
    return this.isOnline
  }

  async getPendingSyncCount(): Promise<number> {
    const stats = await offlineStorageService.getStorageStats()
    return stats.unsyncedExpenses
  }

  async clearSyncErrors(): Promise<void> {
    const syncQueue = await offlineStorageService.getSyncQueue()
    for (const item of syncQueue) {
      if (item.error) {
        await offlineStorageService.updateSyncQueueItem(item.id, {
          attempts: 0,
          error: undefined,
          lastAttempt: undefined
        })
      }
    }
  }

  destroy() {
    // Clear all timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout))
    this.retryTimeouts.clear()
    
    // Remove listeners
    this.syncListeners = []
  }
}

export const syncService = new SyncService()