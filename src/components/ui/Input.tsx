'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 mr-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full px-4 py-3 rounded-xl border bg-white text-gray-900 text-base',
            'transition-colors duration-200',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 hover:border-gray-400',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-sm text-gray-500">{hint}</p>
        )}
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
