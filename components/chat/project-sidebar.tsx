'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, getProjectColor, getFirstStreetLetter } from '@/lib/utils'
import { useSupabase } from '@/app/providers'

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

  useEffect(() => {
    loadProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
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
    </div>
  )
}
