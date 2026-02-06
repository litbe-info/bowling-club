'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { MAX_PHOTO_SIZE, ALLOWED_PHOTO_TYPES } from '@/constants/config'

interface PhotoUploadProps {
  currentPhotoUrl?: string | null
  memberId?: string
  onPhotoUploaded: (url: string) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PhotoUpload({
  currentPhotoUrl,
  memberId,
  onPhotoUploaded,
  size = 'lg',
  className,
}: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const sizes = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28',
    lg: 'w-36 h-36',
  }

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setError('יש להעלות תמונה בפורמט JPG, PNG או WEBP')
      return
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setError('גודל הקובץ חורג מ-5MB')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    // Upload
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (memberId) {
        formData.append('memberId', memberId)
      }

      const res = await fetch('/api/upload/photo', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'שגיאה בהעלאה')
        return
      }

      onPhotoUploaded(data.url)
    } catch {
      setError('שגיאה בהעלאת התמונה')
    } finally {
      setUploading(false)
    }
  }, [memberId, onPhotoUploaded])

  const handleRemove = useCallback(() => {
    setPreview(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }, [])

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div
        className={cn(
          sizes[size],
          'relative rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 cursor-pointer hover:border-purple-400 transition-colors group'
        )}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="תמונת פרופיל"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={24} className="text-white" />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <Camera size={size === 'sm' ? 20 : 28} />
            <span className="text-xs mt-1">תמונה</span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <Loader2 size={24} className="text-purple-600 animate-spin" />
          </div>
        )}
      </div>

      {preview && !uploading && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleRemove()
          }}
          className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
        >
          <X size={14} />
          הסר תמונה
        </button>
      )}

      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
