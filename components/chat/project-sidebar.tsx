'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Settings, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, getProjectColor, getFirstStreetLetter } from '@/lib/utils'
import { useSupabase } from '@/app/providers'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Project {
  id: string
  client_name: string
  property_address: string
  created_at: string
  updated_at: string
}

interface ProjectSidebarProps {
  currentProjectId?: string
  onProjectSelect?: (projectId: string) => void
  closeSidebar?: () => void
}

export function ProjectSidebar({ currentProjectId, onProjectSelect, closeSidebar }: ProjectSidebarProps) {
  const router = useRouter()
  const supabase = useSupabase()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    loadUserAndProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadUserAndProjects = async () => {
    try {
      // Check for Supabase user first
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Supabase authenticated user
        setUser(user)

        // Load user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setProfile(profileData)

        // Load projects
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })

        if (error) throw error
        setProjects(data || [])
      } else {
        // Check for access code session
        const sessionData = localStorage.getItem('paintquote_session')
        if (sessionData) {
          try {
            const parsed = JSON.parse(sessionData)
            if (Date.now() - parsed.loginTime < 24 * 60 * 60 * 1000) {
              // Set demo user and profile for access code users
              setUser({ 
                id: parsed.userId, 
                email: 'demo@paintquote.com' 
              })
              setProfile({ 
                company_name: parsed.companyName,
                logo_url: null
              })
              
              // Set demo projects
              setProjects([
                {
                  id: 'demo-1',
                  client_name: 'Sarah Johnson',
                  property_address: '123 Main Street, Anytown, USA',
                  created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                  updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                  id: 'demo-2',
                  client_name: 'Mike Wilson',
                  property_address: '456 Oak Avenue, Springfield',
                  created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                  updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
                }
              ])
            }
          } catch {
            // Invalid session
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data and projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    // Clear access code session if it exists
    localStorage.removeItem('paintquote_session')
    
    // Sign out from Supabase if logged in
    await supabase.auth.signOut()
    
    router.push('/access-code')
  }

  const handleProjectSelect = (projectId: string) => {
    if (onProjectSelect) {
      onProjectSelect(projectId)
    } else {
      router.push(projectId === 'new' ? '/chat/new' : `/chat/${projectId}`)
    }
    if (closeSidebar) {
      closeSidebar()
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b">
        <Button 
          className="w-full justify-start" 
          onClick={() => handleProjectSelect('new')}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Quote
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 py-2 space-y-1">
          {loading ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No quotes yet. Start a new one!
            </div>
          ) : (
            projects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleProjectSelect(project.id)}
                className={cn(
                  "w-full flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                  project.id === currentProjectId
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50 text-foreground"
                )}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm mr-3 flex-shrink-0"
                  style={{ backgroundColor: getProjectColor(project.id) }}
                >
                  {getFirstStreetLetter(project.property_address)}
                </div>
                <div className="flex flex-col items-start truncate">
                  <div className="font-medium truncate w-full text-left">
                    {project.client_name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate w-full text-left">
                    {project.property_address}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* User Profile Section - Bottom Left */}
      {user && (
        <div className="p-3 border-t bg-background">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center px-3 py-2 rounded-md hover:bg-accent/50 transition-colors group">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src={profile?.logo_url} alt={profile?.company_name || 'User'} />
                  <AvatarFallback className="bg-blue-500 text-white">
                    {profile?.company_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start truncate flex-1">
                  <div className="font-medium text-sm truncate w-full text-left">
                    {profile?.company_name || 'My Company'}
                  </div>
                  <div className="text-xs text-muted-foreground truncate w-full text-left">
                    {user.email || 'Demo User'}
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 ml-2 group-hover:bg-green-400 transition-colors"></div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/admin/access-codes')}>
                <User className="mr-2 h-4 w-4" />
                Access Codes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
