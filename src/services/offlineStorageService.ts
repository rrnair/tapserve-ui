import { Expense } from '@/types/expense'

export interface OfflineExpense extends Expense {
  _offline?: {
    localId: string
    synced: boolean
    syncError?: string
    lastSyncAttempt?: string
    createdOffline: boolean
    version: number
  }
}

export interface SyncQueueItem {
  id: string
  type: 'create' | 'update' | 'delete'
  data: OfflineExpense
  attempts: number
  lastAttempt?: string
  error?: string
}

class OfflineStorageService {
  private dbName = 'tapserve-offline'
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    if (typeof window === 'undefined') {
      // SSR environment - skip IndexedDB initialization
      return Promise.resolve()
    }
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Expenses store
        if (!db.objectStoreNames.contains('expenses')) {
          const expenseStore = db.createObjectStore('expenses', { keyPath: 'id' })
          expenseStore.createIndex('tenantId', 'tenantId', { unique: false })
          expenseStore.createIndex('outletId', 'outletId', { unique: false })
          expenseStore.createIndex('synced', '_offline.synced', { unique: false })
          expenseStore.createIndex('createdOffline', '_offline.createdOffline', { unique: false })
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' })
          syncStore.createIndex('type', 'type', { unique: false })
          syncStore.createIndex('attempts', 'attempts', { unique: false })
        }

        // Metadata store for last sync timestamps, etc.
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' })
        }
      }
    })
  }

  async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    if (typeof window === 'undefined') {
      throw new Error('IndexedDB not available in SSR environment')
    }
    
    if (!this.db) {
      await this.init()
    }
    const transaction = this.db!.transaction([storeName], mode)
    return transaction.objectStore(storeName)
  }

  // Expense operations
  async saveExpenseOffline(expense: Partial<Expense>): Promise<OfflineExpense> {
    const localId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
    const offlineExpense: OfflineExpense = {
      ...expense,
      id: expense.id || localId,
      createdAt: expense.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _offline: {
        localId,
        synced: false,
        createdOffline: !expense.id,
        version: 1
      }
    } as OfflineExpense

    const store = await this.getStore('expenses', 'readwrite')
    await new Promise((resolve, reject) => {
      const request = store.put(offlineExpense)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    // Add to sync queue
    await this.addToSyncQueue({
      id: offlineExpense.id,
      type: offlineExpense._offline!.createdOffline ? 'create' : 'update',
      data: offlineExpense,
      attempts: 0
    })

    return offlineExpense
  }

  async getOfflineExpense(id: string): Promise<OfflineExpense | null> {
    const store = await this.getStore('expenses')
    return new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllOfflineExpenses(tenantId?: string, outletId?: string): Promise<OfflineExpense[]> {
    const store = await this.getStore('expenses')
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => {
        let expenses = request.result || []
        
        if (tenantId) {
          expenses = expenses.filter(e => e.tenantId === tenantId)
        }
        
        if (outletId) {
          expenses = expenses.filter(e => e.outletId === outletId)
        }
        
        resolve(expenses)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async getUnsyncedExpenses(): Promise<OfflineExpense[]> {
    const store = await this.getStore('expenses')
    return new Promise((resolve, reject) => {
      const expenses: OfflineExpense[] = []
      const request = store.openCursor()
      
      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          const expense = cursor.value as OfflineExpense
          if (expense._offline && !expense._offline.synced) {
            expenses.push(expense)
          }
          cursor.continue()
        } else {
          resolve(expenses)
        }
      }
      
      request.onerror = () => reject(request.error)
    })
  }

  async markExpenseAsSynced(id: string, serverData?: Partial<Expense>): Promise<void> {
    const expense = await this.getOfflineExpense(id)
    if (!expense) return

    const updatedExpense: OfflineExpense = {
      ...expense,
      ...serverData,
      _offline: {
        ...expense._offline!,
        synced: true,
        syncError: undefined,
        lastSyncAttempt: new Date().toISOString()
      }
    }

    const store = await this.getStore('expenses', 'readwrite')
    await new Promise((resolve, reject) => {
      const request = store.put(updatedExpense)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    // Remove from sync queue
    await this.removeFromSyncQueue(id)
  }

  async markExpenseSyncError(id: string, error: string): Promise<void> {
    const expense = await this.getOfflineExpense(id)
    if (!expense) return

    const updatedExpense: OfflineExpense = {
      ...expense,
      _offline: {
        ...expense._offline!,
        syncError: error,
        lastSyncAttempt: new Date().toISOString()
      }
    }

    const store = await this.getStore('expenses', 'readwrite')
    await new Promise((resolve, reject) => {
      const request = store.put(updatedExpense)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteOfflineExpense(id: string): Promise<void> {
    const store = await this.getStore('expenses', 'readwrite')
    await new Promise((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve(undefined)
      request.onerror = () => reject(request.error)
    })

    await this.removeFromSyncQueue(id)
  }

  // Sync queue operations
  async addToSyncQueue(item: SyncQueueItem): Promise<void> {
    const store = await this.getStore('syncQueue', 'readwrite')
    await new Promise((resolve, reject) => {
      const request = store.put(item)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const store = await this.getStore('syncQueue')
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async updateSyncQueueItem(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
    const store = await this.getStore('syncQueue', 'readwrite')
    const item = await new Promise<SyncQueueItem>((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    if (item) {
      const updatedItem = { ...item, ...updates }
      await new Promise((resolve, reject) => {
        const request = store.put(updatedItem)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    }
  }

  async removeFromSyncQueue(id: string): Promise<void> {
    const store = await this.getStore('syncQueue', 'readwrite')
    await new Promise((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve(undefined)
      request.onerror = () => reject(request.error)
    })
  }

  // Metadata operations
  async setMetadata(key: string, value: unknown): Promise<void> {
    const store = await this.getStore('metadata', 'readwrite')
    await new Promise((resolve, reject) => {
      const request = store.put({ key, value, updatedAt: new Date().toISOString() })
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getMetadata(key: string): Promise<unknown> {
    const store = await this.getStore('metadata')
    return new Promise((resolve, reject) => {
      const request = store.get(key)
      request.onsuccess = () => resolve(request.result?.value || null)
      request.onerror = () => reject(request.error)
    })
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    const stores = ['expenses', 'syncQueue', 'metadata']
    for (const storeName of stores) {
      const store = await this.getStore(storeName, 'readwrite')
      await new Promise((resolve, reject) => {
        const request = store.clear()
        request.onsuccess = () => resolve(undefined)
        request.onerror = () => reject(request.error)
      })
    }
  }

  async getStorageStats(): Promise<{
    totalExpenses: number
    unsyncedExpenses: number
    queuedItems: number
    lastSync: string | null
  }> {
    const [totalExpenses, unsyncedExpenses, queuedItems, lastSync] = await Promise.all([
      this.getAllOfflineExpenses(),
      this.getUnsyncedExpenses(),
      this.getSyncQueue(),
      this.getMetadata('lastSyncTime')
    ])

    return {
      totalExpenses: totalExpenses.length,
      unsyncedExpenses: unsyncedExpenses.length,
      queuedItems: queuedItems.length,
      lastSync: typeof lastSync === 'string' ? lastSync : null
    }
  }
}

export const offlineStorageService = new OfflineStorageService()