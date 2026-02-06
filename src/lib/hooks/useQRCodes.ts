'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { QRCodeWithMember, RedeemResult, GenerateResult } from '@/types'

export function useQRCodes() {
  const [qrCodes, setQRCodes] = useState<QRCodeWithMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQRCodes = useCallback(async (month: number, year: number) => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('monthly_qr_codes')
        .select(`
          *,
          member:club_members(id, full_name, phone, photo_url)
        `)
        .eq('month', month)
        .eq('year', year)
        .order('created_at', { ascending: false })

      if (error) throw error
      setQRCodes(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינת ברקודים')
    } finally {
      setLoading(false)
    }
  }, [])

  const generateMonthlyQRCodes = async (month: number, year: number): Promise<GenerateResult> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .rpc('generate_monthly_qr_codes', {
        p_month: month,
        p_year: year,
      })

    if (error) {
      return {
        success: false,
        total_members: 0,
        codes_generated: 0,
        month,
        year,
        error: error.message,
      }
    }

    return data as GenerateResult
  }

  const redeemQRCode = async (qrCode: string, redeemedByName: string): Promise<RedeemResult> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .rpc('redeem_qr_code', {
        p_qr_code: qrCode,
        p_redeemed_by_name: redeemedByName,
      })

    if (error) {
      return {
        success: false,
        message: error.message,
        error_code: 'QR_NOT_FOUND',
      }
    }

    return data as RedeemResult
  }

  const getStats = useCallback(async (month: number, year: number) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('monthly_qr_codes')
      .select('is_redeemed')
      .eq('month', month)
      .eq('year', year)

    if (error) return null

    const total = data.length
    const redeemed = data.filter((qr: { is_redeemed: boolean }) => qr.is_redeemed).length

    return {
      total,
      redeemed,
      available: total - redeemed,
      rate: total > 0 ? Math.round((redeemed / total) * 100) : 0,
    }
  }, [])

  return {
    qrCodes,
    loading,
    error,
    fetchQRCodes,
    generateMonthlyQRCodes,
    redeemQRCode,
    getStats,
  }
}
