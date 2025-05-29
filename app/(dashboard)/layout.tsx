import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard-header'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { prisma } from '@/lib/prisma'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/quotes/login')
  }

  // Get user data with projects
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      projects: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          clientName: true,
          propertyAddress: true,
          createdAt: true,
        }
      }
    }
  })

  if (!user) {
    redirect('/quotes/login')
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <DashboardSidebar user={session.user} profile={user} projects={user.projects} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <DashboardHeader user={session.user} profile={user} />
        
        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
