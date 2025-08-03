"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { AuthLayout } from '@/components/layout/auth-layout'
import { LoginForm, type LoginFormData } from '@/components/forms/login-form'
import { MobileFeatureHighlights } from '@/components/layout/feature-showcase'
import { useAuthStore } from '@/stores/auth-stores'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, user } = useAuthStore()

  const handleLogin = async (data: LoginFormData) => {
    await login(data.email, data.password, data.rememberMe)
  }

  // Redirect if logged in
  React.useEffect(() => {
    if (user) {
      // Simulate redirect delay for better UX
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    }
  }, [user, router])

  return (
    <AuthLayout>
      
      <div className="w-full max-w-md mx-auto">
        {user && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Login successful! Redirecting to dashboard...
            </AlertDescription>
          </Alert>
        )}
        
        <LoginForm 
          onSubmit={handleLogin}
          isLoading={isLoading}
          error={error || undefined}
        />
        
        <MobileFeatureHighlights />
      </div>
    </AuthLayout>
  )
}