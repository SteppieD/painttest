'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, getProjectColor, getFirstStreetLetter } from '@/lib/utils'

interface Project {
  id: string
  client_name: string
  property_address: string
  updated_at: string
}

interface ProjectSidebarProps {
  currentProjectId?: string | null
  onProjectSelect?: (projectId: string) => void
  closeSidebar?: () => void
}

export function ProjectSidebar({ currentProjectId, onProjectSelect, closeSidebar }: ProjectSidebarProps) {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Projects would be loaded from API here
    // For now, showing placeholder
    setProjects([])
  }, [])

  const handleProjectClick = (projectId: string) => {
    if (onProjectSelect) {
      onProjectSelect(projectId)
    } else {
      router.push(`/chat/${projectId}`)
    }
    if (closeSidebar) {
      closeSidebar()
    }
  }

  return (
    <div className="w-64 h-full bg-muted/30 border-r flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Projects</h2>
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-4">No projects yet</p>
            <Button 
              onClick={() => router.push('/quotes/chat/new')}
              size="sm"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {projects.map((project) => {
              const isActive = project.id === currentProjectId
              const color = getProjectColor(project.property_address)
              
              return (
                <button
                  key={project.id}
                  onClick={() => handleProjectClick(project.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg transition-colors',
                    'hover:bg-accent/50',
                    isActive && 'bg-accent'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      {getFirstStreetLetter(project.property_address)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{project.client_name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {project.property_address}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-t">
        <Button 
          onClick={() => router.push('/quotes/chat/new')}
          className="w-full"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Quote
        </Button>
      </div>
    </div>
  )
}