import { ProjectSidebar } from '@/components/chat/project-sidebar'
import { DashboardNav } from '@/components/dashboard-nav'
import { Toaster } from '@/components/ui/toaster'
import { DashboardAuthWrapper } from '@/components/dashboard-auth-wrapper'
import dynamic from 'next/dynamic'

// Import the InstallPrompt component dynamically with no SSR
const InstallPrompt = dynamic(
  () => import('@/components/pwa/InstallPrompt'),
  { ssr: false }
)

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardAuthWrapper>
      <div className="flex h-screen bg-background">
        {/* Desktop sidebar */}
        <div className="hidden md:block w-[260px] border-r overflow-y-auto">
          <ProjectSidebar />
        </div>
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <DashboardNav />
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
          <Toaster />
        </div>
        
        {/* PWA install prompt */}
        <InstallPrompt />
      </div>
    </DashboardAuthWrapper>
  )
}
