import { cn } from '@/lib/utils/cn'
import { Loader2 } from 'lucide-react'

interface SpinnerProps {
  size?: number
  className?: string
}

export function Spinner({ size = 24, className }: SpinnerProps) {
  return (
    <Loader2
      size={size}
      className={cn('animate-spin text-purple-600', className)}
    />
  )
}
