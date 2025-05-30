'use client'

import { useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { validateAPIConfiguration, updateAPIKeys } from '@/lib/api-validator'
import { uploadLogo, updateProfileLogo, deleteOldLogo, validateLogo } from '@/lib/logo-manager'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface APILogoSettingsProps {
  userId: string
  currentLogo?: string | null
  logoStoragePath?: string | null
}

export default function APILogoSettings({ userId, currentLogo, logoStoragePath }: APILogoSettingsProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [geminiKey, setGeminiKey] = useState('')
  const [openaiKey, setOpenaiKey] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogo || null)

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const validation = await validateLogo(file)
      if (!validation.isValid) {
        toast({
          title: 'Invalid Logo File',
          description: validation.error,
          variant: 'destructive',
        })
        return
      }

      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    } catch (error) {
      toast({
        title: 'Error Processing Logo',
        description: 'Failed to process the selected logo file.',
        variant: 'destructive',
      })
    }
  }, [toast])

  const handleLogoUpload = async () => {
    if (!selectedFile) return

    setIsLoading(true)
    try {
      // Upload new logo
      const { url, path } = await uploadLogo(selectedFile, userId)
      
      // Delete old logo if exists
      if (logoStoragePath) {
        await deleteOldLogo(logoStoragePath)
      }
      
      // Update profile
      await updateProfileLogo(userId, url, path)
      
      toast({
        title: 'Logo Updated',
        description: 'Your company logo has been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload logo.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAPIKeyUpdate = async () => {
    setIsLoading(true)
    try {
      // Update environment with new keys
      updateAPIKeys(geminiKey, openaiKey)
      
      // Validate the configuration
      const validation = await validateAPIConfiguration()
      
      if (!validation.isValid) {
        throw new Error(validation.error)
      }
      
      toast({
        title: 'API Keys Updated',
        description: `Successfully configured ${validation.provider} API.`,
      })
      
      // Clear form
      setGeminiKey('')
      setOpenaiKey('')
    } catch (error) {
      toast({
        title: 'API Configuration Failed',
        description: error instanceof Error ? error.message : 'Failed to update API keys.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Logo Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Company Logo</h3>
        <div className="space-y-4">
          {/* Logo Preview */}
          {previewUrl && (
            <div className="relative w-32 h-32 mb-4">
              <Image
                src={previewUrl}
                alt="Company Logo"
                fill
                className="object-contain"
              />
            </div>
          )}
          
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo">Upload Logo</Label>
            <Input
              id="logo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-500">
              Recommended: PNG or JPEG, max 2MB
            </p>
          </div>
          
          {selectedFile && (
            <Button
              onClick={handleLogoUpload}
              disabled={isLoading}
            >
              {isLoading ? 'Uploading...' : 'Save Logo'}
            </Button>
          )}
        </div>
      </Card>

      {/* API Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">AI API Configuration</h3>
        <div className="space-y-4">
          {/* Gemini API Key */}
          <div className="space-y-2">
            <Label htmlFor="gemini">Google Gemini API Key</Label>
            <Input
              id="gemini"
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="Enter Gemini API key"
            />
          </div>

          {/* OpenAI API Key */}
          <div className="space-y-2">
            <Label htmlFor="openai">OpenAI API Key</Label>
            <Input
              id="openai"
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="Enter OpenAI API key"
            />
          </div>

          <Button
            onClick={handleAPIKeyUpdate}
            disabled={isLoading || (!geminiKey && !openaiKey)}
          >
            {isLoading ? 'Updating...' : 'Update API Keys'}
          </Button>
          
          <p className="text-sm text-gray-500">
            Note: At least one API key must be configured for the application to function.
          </p>
        </div>
      </Card>
    </div>
  )
}
