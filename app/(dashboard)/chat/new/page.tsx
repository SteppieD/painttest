import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoadingChat } from '@/components/chat/loading-chat'
import dynamic from 'next/dynamic'

// Create dynamic import with more robust error handling
const DynamicChatInterface = dynamic(
  () => import('@/components/chat/chat-interface')
    .then((mod) => {
      console.log("Chat module loaded successfully:", mod);
      if (!mod.ChatInterface) {
        console.error("ChatInterface not found in module:", mod);
        throw new Error("ChatInterface component not found");
      }
      return mod.ChatInterface;
    })
    .catch(err => {
      console.error("Failed to load chat interface:", err);
      throw err;
    }),
  { 
    loading: () => <LoadingChat />,
    ssr: false
  }
)

export default async function NewChatPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Add console log for debugging
  console.log("NewChatPage: Rendering with user", user.id);

  return (
    <div className="flex-1 h-full">
      <Suspense fallback={<LoadingChat />}>
        <DynamicChatInterface projectId="new" userId={user.id} />
      </Suspense>
    </div>
  )
}
