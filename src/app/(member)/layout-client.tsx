'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LogOut, User } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'

export function MemberLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const { loading, user, isMember, signOut, displayName } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (!isMember) {
      router.replace('/')
    }
  }, [loading, user, isMember, router])

  if (loading || !user || !isMember) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      {/* Top header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 leading-tight">{displayName}</p>
              <p className="text-xs text-gray-500">חבר מועדון</p>
            </div>
            <button
              onClick={signOut}
              className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              title="התנתק"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto">
        {children}
      </main>
    </div>
  )
}
