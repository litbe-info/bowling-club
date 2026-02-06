'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary:
        'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 shadow-sm hover:shadow-md',
      secondary:
        'bg-yellow-400 text-gray-900 hover:bg-yellow-500 active:bg-yellow-600 shadow-sm hover:shadow-md',
      outline:
        'border-2 border-purple-600 text-purple-600 hover:bg-purple-50 active:bg-purple-100',
      danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
      ghost: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" size={18} />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
