'use client'

import { useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { uploadLogo, updateProfileLogo, deleteOldLogo, validateLogo } from '@/lib/logo-manager'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface LogoSettingsProps {
  userId: string
  currentLogo?: string | null
  logoStoragePath?: string | null
}

export default function LogoSettings({ userId, currentLogo, logoStoragePath }: LogoSettingsProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
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

  return (
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
  )
}
