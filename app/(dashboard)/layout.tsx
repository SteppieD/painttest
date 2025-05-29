import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
<<<<<<< HEAD
import { DashboardHeader } from '@/components/dashboard-header'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
=======
import { ProjectSidebar } from '@/components/chat/project-sidebar'
>>>>>>> 23c926dd385cd4228de619ba7e5916f4eacb7e3c

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

  // Get recent projects for sidebar
  const { data: projects } = await supabase
    .from('projects')
    .select('id, client_name, property_address, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <DashboardSidebar user={user} profile={profile} projects={projects || []} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <DashboardHeader user={user} profile={profile} />
        
        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
=======
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block w-[260px] border-r overflow-y-auto">
        <ProjectSidebar />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
>>>>>>> 23c926dd385cd4228de619ba7e5916f4eacb7e3c
      </div>
    </div>
  )
}
