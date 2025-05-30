'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/app/providers'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, FileText, Copy, Download, ExternalLink, Copy as Duplicate } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { isQuoteExpired } from '@/lib/quote-formatter'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

interface QuoteWithProject {
  id: string
  final_price: number
  created_at: string
  valid_until: string
  projects: {
    client_name: string
    property_address: string
    user_id: string
  }
}

export default function QuotesPage() {
  const router = useRouter()
  const supabase = useSupabase()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(true)
  const [quotes, setQuotes] = useState<QuoteWithProject[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<{
    field: 'created_at' | 'final_price' | 'client_name',
    direction: 'asc' | 'desc'
  }>({
    field: 'created_at',
    direction: 'desc'
  })
  
  useEffect(() => {
    fetchQuotes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const fetchQuotes = async () => {
    try {
      setIsLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      // Get all quotes for the current user with project data
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          id,
          final_price,
          created_at,
          valid_until,
          projects!inner (
            client_name,
            property_address,
            user_id
          )
        `)
        .eq('projects.user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Transform the data to match our expected types
      const formattedQuotes = data.map(quote => ({
        ...quote,
        projects: quote.projects as unknown as QuoteWithProject['projects'] // Type assertion to handle nested object
      }))
      
      setQuotes(formattedQuotes)
    } catch (error) {
      console.error('Error fetching quotes:', error)
      toast({
        title: 'Error',
        description: 'Failed to load quotes.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }
  
  const handleSort = (field: 'created_at' | 'final_price' | 'client_name') => {
    setSortBy(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }
  
  const handleViewQuote = (quoteId: string) => {
    router.push(`/quotes/${quoteId}`)
  }
  
  const handleCopyLink = (quoteId: string) => {
    // In a real app, this would create a shareable link
    const link = `${window.location.origin}/quotes/${quoteId}`
    navigator.clipboard.writeText(link)
    toast({
      title: 'Link Copied',
      description: 'Quote link copied to clipboard.',
    })
  }
  
  const handleDownloadPdf = (quoteId: string) => {
    toast({
      title: 'Feature in Development',
      description: 'PDF download will be available in a future update.',
    })
  }
  
  const handleDuplicateQuote = async (quoteId: string) => {
    try {
      // Get the quote to duplicate
      const { data: originalQuote, error: fetchError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .single()
      
      if (fetchError) throw fetchError
      
      // Create a new quote with the same data
      const { data: newQuote, error: insertError } = await supabase
        .from('quotes')
        .insert({
          ...originalQuote,
          id: undefined, // Let Supabase generate a new ID
          created_at: new Date().toISOString(),
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        })
        .select()
        .single()
      
      if (insertError) throw insertError
      
      toast({
        title: 'Quote Duplicated',
        description: 'Quote was successfully duplicated.',
      })
      
      // Refresh quotes
      fetchQuotes()
    } catch (error) {
      console.error('Error duplicating quote:', error)
      toast({
        title: 'Error',
        description: 'Failed to duplicate quote.',
        variant: 'destructive'
      })
    }
  }
  
  // Filter quotes based on search term
  const filteredQuotes = quotes.filter(quote => {
    const searchLower = searchTerm.toLowerCase()
    return (
      quote.projects?.client_name.toLowerCase().includes(searchLower) ||
      quote.projects?.property_address.toLowerCase().includes(searchLower)
    )
  })
  
  // Sort filtered quotes
  const sortedQuotes = [...filteredQuotes].sort((a, b) => {
    if (sortBy.field === 'created_at') {
      return sortBy.direction === 'asc'
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    
    if (sortBy.field === 'final_price') {
      return sortBy.direction === 'asc'
        ? a.final_price - b.final_price
        : b.final_price - a.final_price
    }
    
    if (sortBy.field === 'client_name') {
      const nameA = a.projects?.client_name.toLowerCase() || ''
      const nameB = b.projects?.client_name.toLowerCase() || ''
      return sortBy.direction === 'asc'
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA)
    }
    
    return 0
  })
  
  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">Quotes</h1>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                onClick={() => router.push('/chat/new')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                New Quote
              </Button>
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by client or address..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {sortBy.field === 'created_at' && 'Date'}
                    {sortBy.field === 'final_price' && 'Amount'}
                    {sortBy.field === 'client_name' && 'Name'}
                    {' '}
                    {sortBy.direction === 'asc' ? '↑' : '↓'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleSort('created_at')}>
                    Date {sortBy.field === 'created_at' && (sortBy.direction === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('final_price')}>
                    Amount {sortBy.field === 'final_price' && (sortBy.direction === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('client_name')}>
                    Client Name {sortBy.field === 'client_name' && (sortBy.direction === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Quote cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="rounded-lg border p-4 h-40">
                    <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedQuotes.length === 0 ? (
            <div className="border rounded-lg p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No quotes found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? 'No quotes match your search terms.' : 'You haven\'t created any quotes yet.'}
              </p>
              {searchTerm && (
                <Button onClick={() => setSearchTerm('')} variant="outline">
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedQuotes.map((quote) => {
                const isExpired = isQuoteExpired(quote.valid_until)
                
                return (
                  <Card key={quote.id} className="overflow-hidden transition-all hover:shadow-md">
                    <CardContent className="p-0">
                      <div className="p-4 sm:p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">{quote.projects?.client_name}</h3>
                            <p className="text-muted-foreground text-sm mt-1">{quote.projects?.property_address}</p>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <span className="sr-only">Open menu</span>
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                                  <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewQuote(quote.id)}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                <span>View</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCopyLink(quote.id)}>
                                <Copy className="mr-2 h-4 w-4" />
                                <span>Copy Link</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadPdf(quote.id)}>
                                <Download className="mr-2 h-4 w-4" />
                                <span>Download PDF</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDuplicateQuote(quote.id)}>
                                <Duplicate className="mr-2 h-4 w-4" />
                                <span>Duplicate</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div>
                            <div className="text-2xl font-bold">{formatCurrency(quote.final_price)}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Created {new Date(quote.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          
                          {isExpired ? (
                            <div className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
                              Expired
                            </div>
                          ) : (
                            <div className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                              Valid
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="border-t p-3 bg-muted/30 flex justify-between items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleViewQuote(quote.id)}
                        >
                          View Details
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleCopyLink(quote.id)}
                        >
                          Copy Link
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
