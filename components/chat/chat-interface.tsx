'use client'

<<<<<<< HEAD
import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Send, Loader2 } from 'lucide-react'
=======
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Download, Menu, Settings, LogOut } from 'lucide-react'
>>>>>>> 23c926dd385cd4228de619ba7e5916f4eacb7e3c
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useSupabase } from '@/app/providers'
<<<<<<< HEAD
import { MessageBubble } from './message-bubble'
import { PricePreview } from './price-preview'
import { MarkupSelector } from './markup-selector'
import { LoadingChat } from './loading-chat'
import { ChatHeader } from './chat-header'
import { QuoteButton } from './quote-button'
import type { Database } from '@/types/database'

type Message = Database['public']['Tables']['chat_messages']['Row']

export function ChatInterface() {
  const params = useParams()
  const projectId = params.projectId as string
  const isNewProject = projectId === 'new'
  
=======
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
>>>>>>> 23c926dd385cd4228de619ba7e5916f4eacb7e3c
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(isNewProject ? null : projectId)
  const [stage, setStage] = useState<'gathering_info' | 'confirming_details' | 'calculating_quote' | 'quote_complete'>('gathering_info')
  const [baseCosts, setBaseCosts] = useState<{ labor: number, paint: number, supplies: number } | null>(null)
  const [finalPrice, setFinalPrice] = useState<number | null>(null)
  const [selectedMarkup, setSelectedMarkup] = useState(20)
<<<<<<< HEAD
  const [clientInfo, setClientInfo] = useState<{ name: string, address: string } | null>(null)
  const [latestQuoteId, setLatestQuoteId] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = useSupabase()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
=======
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
>>>>>>> 23c926dd385cd4228de619ba7e5916f4eacb7e3c

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!isNewProject && projectId) {
      loadMessages()
      loadProjectInfo()
      loadLatestQuote()
    } else {
      // Start with welcome message for new projects
      const welcomeMessage: Message = {
        id: 'welcome',
        project_id: 'new',
        role: 'assistant',
        content: "Hi! I'm here to help you create a professional painting quote. Let's start with some basic info - what's the client's name and property address?",
        metadata: null,
        created_at: new Date().toISOString()
      }
      setMessages([welcomeMessage])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (data && !error) {
      setMessages(data)
      
      // Check if we have a completed quote
      const lastMessage = data[data.length - 1]
      if (lastMessage?.metadata && (lastMessage.metadata as any).stage === 'quote_complete') {
        setStage('quote_complete')
        if ((lastMessage.metadata as any).baseCosts) {
          setBaseCosts((lastMessage.metadata as any).baseCosts)
        }
      }
    }
  }

  const loadProjectInfo = async () => {
    const { data } = await supabase
      .from('projects')
      .select('client_name, property_address')
      .eq('id', projectId)
      .single()

    if (data) {
      setClientInfo({ name: data.client_name, address: data.property_address })
    }
  }

  const loadLatestQuote = async () => {
    const { data } = await supabase
      .from('quotes')
      .select('id')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (data) {
      setLatestQuoteId(data.id)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      project_id: currentProjectId || 'new',
      role: 'user',
      content: inputValue,
      metadata: null,
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

<<<<<<< HEAD
=======
    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = '44px'
    }

>>>>>>> 23c926dd385cd4228de619ba7e5916f4eacb7e3c
    try {
      // Get the current user ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('No user found')
        return
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          projectId: currentProjectId,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          userId: user.id,
          conversationState: {
            stage: stage,
            clientName: clientInfo?.name,
            propertyAddress: clientInfo?.address,
            projectId: currentProjectId
          }
        })
      })

      const data = await response.json()
      console.log('API Response:', data)

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to get response`)
      }

      if (data.error) {
        throw new Error(data.error)
      }

      if (!data.response) {
        throw new Error('Empty response from AI assistant')
      }

      // Update project ID if this was a new project
      if (!currentProjectId && data.projectId) {
        setCurrentProjectId(data.projectId)
        // Update URL without navigation
        window.history.replaceState({}, '', `/chat/${data.projectId}`)
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        project_id: data.projectId || currentProjectId || 'new',
        role: 'assistant',
        content: data.response,
        metadata: data.metadata || null,
        created_at: new Date().toISOString()
      }
      
      console.log('Adding message with metadata:', data.metadata)
      setMessages(prev => [...prev, assistantMessage])

      // Update state based on response
      if (data.stage) {
        setStage(data.stage)
      }
      if (data.baseCosts) {
        setBaseCosts(data.baseCosts)
        // Calculate initial final price with 20% markup
        const totalBase = data.baseCosts.labor + data.baseCosts.paint + data.baseCosts.supplies
        setFinalPrice(totalBase * 1.2)
      }
      if (data.clientInfo) {
        setClientInfo(data.clientInfo)
      }

      // Save messages to database if we have a project ID
      if (data.projectId || currentProjectId) {
        await supabase.from('chat_messages').insert([
          { ...userMessage, project_id: data.projectId || currentProjectId },
          { ...assistantMessage, project_id: data.projectId || currentProjectId }
        ])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Add error message to chat
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        project_id: currentProjectId || 'error',
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error occurred'}. Please try again or contact support if this continues.`,
        metadata: null,
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkupChange = useCallback((markup: number) => {
    setSelectedMarkup(markup)
    if (baseCosts) {
      const totalBase = baseCosts.labor + baseCosts.paint + baseCosts.supplies
      const markupAmount = totalBase * (markup / 100)
      setFinalPrice(totalBase + markupAmount)
    }
  }, [baseCosts])

  const handleGenerateQuote = async () => {
    console.log('Generate Quote clicked', { baseCosts, finalPrice, currentProjectId })
    
    if (!baseCosts || !finalPrice) {
      console.error('Missing base costs or final price')
      return
    }
    
    if (!currentProjectId) {
      console.error('No project ID - creating project first')
      // Try to get project info from client info
      if (!clientInfo?.name) {
        console.error('No client info available')
        return
      }
      
      // Create project first
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          client_name: clientInfo.name,
          property_address: clientInfo.address || 'Address not provided'
        })
        .select()
        .single()
        
      if (projectError || !project) {
        console.error('Error creating project:', projectError)
        return
      }
      
      setCurrentProjectId(project.id)
      // Update URL
      window.history.replaceState({}, '', `/chat/${project.id}`)
    }

    setIsLoading(true)
    try {
      // Get project details from the last message metadata
      const lastMessageWithDetails = messages.findLast(m => m.metadata && (m.metadata as any).projectDetails)
      const projectDetails = (lastMessageWithDetails?.metadata as any)?.projectDetails || {
        totalSqft: 0,
        paintQuality: 'better',
        coats: 2,
        rooms: []
      }
      
      console.log('Creating quote with details:', projectDetails)
      
      const projectIdToUse = currentProjectId || (await (async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !clientInfo?.name) return null
        
        const { data: project } = await supabase
          .from('projects')
          .insert({
            user_id: user.id,
            client_name: clientInfo.name,
            property_address: clientInfo.address || 'Address not provided'
          })
          .select()
          .single()
        
        return project?.id
      })())
      
      if (!projectIdToUse) {
        throw new Error('Could not create or find project')
      }
      
      // Create quote in database (using only existing schema fields)
      const { data: quote, error } = await supabase
        .from('quotes')
        .insert({
          project_id: projectIdToUse,
          base_costs: baseCosts,
          markup_percentage: selectedMarkup,
          final_price: finalPrice,
          details: projectDetails,
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single()
        
      console.log('Quote creation result:', { quote, error })

      if (error) {
        console.error('Quote creation error:', error)
        throw error
      }

      console.log('Quote created successfully:', quote)

      // Update the stage
      setStage('quote_complete')
      setLatestQuoteId(quote.id)
      if (!currentProjectId) {
        setCurrentProjectId(projectIdToUse)
      }

      // Add a system message
      const systemMessage: Message = {
        id: crypto.randomUUID(),
        project_id: projectIdToUse,
        role: 'assistant',
        content: `Perfect! I've generated your quote with a ${selectedMarkup}% markup. The final price is ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(finalPrice)}. You can now view the business overview or client-facing quote.`,
        metadata: { stage: 'quote_complete', quoteId: quote.id },
        created_at: new Date().toISOString()
      }

      setMessages(prev => [...prev, systemMessage])
      
      // Save the system message
      try {
        await supabase.from('chat_messages').insert(systemMessage)
      } catch (msgError) {
        console.error('Error saving message:', msgError)
      }
      
    } catch (error) {
      console.error('Error generating quote:', error)
      
      // Add error message
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        project_id: currentProjectId || 'error',
        role: 'assistant',
        content: `Sorry, there was an error generating your quote: ${error instanceof Error ? error.message : JSON.stringify(error)}. Please try again.`,
        metadata: null,
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

<<<<<<< HEAD
  if (!messages.length) {
    return <LoadingChat />
=======
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    // Auto-resize textarea
    e.target.style.height = '44px'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`
>>>>>>> 23c926dd385cd4228de619ba7e5916f4eacb7e3c
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
<<<<<<< HEAD
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="flex-1 flex flex-col">
        {clientInfo && currentProjectId && (
          <ChatHeader 
            clientName={clientInfo.name} 
            propertyAddress={clientInfo.address}
            projectId={currentProjectId}
            latestQuoteId={latestQuoteId || undefined}
          />
        )}
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading || stage === 'quote_complete'}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !inputValue.trim() || stage === 'quote_complete'}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
=======
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
>>>>>>> 23c926dd385cd4228de619ba7e5916f4eacb7e3c
        </div>

<<<<<<< HEAD
      {/* Right Panel */}
      {(stage === 'calculating_quote' || stage === 'quote_complete') && baseCosts && (
        <div className="w-96 border-l p-4 space-y-4 overflow-y-auto">
          <PricePreview 
            baseCosts={baseCosts}
            markup={selectedMarkup}
            onGenerateQuote={handleGenerateQuote}
            isGenerating={isLoading}
            quoteId={latestQuoteId}
          />
          {stage === 'calculating_quote' && (
            <MarkupSelector
              baseCost={baseCosts.labor + baseCosts.paint + baseCosts.supplies}
              onMarkupChange={handleMarkupChange}
            />
          )}
        </div>
      )}
=======
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
>>>>>>> 23c926dd385cd4228de619ba7e5916f4eacb7e3c
    </div>
  )
}