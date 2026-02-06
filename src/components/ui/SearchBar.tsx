'use client'

import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'חיפוש...',
  className,
}: SearchBarProps) {
  return (
    <div className={cn('relative', className)}>
      <Search
        size={20}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pr-10 pl-10 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
      )}
    </div>
  )
}
