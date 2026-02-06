'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Member, QRCode } from '@/types'

interface MemberProfile {
  member: Member | null
  currentQR: QRCode | null
  history: QRCode[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useMemberProfile(memberId: string | null): MemberProfile {
  const [member, setMember] = useState<Member | null>(null)
  const [currentQR, setCurrentQR] = useState<QRCode | null>(null)
  const [history, setHistory] = useState<QRCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!memberId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Fetch member data
      const { data: memberData, error: memberError } = await supabase
        .from('club_members')
        .select('*')
        .eq('id', memberId)
        .single()

      if (memberError) {
        setError('שגיאה בטעינת הפרופיל')
        setLoading(false)
        return
      }

      setMember(memberData)

      // Current month QR code
      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()

      const { data: qrData } = await supabase
        .from('monthly_qr_codes')
        .select('*')
        .eq('member_id', memberId)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .single()

      setCurrentQR(qrData || null)

      // Redemption history
      const { data: historyData } = await supabase
        .from('monthly_qr_codes')
        .select('*')
        .eq('member_id', memberId)
        .eq('is_redeemed', true)
        .order('redeemed_at', { ascending: false })
        .limit(12)

      setHistory(historyData || [])
    } catch {
      setError('שגיאה בטעינת נתונים')
    } finally {
      setLoading(false)
    }
  }, [memberId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { member, currentQR, history, loading, error, refetch: fetchProfile }
}
