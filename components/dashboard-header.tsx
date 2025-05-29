'use client'

import { User } from '@supabase/supabase-js'
import { Paintbrush } from 'lucide-react'

interface DashboardHeaderProps {
  user: User
  profile: any
}

export function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 h-14 bg-background border-b flex items-center px-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
          <svg className="h-5 w-5 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
            <path d="M12 13a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1z"/>
          </svg>
        </div>
        <h1 className="text-lg font-semibold">ShipMoto Quote Pro</h1>
      </div>
    </header>
  )
}
