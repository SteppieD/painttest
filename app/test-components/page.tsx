'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LoadingChat } from '@/components/chat/loading-chat'
import { MessageBubble } from '@/components/chat/message-bubble'

export default function TestComponentsPage() {
  const [testMessage, setTestMessage] = useState<{
    id: string;
    role: 'assistant' | 'user';
    content: string;
    timestamp: Date;
  }>({
    id: '1',
    role: 'assistant',
    content: 'Hello! This is a test message to verify the chat components are working properly.',
    timestamp: new Date()
  })

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Component Test Page</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">LoadingChat Component</h2>
        <div className="border rounded-lg h-64 overflow-hidden">
          <LoadingChat />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">MessageBubble Component</h2>
        <div className="border rounded-lg p-4">
          <MessageBubble message={testMessage} />
          <Button 
            className="mt-4"
            onClick={() => setTestMessage(prev => ({
              ...prev,
              role: prev.role === 'user' ? 'assistant' : 'user'
            }))}
          >
            Toggle Role
          </Button>
        </div>
      </div>
    </div>
  )
}
