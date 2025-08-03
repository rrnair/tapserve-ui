"use client"

import React from 'react'
import { Store, Users, Crown, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AuthBrandHeader } from '@/components/layout/auth-layout'

interface RoleFeature {
  icon: React.ComponentType<any>
  title: string
  features: string[]
  color: string
}

const roleFeatures: RoleFeature[] = [
  {
    icon: Store,
    title: "Cashier",
    features: ["Quick expense entry", "Bill scanning", "Offline mode", "Daily reports"],
    color: "bg-blue-500"
  },
  {
    icon: Users,
    title: "Manager", 
    features: ["Approve expenses", "Outlet analytics", "Team oversight", "Export reports"],
    color: "bg-green-500"
  },
  {
    icon: Crown,
    title: "Owner/Admin",
    features: ["Multi-outlet view", "User management", "Advanced analytics", "System settings"],
    color: "bg-purple-500"
  }
]

// Mobile feature highlights
export function MobileFeatureHighlights() {
  return (
    <div className="lg:hidden mt-8 pt-6 border-t">
      <h3 className="text-sm font-medium mb-4">Platform Features</h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3">
          <Store className="w-6 h-6 text-primary mx-auto mb-2" />
          <span className="text-xs text-muted-foreground">Multi-Outlet</span>
        </div>
        <div className="p-3">
          <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <span className="text-xs text-muted-foreground">OCR Scanning</span>
        </div>
        <div className="p-3">
          <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <span className="text-xs text-muted-foreground">Team Management</span>
        </div>
      </div>
    </div>
  )
}