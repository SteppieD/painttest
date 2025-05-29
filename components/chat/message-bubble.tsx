import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface MessageBubbleProps {
  message: {
    role: 'user' | 'assistant'
    content: string
    created_at: string
  }
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-3 message-animation', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
        isUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted text-muted-foreground'
      )}>
        {isUser ? 'U' : 'AI'}
      </div>

      {/* Message content */}
      <div className={cn('flex-1 space-y-1', isUser ? 'max-w-[80%]' : 'max-w-[80%]')}>
        <div
          className={cn(
            'px-4 py-3 rounded-lg',
            isUser
              ? 'bg-primary text-primary-foreground ml-auto'
              : 'bg-muted text-foreground'
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <p className={cn(
          'text-xs text-muted-foreground px-1',
          isUser ? 'text-right' : 'text-left'
        )}>
          {format(new Date(message.created_at), 'h:mm a')}
        </p>
      </div>
    </div>
  )
}
