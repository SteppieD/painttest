'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Download, Menu, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSupabase } from '@/app/providers'
import { useToast } from '@/components/ui/use-toast'
import { MarkupSelector } from './markup-selector'
import { PricePreview } from './price-preview'
import { generateQuotePDF } from '@/lib/pdf-generator'
import { calculateMarkup } from '@/lib/utils'
import type { BaseCosts, ProjectDetails } from '@/types/database'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ProjectSidebar } from './project-sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ChatInterfaceProps {
  projectId: string
  userId: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ConversationState {
  stage: 'gathering_info' | 'confirming_details' | 'calculating_quote' | 'quote_complete'
  projectDetails: Partial<ProjectDetails>
  clientName?: string
  propertyAddress?: string
  baseCosts?: BaseCosts
}

export function ChatInterface({ projectId, userId }: ChatInterfaceProps) {
  const router = useRouter()
  const supabase = useSupabase()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentProjectId, setCurrentProjectId] = useState(projectId)
  const [conversationState, setConversationState] = useState<ConversationState>({
    stage: 'gathering_info',
    projectDetails: {}
  })
  const [selectedMarkup, setSelectedMarkup] = useState(20)
  const [showPricing, setShowPricing] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    loadUser()
  }, [supabase])

  // Initialize chat
  useEffect(() => {
    if (projectId === 'new') {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: "Hi! Let's create a new painting quote. What's your client's name and the property address?",
        timestamp: new Date()
      }])
    } else {
      loadMessages()
    }
  }, [projectId])

  const loadMessages = async () => {
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (!error && messages) {
      setMessages(messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.created_at)
      })))
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = '44px'
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationState,
          messages: messages.slice(-10),
          userId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      if (data.conversationState) {
        setConversationState(data.conversationState)
        if (data.conversationState.baseCosts) {
          setShowPricing(true)
        }
      }

      if (currentProjectId !== 'new') {
        await saveMessage(currentProjectId, userMessage)
        await saveMessage(currentProjectId, assistantMessage)
      } else if (data.projectId) {
        setCurrentProjectId(data.projectId)
        router.replace(`/chat/${data.projectId}`)
      }

    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'Failed to process your message. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveMessage = async (projectId: string, message: Message) => {
    await supabase.from('chat_messages').insert({
      project_id: projectId,
      role: message.role,
      content: message.content,
      metadata: {}
    })
  }

  const handleGenerateQuote = async () => {
    if (!conversationState.baseCosts) return

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const pdfBlob = await generateQuotePDF({
        clientName: conversationState.clientName || '',
        propertyAddress: conversationState.propertyAddress || '',
        projectDetails: conversationState.projectDetails as ProjectDetails,
        baseCosts: conversationState.baseCosts,
        markupPercentage: selectedMarkup,
        companyName: profile?.company_name || 'Professional Painting Co.',
        companyPhone: profile?.phone || '(555) 123-4567',
        userName: profile?.company_name || 'Painting Professional'
      })

      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Quote_${conversationState.propertyAddress?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: 'Success!',
        description: 'Quote PDF downloaded successfully.'
      })

      if (currentProjectId !== 'new') {
        const totalCost = Object.values(conversationState.baseCosts).reduce((a, b) => a + b, 0)
        const { finalPrice } = calculateMarkup(totalCost, selectedMarkup)
        
        await supabase.from('quotes').insert({
          project_id: currentProjectId,
          base_costs: conversationState.baseCosts,
          markup_percentage: selectedMarkup,
          final_price: finalPrice,
          details: conversationState.projectDetails
        })
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive'
      })
    }
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b flex items-center px-4 bg-background">
        {/* Mobile burger menu */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[80%] max-w-sm p-0">
            <ProjectSidebar 
              currentProjectId={currentProjectId} 
              closeSidebar={() => setIsMobileSidebarOpen(false)}
            />
          </SheetContent>
        </Sheet>
        
        <div className="flex-1 ml-4 md:ml-0">
          <h1 className="text-lg font-semibold">PaintQuote Pro</h1>
        </div>
        
        {/* User menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    My Account
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main chat area */}
        <div className="flex-1 flex flex-col bg-background">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-4 px-4 md:px-8">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div 
                    className={cn(
                      "max-w-[85%] rounded-lg px-4 py-3",
                      message.role === "user" 
                        ? "bg-primary text-primary-foreground ml-12" 
                        : "bg-muted text-foreground mr-12"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
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
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="max-w-3xl mx-auto">
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
                  type="submit"
                  size="icon"
                  className="absolute right-2 bottom-2 h-8 w-8"
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Quote Panel */}
        {showPricing && conversationState.baseCosts && (
          <div className="hidden lg:block w-96 bg-muted/30 border-l p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Quote Details</h3>
              <button
                onClick={() => setShowPricing(false)}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                ✕
              </button>
            </div>
            
            <PricePreview
              baseCost={Object.values(conversationState.baseCosts).reduce((a, b) => a + b, 0)}
              markup={selectedMarkup}
              breakdown={conversationState.baseCosts}
            />
            
            <MarkupSelector
              baseCost={Object.values(conversationState.baseCosts).reduce((a, b) => a + b, 0)}
              onMarkupChange={setSelectedMarkup}
              quickOptions={[10, 15, 20, 25, 30]}
              showProfit={true}
            />

            <Button 
              onClick={handleGenerateQuote}
              className="w-full"
              size="lg"
            >
              <Download className="mr-2 h-4 w-4" />
              Generate Quote PDF
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
