import { createClient } from '@/lib/supabase/server'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { formatCurrency } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Fetch recent projects with latest message
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      quotes (
        id,
        final_price,
        markup_percentage,
        created_at
      ),
      chat_messages (
        content,
        created_at,
        role
      )
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  // Get the latest message for each project
  const projectsWithLatestMessage = projects?.map(project => {
    const sortedMessages = project.chat_messages?.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) || []
    
    const latestMessage = sortedMessages[0]
    const latestQuote = project.quotes?.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]

    return {
      ...project,
      latestMessage,
      latestQuote,
    }
  }) || []

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <div className="w-80 bg-muted/50 border-r flex flex-col">
        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input 
              type="text"
              placeholder="Search conversations..." 
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {projectsWithLatestMessage.length > 0 ? (
            <div className="px-2">
              {projectsWithLatestMessage.map((project) => (
                <Link
                  key={project.id}
                  href={`/chat/${project.id}`}
                  className="block px-3 py-3 mb-1 hover:bg-muted rounded-md transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-medium text-sm text-foreground truncate flex-1 group-hover:text-primary transition-colors">
                      {project.client_name}
                    </h3>
                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                      {project.latestMessage ? 
                        formatDistanceToNow(new Date(project.latestMessage.created_at), { addSuffix: true })
                        : 'Just now'
                      }
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {project.property_address}
                  </p>
                  {project.latestMessage && (
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {project.latestMessage.content.substring(0, 60)}...
                    </p>
                  )}
                  {project.latestQuote && (
                    <p className="text-xs text-success mt-1.5 font-medium">
                      Quote: {formatCurrency(project.latestQuote.final_price)}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <p className="text-muted-foreground text-sm">No conversations yet</p>
              <p className="text-muted-foreground text-xs mt-1">Start a new quote to get started</p>
            </div>
          )}
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-t">
          <Link
            href="/chat/new"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium shadow-subtle"
          >
            <Plus className="h-4 w-4" />
            New Quote
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Start a New Quote
          </h2>
          <p className="text-muted-foreground mb-6">
            Select a conversation from the sidebar or create a new quote to get started
          </p>
          <Link
            href="/chat/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium shadow-subtle"
          >
            <Plus className="h-4 w-4" />
            Create New Quote
          </Link>
        </div>
      </div>
    </div>
  )
}
