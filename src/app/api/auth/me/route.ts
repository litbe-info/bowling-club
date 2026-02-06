import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ user: null, role: null })
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const role = roleData?.role || null

    // If member, also fetch member data
    let memberId = null
    let approvalStatus = null
    if (role === 'member') {
      const { data: memberData } = await supabase
        .from('club_members')
        .select('id, approval_status')
        .eq('user_id', user.id)
        .single()

      if (memberData) {
        memberId = memberData.id
        approvalStatus = memberData.approval_status
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || null,
      },
      role,
      memberId,
      approvalStatus,
    })
  } catch {
    return NextResponse.json({ user: null, role: null })
  }
}
