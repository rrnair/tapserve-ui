"use client"

import React from 'react'
import { Store } from 'lucide-react'
import Image from 'next/image'

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background image */}
      <Image
       src="/globe.svg" width={1920} height={1080}
       alt='Background Image'
        className="absolute inset-0 w-full h-full object-cover object-center z-0 opacity-60 dark:opacity-40 pointer-events-none select-none"
      />
      {/* Overlay for darken effect */}
      <div className="absolute inset-0 bg-background/80 z-10" aria-hidden="true" />
      <div className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center z-20">
        {children}
      </div>
    </div>
  )
}

// Brand header component
export function AuthBrandHeader() {
  return (
    <div className="inline-flex items-center gap-3 mb-6">
      <div className="w-12 h-12 bg-gradient-to-r from-primary to-blue-600 rounded-xl flex items-center justify-center">
        <Store className="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">RestaurantOS</h1>
        <p className="text-sm text-muted-foreground">Expense Management</p>
      </div>
    </div>
  )
}