'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  if (!showInstallPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm mx-auto md:left-auto md:right-4 md:max-w-xs">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">Install PaintQuote Pro</h3>
          <p className="text-xs text-gray-600 mt-1">
            Add to your home screen for quick access to your quotes and projects.
          </p>
        </div>
        <button
          onClick={() => setShowInstallPrompt(false)}
          className="ml-2 text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <Button 
          onClick={handleInstall}
          size="sm"
          className="flex-1 text-xs"
        >
          <Download size={14} className="mr-1" />
          Install
        </Button>
        <Button
          onClick={() => setShowInstallPrompt(false)}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          Later
        </Button>
      </div>
    </div>
  )
}
