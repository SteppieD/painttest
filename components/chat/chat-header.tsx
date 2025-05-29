'use client'

import { MoreVertical, MapPin, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuoteButton } from './quote-button'

interface ChatHeaderProps {
  clientName?: string
  propertyAddress?: string
  projectId: string
  latestQuoteId?: string
}

export function ChatHeader({ 
  clientName, 
  propertyAddress, 
  projectId, 
  latestQuoteId 
}: ChatHeaderProps) {
  return (
    <div className="sticky top-14 z-30 bg-background border-b px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        {clientName && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{clientName}</span>
          </div>
        )}
        
        {propertyAddress && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{propertyAddress}</span>
          </div>
        )}
        
        {!clientName && !propertyAddress && (
          <span className="text-sm text-muted-foreground">New Quote</span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {latestQuoteId && (
          <QuoteButton 
            projectId={projectId}
            quoteId={latestQuoteId}
            variant="header"
          />
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
