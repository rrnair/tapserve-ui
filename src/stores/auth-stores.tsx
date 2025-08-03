import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
  role: 'cashier' | 'manager' | 'owner' | 'admin'
  outlets: string[]
  tenantId: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string, rememberMe: boolean) => {
    set({ isLoading: true, error: null })
    
    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock successful login
      const mockUser: User = {
        id: '1',
        email,
        name: 'John Doe',
        role: email.includes('admin') ? 'admin' : 'cashier',
        outlets: ['outlet-1', 'outlet-2'],
        tenantId: 'tenant-1'
      }
      
      set({ user: mockUser, isLoading: false })
      
      // Store in localStorage if remember me is checked
      if (rememberMe) {
        localStorage.setItem('auth-token', 'mock-token')
      }
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Login failed', 
        isLoading: false 
      })
    }
  },

  logout: () => {
    set({ user: null })
    localStorage.removeItem('auth-token')
  },

  clearError: () => set({ error: null })
}))