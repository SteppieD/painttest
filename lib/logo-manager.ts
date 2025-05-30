import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const LOGO_BUCKET = 'company-logos'
const MAX_LOGO_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Initialize Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface LogoValidation {
  isValid: boolean
  error?: string
  dimensions?: {
    width: number
    height: number
  }
}

export interface LogoUploadResult {
  url: string
  path: string
}

/**
 * Validates a logo file before upload
 */
export async function validateLogo(file: File): Promise<LogoValidation> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`
    }
  }

  if (file.size > MAX_LOGO_SIZE) {
    return {
      isValid: false,
      error: `File too large. Maximum size: ${MAX_LOGO_SIZE / 1024 / 1024}MB`
    }
  }

  // Check image dimensions
  try {
    const dimensions = await getImageDimensions(file)
    return {
      isValid: true,
      dimensions
    }
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid image file'
    }
  }
}

/**
 * Gets image dimensions
 */
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      })
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Uploads a logo file to Supabase storage
 */
export async function uploadLogo(file: File, userId: string): Promise<LogoUploadResult> {
  // Validate file first
  const validation = await validateLogo(file)
  if (!validation.isValid) {
    throw new Error(validation.error)
  }

  // Ensure bucket exists
  const { data: buckets } = await supabase.storage.listBuckets()
  if (!buckets?.find(b => b.name === LOGO_BUCKET)) {
    const { error: createError } = await supabase.storage.createBucket(LOGO_BUCKET, {
      public: false,
      fileSizeLimit: MAX_LOGO_SIZE
    })
    if (createError) throw createError
  }

  // Upload file
  const path = `${userId}/${Date.now()}_${file.name}`
  const { error: uploadError } = await supabase.storage
    .from(LOGO_BUCKET)
    .upload(path, file)

  if (uploadError) throw uploadError

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(LOGO_BUCKET)
    .getPublicUrl(path)

  return {
    url: publicUrl,
    path
  }
}

/**
 * Updates a user's profile with new logo information
 */
export async function updateProfileLogo(
  userId: string,
  logoUrl: string,
  logoPath: string
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      logo_url: logoUrl,
      logo_storage_path: logoPath
    })
    .eq('id', userId)

  if (error) throw error
}

/**
 * Deletes an old logo file from storage
 */
export async function deleteOldLogo(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(LOGO_BUCKET)
    .remove([path])

  if (error) throw error
}

/**
 * Gets the current logo URL for a user
 */
export async function getUserLogo(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('logo_url')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data?.logo_url || null
}
