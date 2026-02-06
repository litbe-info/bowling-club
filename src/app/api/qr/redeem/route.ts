import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { qr_code, redeemed_by_name } = await req.json()

    if (!qr_code || !redeemed_by_name) {
      return NextResponse.json(
        { success: false, message: 'חסרים פרמטרים' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase.rpc('redeem_qr_code', {
      p_qr_code: qr_code,
      p_redeemed_by_name: redeemed_by_name,
    })

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { success: false, message: 'שגיאת שרת' },
      { status: 500 }
    )
  }
}
