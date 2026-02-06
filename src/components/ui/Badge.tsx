import { cn } from '@/lib/utils/cn'
import { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'purple'
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
    warning: 'bg-yellow-100 text-yellow-700',
    purple: 'bg-purple-100 text-purple-700',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
