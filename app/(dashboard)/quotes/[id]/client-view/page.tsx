'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSupabase } from '@/app/providers'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Loader2, Printer, ArrowLeft, Check } from 'lucide-react'
import ClientFacingQuote from '@/components/quote-workflow/ClientFacingQuote'
import Link from 'next/link'

export default function ClientQuoteView() {
  const params = useParams()
  const quoteId = params.id as string
  const supabase = useSupabase()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isAccepting, setIsAccepting] = useState(false)
  const [quoteData, setQuoteData] = useState<any>(null)
  const [projectData, setProjectData] = useState<any>(null)
  const [profileData, setProfileData] = useState<any>(null)
  
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        
        // Fetch quote data
        const { data: quote, error: quoteError } = await supabase
          .from('quotes')
          .select('*')
          .eq('id', quoteId)
          .single()
          
        if (quoteError) throw quoteError
        setQuoteData(quote)
        
        // Fetch project data
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', quote.project_id)
          .single()
          
        if (projectError) throw projectError
        setProjectData(project)
        
        // Fetch company profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', project.user_id)
          .single()
          
        if (profileError) throw profileError
        setProfileData(profile)
        
        // Fetch additional data based on quote method
        if (quote.quote_method === 'simple') {
          // For simple quotes, fetch surface details
          const { data: surfaces, error: surfacesError } = await supabase
            .from('quote_surfaces')
            .select('*, paint_product:paint_product_id(*)')
            .eq('quote_id', quoteId)
            
          if (surfacesError) {
            console.error('Error fetching surfaces:', surfacesError)
          } else if (surfaces) {
            // Add surfaces to quote data
            setQuoteData((prev: any) => ({
              ...prev,
              surfaces: surfaces
            }))
          }
        } else if (quote.quote_method === 'detailed') {
          // For detailed quotes, fetch room details
          const { data: rooms, error: roomsError } = await supabase
            .from('room_details')
            .select('*')
            .eq('project_id', quote.project_id)
            
          if (roomsError) {
            console.error('Error fetching room details:', roomsError)
          } else if (rooms) {
            // Add room details to quote data
            setQuoteData((prev: any) => ({
              ...prev,
              rooms: rooms
            }))
          }
        }
      } catch (error) {
        console.error('Error fetching quote data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load quote information.',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [quoteId, supabase, toast])
  
  const handleAcceptQuote = async () => {
    try {
      setIsAccepting(true)
      
      const { error } = await supabase
        .from('quotes')
        .update({ job_status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', quoteId)
        
      if (error) throw error
      
      // Refresh the quote data
      const { data, error: refreshError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .single()
        
      if (refreshError) throw refreshError
      setQuoteData(data)
      
      toast({
        title: 'Quote Accepted',
        description: 'Thank you for accepting this quote!',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error accepting quote:', error)
      toast({
        title: 'Error',
        description: 'Failed to accept the quote. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsAccepting(false)
    }
  }
  
  const handlePrint = () => {
    window.print()
  }
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading your quote...</p>
        </div>
      </div>
    )
  }
  
  if (!quoteData || !projectData || !profileData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl text-center">
          <h1 className="text-2xl font-bold mb-4">Quote Not Found</h1>
          <p className="text-muted-foreground">
            The quote you requested could not be found.
          </p>
        </div>
      </div>
    )
  }
  
  const isQuoteExpired = new Date(quoteData.valid_until) < new Date()
  const isQuoteAccepted = quoteData.job_status === 'accepted' || quoteData.job_status === 'completed'
  
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Back to Dashboard & Print buttons - hidden when printing */}
      <div className="p-4 flex justify-between items-center print:hidden">
        <Link href={`/quotes/${quoteId}`} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Quote Dashboard</span>
        </Link>
        
        <Button onClick={handlePrint} variant="outline" size="sm" className="gap-1">
          <Printer className="h-4 w-4" />
          <span>Print Quote</span>
        </Button>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-4 flex flex-col items-center">
        <ClientFacingQuote
          quoteId={quoteData.id}
          quoteNumber={quoteData.quote_number || `${quoteData.id.slice(0, 8).toUpperCase()}`}
          companyName={profileData.company_name || 'Professional Painting Services'}
          companyLogo={profileData.logo_url}
          companyEmail={profileData.email}
          companyPhone={profileData.phone}
          clientName={projectData.client_name}
          propertyAddress={projectData.property_address}
          createdAt={quoteData.created_at}
          validUntil={quoteData.valid_until}
          finalPrice={quoteData.final_price}
          quoteMethod={quoteData.quote_method || 'simple'}
          projectDetails={{
            // Include original details
            ...quoteData.details,
            // Add surfaces and rooms data
            surfaces: quoteData.surfaces || [],
            rooms: quoteData.rooms || [],
            // Add client information with fallbacks
            client_name: projectData.client_name || 'Client information pending',
            property_address: projectData.property_address || 'Address pending'
          }}
          status={quoteData.job_status || 'quoted'}
          termsAndConditions={profileData.terms_and_conditions}
          onAcceptQuote={handleAcceptQuote}
        />
      </div>
      
      {/* Footer - hidden when printing */}
      <footer className="p-4 text-center text-sm text-muted-foreground print:hidden">
        <p>This quote was created with Painting Estimator Pro</p>
      </footer>
    </div>
  )
}
