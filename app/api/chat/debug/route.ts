import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get all projects for this user
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      id,
      client_name,
      property_address,
      created_at,
      quotes (
        id,
        quote_number,
        final_price,
        status,
        created_at
      ),
      chat_messages (
        id,
        content,
        role,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({
    user_id: user.id,
    projects_count: projects?.length || 0,
    projects: projects?.map(p => ({
      id: p.id,
      client_name: p.client_name,
      property_address: p.property_address,
      created_at: p.created_at,
      quotes_count: p.quotes?.length || 0,
      messages_count: p.chat_messages?.length || 0,
      quotes: p.quotes,
      latest_message: p.chat_messages?.[0]
    }))
  })
}