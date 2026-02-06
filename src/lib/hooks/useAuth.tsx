'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserRole, ApprovalStatus } from '@/types'

interface AuthUser {
  id: string
  email: string | null
  full_name: string | null
}

interface AuthState {
  user: AuthUser | null
  role: UserRole | null
  loading: boolean
  displayName: string | null
  memberId: string | null
  approvalStatus: ApprovalStatus | null
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>
  isAdmin: boolean
  isReceptionist: boolean
  isMember: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
    displayName: null,
    memberId: null,
    approvalStatus: null,
  })

  useEffect(() => {
    let cancelled = false

    const fetchAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        const data = await res.json()

        if (cancelled) return

        if (data.user) {
          setAuthState({
            user: data.user,
            role: data.role as UserRole,
            loading: false,
            displayName: data.user.full_name || data.user.email || null,
            memberId: data.memberId || null,
            approvalStatus: data.approvalStatus || null,
          })
        } else {
          setAuthState({ user: null, role: null, loading: false, displayName: null, memberId: null, approvalStatus: null })
        }
      } catch (err) {
        console.error('[Auth] Failed to fetch auth state:', err)
        if (!cancelled) {
          setAuthState({ user: null, role: null, loading: false, displayName: null, memberId: null, approvalStatus: null })
        }
      }
    }

    fetchAuth()

    return () => {
      cancelled = true
    }
  }, [])

  const signOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }, [])

  const value: AuthContextType = {
    ...authState,
    signOut,
    isAdmin: authState.role === 'admin',
    isReceptionist: authState.role === 'receptionist',
    isMember: authState.role === 'member',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
