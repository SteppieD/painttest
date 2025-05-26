import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectSidebar } from '@/components/chat/project-sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select()
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block w-[260px] border-r overflow-y-auto">
        <ProjectSidebar />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}
