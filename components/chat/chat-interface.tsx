'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Menu, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSupabase } from '@/app/providers'
import { useToast } from '@/components/ui/use-toast'
import { MarkupSelector } from './markup-selector'
import { PricePreview } from './price-preview'
import { MessageBubble } from './message-bubble'
import { calculateMarkup } from '@/lib/utils'
import type { BaseCosts, ProjectDetails } from '@/types/database'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
// Fix potential circular import or undefined component issue
import dynamic from 'next/dynamic'

// Dynamically import ProjectSidebar with fallback
const ProjectSidebar = dynamic(() => import('./project-sidebar').then(mod => mod.ProjectSidebar), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col h-full bg-background p-4">
      <div className="text-center py-4 text-sm text-muted-foreground">
        Loading projects...
      </div>
    </div>
  )
})
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
  const [unsavedMessages, setUnsavedMessages] = useState<Message[]>([])
  const [hasError, setHasError] = useState(false)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load saved messages from localStorage if they exist
  useEffect(() => {
    const storageKey = `paintquote_chat_${projectId}`
    const savedMessages = localStorage.getItem(storageKey)
    
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages)
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          // Convert ISO date strings back to Date objects
          const formattedMessages = parsedMessages.map(m => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
          setMessages(formattedMessages)
        }
      } catch (error) {
        console.error('Error parsing saved messages:', error)
      }
    }
  }, [projectId])
  
  // Initialize chat
  useEffect(() => {
    if (projectId === 'new') {
      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: "Hi! Let's create a new painting quote. What's your client's name and the property address?",
        timestamp: new Date()
      }
      
      setMessages(prev => {
        // Only add welcome message if there are no messages
        if (prev.length === 0) {
          // Save to localStorage
          localStorage.setItem(`paintquote_chat_${projectId}`, JSON.stringify([welcomeMessage]))
          return [welcomeMessage]
        }
        return prev
      })
    } else {
      loadMessages()
    }
  }, [projectId])

  const loadMessages = async () => {
    try {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

      if (!error && messages && messages.length > 0) {
        const formattedMessages = messages.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at)
        }))
        
        setMessages(formattedMessages)
        
        // Also save to localStorage for backup
        localStorage.setItem(`paintquote_chat_${projectId}`, JSON.stringify(formattedMessages))
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      toast({
        title: 'Error',
        description: 'Failed to load previous messages. You can continue chatting, but messages may not be saved.',
        variant: 'destructive'
      })
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Save any unsaved messages when we get a project ID
  useEffect(() => {
    const saveUnsavedMessages = async () => {
      if (currentProjectId !== 'new' && unsavedMessages.length > 0) {
        setIsLoading(true)
        try {
          for (const message of unsavedMessages) {
            await saveMessage(currentProjectId, message)
          }
          setUnsavedMessages([])
          setHasError(false)
        } catch (error) {
          console.error('Failed to save unsaved messages:', error)
          setHasError(true)
        } finally {
          setIsLoading(false)
        }
      }
    }
    
    saveUnsavedMessages()
  }, [currentProjectId, unsavedMessages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }
    
    // Update state and localStorage immediately to prevent message loss
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    localStorage.setItem(`paintquote_chat_${currentProjectId}`, JSON.stringify(updatedMessages))
    
    setInput('')
    setIsLoading(true)
    setHasError(false)

    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = '44px'
    }

    try {
      // Create default project if we're still in "new" and there's no project yet
      let projectIdToUse = currentProjectId
      
      if (projectIdToUse === 'new' && messages.length > 1) {
        // Try to create a default project with placeholder data
        const defaultProject = await createDefaultProject(userMessage.content)
        if (defaultProject) {
          projectIdToUse = defaultProject.id
          setCurrentProjectId(projectIdToUse)
          
          // Save accumulated messages
          const messagesCopy = [...messages, userMessage]
          for (const msg of messagesCopy) {
            setUnsavedMessages(prev => [...prev, msg])
          }
        }
      }

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

      // Update state and localStorage with assistant response
      const newMessages = [...updatedMessages, assistantMessage]
      setMessages(newMessages)
      localStorage.setItem(`paintquote_chat_${currentProjectId}`, JSON.stringify(newMessages))

      if (data.conversationState) {
        setConversationState(data.conversationState)
        if (data.conversationState.baseCosts) {
          setShowPricing(true)
        }
      }

      // Handle project creation or message saving
      if (projectIdToUse !== 'new') {
        // Try to save both messages
        try {
          await saveMessage(projectIdToUse, userMessage)
          await saveMessage(projectIdToUse, assistantMessage)
        } catch (error) {
          console.error('Error saving messages to database:', error)
          // Add to unsaved messages queue for retry
          setUnsavedMessages(prev => [...prev, userMessage, assistantMessage])
          setHasError(true)
        }
      } else if (data.projectId) {
        // API created a project for us
        setCurrentProjectId(data.projectId)
        // Don't use router.replace as it might clear state
        router.push(`/chat/${data.projectId}`)
        
        // Add messages to unsaved queue to be saved after navigation
        setUnsavedMessages(prev => [...prev, userMessage, assistantMessage])
      } else {
        // No project ID yet, add to unsaved queue
        setUnsavedMessages(prev => [...prev, userMessage, assistantMessage])
      }

    } catch (error) {
      console.error('Error:', error)
      setHasError(true)
      toast({
        title: 'Error',
        description: 'Failed to process your message. Your message is saved locally, but may not be saved to the server.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Create a default project with placeholder data if necessary
  const createDefaultProject = async (messageText: string): Promise<any> => {
    try {
      // Try to extract client name and address from first messages
      let clientName = "New Client"
      let propertyAddress = "Address pending"
      
      // Simple extraction attempt from the message
      if (messageText.includes("name") && messageText.includes("address")) {
        const parts = messageText.split(/address|at|is|:|,|\./i)
        if (parts.length >= 2) {
          clientName = parts[0].replace(/my|client|name|is|the/gi, '').trim() || clientName
          propertyAddress = parts[1].trim() || propertyAddress
        }
      }
      
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          client_name: clientName,
          property_address: propertyAddress
        })
        .select()
        .single()
        
      if (error) throw error
      
      // Update local state with project details
      setConversationState(prev => ({
        ...prev,
        clientName,
        propertyAddress
      }))
      
      return project
    } catch (error) {
      console.error('Error creating default project:', error)
      return null
    }
  }

  const saveMessage = async (projectId: string, message: Message) => {
    try {
      const { error } = await supabase.from('chat_messages').insert({
        project_id: projectId,
        role: message.role,
        content: message.content,
        metadata: {}
      })
      
      if (error) throw error
      
      return true
    } catch (error) {
      console.error('Error saving message:', error)
      throw error
    }
  }

  const handleGenerateQuote = async () => {
    if (!conversationState.baseCosts) return

    const totalCost = Object.values(conversationState.baseCosts).reduce((a, b) => a + b, 0)
    const { finalPrice } = calculateMarkup(totalCost, selectedMarkup)

    // Save quote data to Supabase
    if (currentProjectId !== 'new') {
      try {
        const { data: quote, error } = await supabase.from('quotes').insert({
          project_id: currentProjectId,
          base_costs: conversationState.baseCosts,
          markup_percentage: selectedMarkup,
          final_price: finalPrice,
          details: conversationState.projectDetails
        }).select().single()
        
        if (error) throw error
        
        // Redirect to quote detail page
        router.push(`/quotes/${quote.id}`)
      } catch (error: unknown) {
        console.error('Error saving quote:', error)
        toast({
          title: 'Error',
          description: 'Failed to save quote. Please try again.',
          variant: 'destructive'
        })
      }
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
              
              {hasError && (
                <div className="flex justify-center">
                  <div className="bg-red-50 text-red-800 rounded-lg px-4 py-2 text-sm">
                    Some messages may not be saved to the server, but they&apos;re saved in your browser.
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-2"
                      onClick={() => {
                        if (currentProjectId !== 'new' && unsavedMessages.length > 0) {
                          const saveUnsavedMessages = async () => {
                            setIsLoading(true)
                            try {
                              for (const message of unsavedMessages) {
                                await saveMessage(currentProjectId, message)
                              }
                              setUnsavedMessages([])
                              setHasError(false)
                              toast({
                                title: 'Success',
                                description: 'Messages have been saved successfully.',
                                variant: 'default'
                              })
                            } catch (error) {
                              console.error('Failed to save unsaved messages:', error)
                              toast({
                                title: 'Error',
                                description: 'Failed to save messages. Please try again.',
                                variant: 'destructive'
                              })
                            } finally {
                              setIsLoading(false)
                            }
                          }
                          saveUnsavedMessages()
                        }
                      }}
                    >
                      Retry
                    </Button>
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
              View Quote
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
