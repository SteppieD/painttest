import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard-header'
import { DashboardSidebar } from '@/components/dashboard-sidebar'

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
      </div>
    </div>
  )
}
