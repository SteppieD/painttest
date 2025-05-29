import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatInterface } from '@/components/chat/chat-interface'
import { LoadingChat } from '@/components/chat/loading-chat'

interface ChatPageProps {
  params: {
    projectId: string
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    notFound()
  }

  // Handle "new" project creation
  if (params.projectId === 'new') {
    return (
      <Suspense fallback={<LoadingChat />}>
        <ChatInterface />
      </Suspense>
    )
  }

  // Verify project exists and belongs to user
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.projectId)
    .eq('user_id', user.id)
    .single()

  if (!project) {
    notFound()
  }

  return (
    <Suspense fallback={<LoadingChat />}>
      <ChatInterface />
    </Suspense>
  )
}
