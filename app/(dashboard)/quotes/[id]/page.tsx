'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSupabase } from '@/app/providers'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Clipboard, Share2, AlertTriangle, CheckCircle, Eye, Edit, FileText, ArrowLeftRight, X } from 'lucide-react'
import QuoteEditor from '@/components/quote-workflow/QuoteEditor'
import { formatCurrency } from '@/lib/utils'
import { formatQuoteForCopy, getQuoteStatus } from '@/lib/quote-formatter'
import QuoteDetails from '@/components/quote-details'
import QuoteJobTracker from '@/components/quote-job-tracker'
import { EnhancedBaseCosts } from '@/types/database'

export default function QuotePage() {
  const params = useParams()
  const router = useRouter()
  const quoteId = params.id as string
  const supabase = useSupabase()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(true)
  const [quoteData, setQuoteData] = useState<any>(null)
  const [projectData, setProjectData] = useState<any>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [refreshFlag, setRefreshFlag] = useState(0)
  const [isEditMode, setIsEditMode] = useState(false)
  
  const refreshData = () => {
    setRefreshFlag(prev => prev + 1)
  }
  
  const handleEditQuote = () => {
    setIsEditMode(true)
  }
  
  const handleCancelEdit = () => {
    setIsEditMode(false)
  }
  
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
        
        // Get user data
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        setUserData(user)
        
        // Fetch profile data
        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
            
          if (profileError) throw profileError
          setProfileData(profile)
        }
      } catch (error) {
        console.error('Error fetching quote data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load quote data.',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [quoteId, supabase, toast, refreshFlag])
  
  const handleUpdateStatus = async (status: 'accepted' | 'denied' | 'quoted') => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ job_status: status })
        .eq('id', quoteId)
        
      if (error) throw error
      
      toast({
        title: 'Status Updated',
        description: `Quote has been marked as ${status}.`,
        variant: 'default'
      })
      
      refreshData()
    } catch (error) {
      console.error('Error updating quote status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update quote status.',
        variant: 'destructive'
      })
    }
  }
  
  const handleCopyQuote = () => {
    if (!quoteData || !projectData || !profileData || !userData) return
    
    const formatData = {
      quote: quoteData,
      project: projectData,
      profile: profileData,
      user: userData
    }
    
    const formattedQuote = formatQuoteForCopy(formatData)
    
    navigator.clipboard.writeText(formattedQuote)
      .then(() => {
        toast({
          title: 'Quote Copied',
          description: 'The quote has been copied to your clipboard.',
          variant: 'default'
        })
      })
      .catch(err => {
        console.error('Failed to copy quote:', err)
        toast({
          title: 'Error',
          description: 'Failed to copy the quote. Please try again.',
          variant: 'destructive'
        })
      })
  }
  
  const handleShareQuote = () => {
    toast({
      title: 'Coming Soon',
      description: 'The ability to share quotes with clients will be available in a future update.',
      variant: 'default'
    })
  }
  
  if (isLoading) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl text-center">
          <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
            <div className="h-32 bg-muted rounded w-full"></div>
            <div className="h-64 bg-muted rounded w-full"></div>
            <div className="h-12 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!quoteData || !projectData) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl text-center">
          <h1 className="text-2xl font-bold mb-4">Quote Not Found</h1>
          <p className="text-muted-foreground">
            The quote you requested could not be found.
          </p>
        </div>
      </div>
    )
  }

  const quoteStatus = getQuoteStatus(quoteData.valid_until)
  const baseCostTotal = Object.values(quoteData.base_costs).reduce<number>((a, b) => a + (typeof b === 'number' ? b : 0), 0)
  const companyName = profileData?.company_name || 'Professional Painting Co.'
  
  // If in edit mode, show QuoteEditor
  if (isEditMode) {
    return (
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="w-full max-w-5xl mx-auto">
          <QuoteEditor
            quoteId={quoteId}
            initialData={{
              quoteNumber: quoteData.quote_number,
              validUntil: quoteData.valid_until,
              finalPrice: quoteData.final_price,
              markupPercentage: quoteData.markup_percentage,
              baseCosts: quoteData.base_costs as EnhancedBaseCosts,
              details: quoteData.details,
              status: quoteData.job_status
            }}
            onCancel={handleCancelEdit}
            onSave={() => {
              refreshData()
              setIsEditMode(false)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex flex-col gap-6">
          {/* Header with actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">Painting Estimate</h1>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleEditQuote}
                className="gap-2"
                variant="outline"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Edit Quote</span>
                <span className="sm:hidden">Edit</span>
              </Button>
              
              <Button 
                onClick={() => router.push(`/quotes/${quoteId}/client-view`)}
                className="gap-2"
                variant="secondary"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Client View</span>
                <span className="sm:hidden">View</span>
              </Button>
              
              <Button 
                onClick={handleCopyQuote} 
                className="gap-2"
              >
                <Clipboard className="h-4 w-4" />
                <span>Copy Quote</span>
              </Button>
              
              <Button 
                onClick={handleShareQuote} 
                variant="outline" 
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share with Client</span>
                <span className="sm:hidden">Share</span>
              </Button>
            </div>
          </div>
          
          {/* Status badges */}
          <div className="flex items-center gap-2">
            {quoteStatus === 'expired' ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Expired</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>Valid until {new Date(quoteData.valid_until).toLocaleDateString()}</span>
              </div>
            )}
            
            {quoteData.job_status && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                quoteData.job_status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                quoteData.job_status === 'completed' ? 'bg-green-100 text-green-800' :
                quoteData.job_status === 'denied' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                <span className="capitalize">{quoteData.job_status}</span>
              </div>
            )}
          </div>
          
          {/* Company and client info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Company Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{companyName}</p>
                  {profileData?.phone && (
                    <p>{profileData.phone}</p>
                  )}
                  {userData?.email && (
                    <p>{userData.email}</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Client info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{projectData.client_name}</p>
                  <p>{projectData.property_address}</p>
                  <p>Date: {new Date(quoteData.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Quote Status Actions (if not completed) */}
          {quoteData.job_status !== 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle>Quote Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={() => handleUpdateStatus('accepted')}
                    variant={quoteData.job_status === 'accepted' ? 'default' : 'outline'}
                    className={quoteData.job_status === 'accepted' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    Mark as Accepted
                  </Button>
                  <Button 
                    onClick={() => handleUpdateStatus('denied')}
                    variant={quoteData.job_status === 'denied' ? 'default' : 'outline'}
                    className={quoteData.job_status === 'denied' ? 'bg-red-600 hover:bg-red-700' : ''}
                  >
                    Mark as Denied
                  </Button>
                  <Button 
                    onClick={() => handleUpdateStatus('quoted')}
                    variant={!quoteData.job_status || quoteData.job_status === 'quoted' ? 'default' : 'outline'}
                  >
                    Reset to Quoted
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Job Performance Tracking (if accepted) */}
          {quoteData.job_status === 'accepted' && (
            <QuoteJobTracker 
              quoteId={quoteId}
              baseCosts={quoteData.base_costs as EnhancedBaseCosts}
              onUpdate={refreshData}
            />
          )}
          
          {/* Quote Details */}
          <QuoteDetails
            quoteMethod={quoteData.quote_method || 'simple'}
            markupPercentage={quoteData.markup_percentage}
            baseCosts={quoteData.base_costs as EnhancedBaseCosts}
            projectDetails={quoteData.details}
            status={quoteData.job_status || 'quoted'}
            validUntil={quoteData.valid_until}
          />
          
          {/* Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>This is an estimate based on the scope of work discussed</li>
                <li>Final price may vary based on actual conditions</li>
                <li>50% deposit required to begin work</li>
                <li>Balance due upon completion</li>
                <li>Includes all labor, materials, and supplies</li>
                <li>Additional work not included in this estimate</li>
              </ul>
            </CardContent>
            <CardFooter className="border-t pt-4 text-center text-sm text-muted-foreground">
              <p>Thank you for considering {companyName} for your painting needs!</p>
            </CardFooter>
          </Card>
          
          {/* Action buttons at bottom for mobile */}
          <div className="flex gap-2 md:hidden mt-4">
            <Button 
              onClick={handleCopyQuote} 
              className="flex-1 gap-2"
            >
              <Clipboard className="h-4 w-4" />
              <span>Copy Quote</span>
            </Button>
            
            <Button 
              onClick={handleShareQuote} 
              variant="outline" 
              className="flex-1 gap-2"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
