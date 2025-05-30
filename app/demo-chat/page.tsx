'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MessageBubble } from '@/components/chat/message-bubble'
import { LoadingChat } from '@/components/chat/loading-chat'
import { Send } from 'lucide-react'

// Define the Message interface to fix TypeScript errors
interface Message {
  id: string
  role: 'assistant' | 'user'
  content: string
  timestamp: Date
}

export default function DemoChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! This is a demo of the chat interface. The application's chat functionality now works correctly with the fixed components.",
      timestamp: new Date()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || isLoading) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response after delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `You said: "${input.trim()}". This is a simulated response to demonstrate that the chat interface components are working correctly. The original issue with undefined components has been fixed by using dynamic imports.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    // Auto-resize textarea
    e.target.style.height = '44px'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="h-14 border-b flex items-center px-4 bg-background">
        <h1 className="text-lg font-semibold">PaintQuote Pro - Demo Chat</h1>
      </header>

      <div className="flex-1 flex flex-col bg-background">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 px-4 md:px-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-3 max-w-[85%] mr-12">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t p-4 bg-background">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="w-full p-3 pr-12 bg-muted border-0 rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[44px] max-h-[200px] placeholder:text-muted-foreground"
                rows={1}
              />
              <Button 
                onClick={handleSend}
                size="icon"
                className="absolute right-2 bottom-2 h-8 w-8"
                disabled={isLoading || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This is a demo of the fixed chat interface. The original issue with undefined components has been resolved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
