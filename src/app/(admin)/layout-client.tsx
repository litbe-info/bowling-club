'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { Sidebar } from '@/components/admin/Sidebar'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import { useRouter } from 'next/navigation'
import { useEffect, useState, createContext, useContext, useCallback } from 'react'

// Sidebar context so Header can toggle it
interface SidebarContextType {
  open: boolean
  toggle: () => void
  close: () => void
}

const SidebarContext = createContext<SidebarContextType>({
  open: false,
  toggle: () => {},
  close: () => {},
})

export function useSidebar() {
  return useContext(SidebarContext)
}

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const { loading, user, isReceptionist, isMember } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (isReceptionist) {
      router.replace('/scan')
    }
    if (isMember) {
      router.replace('/profile')
    }
  }, [loading, user, isReceptionist, isMember, router])

  const toggle = useCallback(() => setSidebarOpen(prev => !prev), [])
  const close = useCallback(() => setSidebarOpen(false), [])

  if (loading) {
    return <LoadingScreen />
  }

  if (!user || isReceptionist || isMember) {
    return <LoadingScreen />
  }

  return (
    <SidebarContext.Provider value={{ open: sidebarOpen, toggle, close }}>
      <div className="min-h-screen bg-gray-50">
        <Sidebar open={sidebarOpen} onClose={close} />
        <main className="lg:mr-72 min-h-screen">
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  )
}
