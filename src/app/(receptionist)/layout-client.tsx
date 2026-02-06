'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import { Logo } from '@/components/shared/Logo'
import { LogOut, QrCode } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ReceptionistLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const { loading, user, isAdmin, isMember, displayName, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace('/login')
      return
    }

    if (isAdmin) {
      router.replace('/dashboard')
    }

    if (isMember) {
      router.replace('/profile')
    }
  }, [loading, user, isAdmin, isMember, router])

  if (loading || !user) {
    return <LoadingScreen />
  }

  if (isAdmin || isMember) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <QrCode size={18} className="text-purple-600" />
            </div>
            <Logo size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 max-w-[100px] truncate">
              {displayName}
            </span>
            <button
              onClick={signOut}
              className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 active:bg-red-100 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-lg mx-auto w-full flex-1">
        {children}
      </main>
    </div>
  )
}
