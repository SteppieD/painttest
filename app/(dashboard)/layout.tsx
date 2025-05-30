import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard-header'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { getSessionWithCompany } from '@/lib/auth'
import { db } from '@/lib/database'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const auth = await getSessionWithCompany()
  
  if (!auth) {
    redirect('/login')
  }

  const { session, company } = auth

  // Get recent projects
  const projects = await db.project.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      clientName: true,
      propertyAddress: true,
      createdAt: true
    }
  })

  const userData = {
    id: company.id,
    email: company.email,
    name: company.name,
    image: company.logo
  }

  const profileData = {
    ...company,
    companyName: company.name,
    businessInfo: company.settings ? JSON.stringify(company.settings) : null
  }

  const formattedProjects = projects.map(project => ({
    id: project.id,
    clientName: project.clientName,
    propertyAddress: project.propertyAddress,
    createdAt: project.createdAt
  }))

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <DashboardSidebar user={userData} profile={profileData} projects={formattedProjects} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <DashboardHeader user={userData} profile={profileData} />
        
        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}