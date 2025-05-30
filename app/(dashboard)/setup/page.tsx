'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export default function SetupPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to PaintQuote Pro! 🎨</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            Your painting quote app is ready to use. Here&apos;s how to get started:
          </p>

          <div className="space-y-4">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Create Your First Quote</p>
                <p className="text-sm text-muted-foreground">
                  Chat with the AI to generate professional quotes in minutes
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Customize Your Settings</p>
                <p className="text-sm text-muted-foreground">
                  Set your labor rates and material costs
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Send Quotes to Clients</p>
                <p className="text-sm text-muted-foreground">
                  Share quote links that clients can review and accept
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={() => router.push('/dashboard')}
              className="flex-1"
            >
              Go to Dashboard
            </Button>
            <Button 
              onClick={() => router.push('/quotes/chat/new')}
              variant="outline"
              className="flex-1"
            >
              Create First Quote
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}