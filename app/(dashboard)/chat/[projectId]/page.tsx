import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatInterface } from '@/components/chat/chat-interface'
import { LoadingChat } from '@/components/chat/loading-chat'
// Additional debugging imports
import dynamic from 'next/dynamic'

// Create dynamic import with detailed error handling
const DynamicChatInterface = dynamic(
  () => import('@/components/chat/chat-interface').then((mod) => {
    console.log("Chat module loaded:", mod);
    return mod.ChatInterface;
  }).catch(err => {
    console.error("Error loading ChatInterface:", err);
    throw err;
  }),
  { 
    loading: () => <LoadingChat />,
    ssr: false
  }
)

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
        <DynamicChatInterface projectId="new" userId={user.id} />
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
      <DynamicChatInterface projectId={params.projectId} userId={user.id} />
    </Suspense>
  )
}
