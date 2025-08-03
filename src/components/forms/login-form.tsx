"use client"

import React, { useState } from 'react'
import { Eye, EyeOff, User, Lock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>
  isLoading?: boolean
  error?: string
}

export interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

export function LoginForm({ onSubmit, isLoading = false, error }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<LoginFormData>>({})

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Partial<LoginFormData> = {}
    
    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email'
    }
    
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    await onSubmit(formData)
  }

  return (
    <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-background/80 border-border">
      <CardHeader className="text-center space-y-compact-sm pb-compact-lg">
        <CardTitle className="text-xl font-bold">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to manage your restaurant expenses
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-compact-xl pt-0">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-compact-lg">
          <div className="space-y-compact-sm">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`pl-10 h-9 ${fieldErrors.email ? 'border-destructive' : ''}`}
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-sm text-destructive">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-compact-sm">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`pl-10 pr-10 h-9 ${fieldErrors.password ? 'border-destructive' : ''}`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {fieldErrors.password && (
              <p className="text-sm text-destructive">{fieldErrors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-compact-sm">
              <Checkbox
                id="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => handleInputChange('rememberMe', checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="rememberMe" className="text-sm">
                Remember me
              </Label>
            </div>
            <Button variant="link" className="px-0 text-sm" disabled={isLoading}>
              Forgot password?
            </Button>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full h-9"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Button variant="link" className="px-0 text-sm">
            Contact your administrator
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
