import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { qr_code } = await req.json()

    if (!qr_code) {
      return NextResponse.json(
        { valid: false, message: 'חסר קוד QR' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: qrData, error } = await supabase
      .from('monthly_qr_codes')
      .select(`
        *,
        member:club_members(id, full_name, phone, email, photo_url, total_redemptions, joined_at)
      `)
      .eq('qr_code', qr_code)
      .single()

    if (error || !qrData) {
      return NextResponse.json({
        valid: false,
        error_code: 'QR_NOT_FOUND',
        message: 'ברקוד לא נמצא במערכת',
      })
    }

    if (qrData.is_redeemed) {
      return NextResponse.json({
        valid: false,
        error_code: 'ALREADY_REDEEMED',
        message: 'ברקוד כבר מומש',
        redeemed_at: qrData.redeemed_at,
        redeemed_by: qrData.redeemed_by_name,
        member: qrData.member,
      })
    }

    return NextResponse.json({
      valid: true,
      member: qrData.member,
      qr_id: qrData.id,
    })
  } catch {
    return NextResponse.json(
      { valid: false, message: 'שגיאת שרת' },
      { status: 500 }
    )
  }
}
