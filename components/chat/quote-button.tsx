'use client'

import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface QuoteButtonProps {
  projectId: string
  quoteId?: string
  className?: string
  variant?: 'default' | 'header'
  disabled?: boolean
}

export function QuoteButton({ 
  projectId, 
  quoteId, 
  className, 
  variant = 'default',
  disabled = false 
}: QuoteButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (disabled || !quoteId) return
    
    // Navigate to the quote page - we'll need to create this route
    router.push(`/quotes/${quoteId}`)
  }

  if (variant === 'header') {
    return (
      <Button
        onClick={handleClick}
        disabled={disabled || !quoteId}
        variant="ghost"
        size="sm"
        className={cn(
          "gap-2 text-foreground hover:text-foreground hover:bg-accent/50",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">Latest Quote</span>
      </Button>
    )
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || !quoteId}
      variant="outline"
      size="sm"
      className={cn(
        "gap-2",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <FileText className="h-4 w-4" />
      View Quote
    </Button>
  )
}
