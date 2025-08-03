'use client'

import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Cloud, CloudOff, RefreshCw, WifiOff, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NetworkStatusProps {
  className?: string
  showDetails?: boolean
}

export function NetworkStatus({ className, showDetails = false }: NetworkStatusProps) {
  const { isOnline, isSyncing, lastSync, pendingCount, hasErrors, syncNow, clearErrors } = useNetworkStatus()

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />
    if (isSyncing) return <RefreshCw className="h-4 w-4 animate-spin" />
    if (hasErrors) return <AlertTriangle className="h-4 w-4" />
    if (pendingCount > 0) return <CloudOff className="h-4 w-4" />
    return <Cloud className="h-4 w-4" />
  }

  const getStatusText = () => {
    if (!isOnline) return 'Offline'
    if (isSyncing) return 'Syncing...'
    if (hasErrors) return 'Sync Error'
    if (pendingCount > 0) return `${pendingCount} pending`
    return 'Synced'
  }

  const getStatusColor = () => {
    if (!isOnline) return 'destructive'
    if (isSyncing) return 'default'
    if (hasErrors) return 'destructive'
    if (pendingCount > 0) return 'secondary'
    return 'default'
  }

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never'
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-2", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={getStatusColor()}
              className="flex items-center gap-1 cursor-pointer"
            >
              {getStatusIcon()}
              <span className="text-xs">{getStatusText()}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </p>
              <p className="text-sm text-muted-foreground">
                Last sync: {formatLastSync(lastSync)}
              </p>
              {pendingCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {pendingCount} items pending sync
                </p>
              )}
              {hasErrors && (
                <p className="text-sm text-destructive">
                  Sync errors detected
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        {showDetails && (
          <>
            {isOnline && !isSyncing && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={syncNow}
                className="h-6 px-2"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
            
            {hasErrors && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={clearErrors}
                className="h-6 px-2 text-destructive hover:text-destructive"
              >
                Clear Errors
              </Button>
            )}
          </>
        )}
      </div>
    </TooltipProvider>
  )
}