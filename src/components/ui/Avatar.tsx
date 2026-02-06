import { cn } from '@/lib/utils/cn'
import { User } from 'lucide-react'
import Image from 'next/image'

interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl',
  }

  const iconSizes = {
    sm: 14,
    md: 20,
    lg: 28,
    xl: 40,
  }

  const getInitials = (name?: string) => {
    if (!name) return ''
    const parts = name.trim().split(/\s+/)
    return parts
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
  }

  if (src) {
    return (
      <div
        className={cn(
          'rounded-full overflow-hidden flex-shrink-0 relative',
          sizes[size],
          className
        )}
      >
        <Image
          src={src}
          alt={name || 'Avatar'}
          fill
          className="object-cover"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex-shrink-0 flex items-center justify-center bg-purple-100 text-purple-600 font-semibold',
        sizes[size],
        className
      )}
    >
      {name ? getInitials(name) : <User size={iconSizes[size]} />}
    </div>
  )
}
