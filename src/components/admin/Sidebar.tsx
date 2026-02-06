'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, QrCode, Send, LogOut, X, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Logo } from '@/components/shared/Logo'
import { useAuth } from '@/lib/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { label: 'דשבורד', href: ROUTES.DASHBOARD, icon: LayoutDashboard, disabled: false },
  { label: 'חברי מועדון', href: ROUTES.MEMBERS, icon: Users, disabled: false },
  { label: 'ברקודים', href: ROUTES.QR_CODES, icon: QrCode, disabled: false },
  { label: 'דיוורים', href: ROUTES.CAMPAIGNS, icon: Send, disabled: true, badge: 'בקרוב' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { signOut, displayName } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const fetchPendingCount = async () => {
      const supabase = createClient()
      const { count } = await supabase
        .from('club_members')
        .select('*', { count: 'exact', head: true })
        .eq('approval_status', 'pending')

      setPendingCount(count || 0)
    }

    fetchPendingCount()

    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Overlay - mobile only */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed right-0 top-0 h-screen w-72 bg-white border-l border-gray-200 flex flex-col z-50',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <Logo size="md" />
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* User info - mobile */}
        <div className="p-4 border-b border-gray-100 lg:hidden">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-purple-700 font-bold text-sm">
                {displayName?.charAt(0) || '?'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">{displayName}</p>
              <p className="text-xs text-gray-500">מנהל מערכת</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== ROUTES.DASHBOARD && pathname.startsWith(item.href))

            if (item.disabled) {
              return (
                <div
                  key={item.href}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-gray-300 cursor-not-allowed"
                >
                  <item.icon size={22} />
                  {item.label}
                  {item.badge && (
                    <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full mr-auto">
                      {item.badge}
                    </span>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200',
                  isActive
                    ? 'bg-purple-100 text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200'
                )}
              >
                <item.icon size={22} />
                {item.label}
                {/* Show pending badge on Members */}
                {item.href === ROUTES.MEMBERS && pendingCount > 0 && (
                  <span className="mr-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {pendingCount}
                  </span>
                )}
              </Link>
            )
          })}

          {/* Pending members quick link */}
          {pendingCount > 0 && (
            <Link
              href={ROUTES.PENDING_MEMBERS}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 mr-8',
                pathname === ROUTES.PENDING_MEMBERS
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'text-yellow-600 hover:bg-yellow-50'
              )}
            >
              <UserPlus size={18} />
              ממתינים לאישור
              <span className="mr-auto bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            </Link>
          )}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 active:bg-red-100 transition-all duration-200 w-full"
          >
            <LogOut size={22} />
            התנתק
          </button>
        </div>
      </aside>
    </>
  )
}
