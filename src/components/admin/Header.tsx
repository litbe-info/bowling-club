'use client'

import { Menu } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useSidebar } from '@/app/(admin)/layout-client'
import { Avatar } from '@/components/ui/Avatar'

interface HeaderProps {
  title: string
  actions?: React.ReactNode
}

export function Header({ title, actions }: HeaderProps) {
  const { displayName } = useAuth()
  const { toggle } = useSidebar()

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 lg:py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Hamburger - mobile only */}
          <button
            onClick={toggle}
            className="p-2 -mr-2 rounded-xl text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors lg:hidden"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">{title}</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {actions && <div className="hidden sm:flex items-center gap-2">{actions}</div>}
          {/* Mobile actions - show compact */}
          {actions && <div className="sm:hidden flex items-center gap-1">{actions}</div>}
          <div className="hidden lg:flex items-center gap-3">
            <Avatar name={displayName || undefined} size="sm" />
            <span className="text-sm font-medium text-gray-700">
              {displayName}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
