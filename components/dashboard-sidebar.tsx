'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Settings, LogOut, Home, FileText, MessageSquare, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// Removed Supabase import - using new auth system
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DashboardSidebarProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
  profile: any
  projects: Array<{
    id: string
    clientName: string
    propertyAddress: string
    createdAt: Date
  }>
}

export function DashboardSidebar({ user, profile, projects }: DashboardSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/quotes/login')
    router.refresh()
  }

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: Home,
    },
    {
      href: '/quotes',
      label: 'Quotes',
      icon: FileText,
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: Settings,
    },
  ]

  return (
    <div className="w-64 bg-muted/30 border-r flex flex-col h-screen">
      {/* Recent Chats Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <Button
            variant="default"
            className="w-full mb-4"
            asChild
          >
            <Link href="/chat/new">
              <Plus className="h-4 w-4 mr-2" />
              New Shipping Quote
            </Link>
          </Button>
          
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Quotes</h3>
          
          <div className="space-y-1">
            {projects.map((project, index) => {
              const isActive = pathname === `/chat/${project.id}`
              const clientName = project.clientName || 'Untitled Quote'
              const initial = clientName.charAt(0).toUpperCase()
              
              // Generate a consistent color based on the client name
              const colors = [
                'bg-red-500',
                'bg-orange-500', 
                'bg-amber-500',
                'bg-yellow-500',
                'bg-lime-500',
                'bg-green-500',
                'bg-emerald-500',
                'bg-teal-500',
                'bg-cyan-500',
                'bg-sky-500',
                'bg-blue-500',
                'bg-indigo-500',
                'bg-violet-500',
                'bg-purple-500',
                'bg-fuchsia-500',
                'bg-pink-500',
                'bg-rose-500'
              ]
              
              // Use client name to generate consistent color
              const colorIndex = clientName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
              const bgColor = colors[colorIndex]
              
              return (
                <Link
                  key={project.id}
                  href={`/chat/${project.id}`}
                  className={`block px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary/10'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-sm font-medium">{initial}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${
                        isActive ? 'text-primary' : 'text-foreground'
                      }`}>
                        {clientName}
                      </p>
                      {project.propertyAddress && (
                        <p className="text-xs text-muted-foreground truncate">
                          {project.propertyAddress}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 border-t">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* User Account Section - Bottom */}
      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 py-2 h-auto"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image || ''} alt={user.email || ''} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">
                  {profile?.company_name || 'My Company'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {profile?.company_name || 'My Company'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}