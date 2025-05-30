import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/database'
import { LoadingChat } from '@/components/chat/loading-chat'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ChatPageProps {
  params: {
    projectId: string
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const auth = await requireAuth()
  
  if (!auth) {
    redirect('/login')
  }

  const { company } = auth

  // Handle new project creation
  if (params.projectId === 'new') {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Quote</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The chat interface is being updated. For now, please use the simple quote creation form.
            </p>
            <Button asChild>
              <Link href="/quotes">
                Back to Quotes
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get existing project
  const project = await db.project.findFirst({
    where: {
      id: params.projectId,
      companyId: company.id
    },
    include: {
      quotes: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  })

  if (!project) {
    notFound()
  }

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Project: {project.clientName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Address: {project.propertyAddress}
          </p>
          <p className="text-muted-foreground mb-4">
            The chat interface is being updated. 
          </p>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/quotes">
                Back to Quotes
              </Link>
            </Button>
            {project.quotes[0] && (
              <Button variant="outline" asChild>
                <Link href={`/quotes/${project.quotes[0].id}`}>
                  View Quote
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}