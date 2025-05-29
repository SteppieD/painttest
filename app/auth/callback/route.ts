import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    
    await supabase.auth.exchangeCodeForSession(code)
    
    // Check if user has a profile, if not, create one
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select()
        .eq('id', user.id)
        .single()
        
      if (!profile) {
        await supabase.from('profiles').insert({
          id: user.id,
          company_name: '',
          phone: '',
          business_info: {}
        })
        
        // Redirect to setup page for first-time users
        return NextResponse.redirect(new URL('/quotes/setup', requestUrl.origin))
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/quotes/dashboard', requestUrl.origin))
}
