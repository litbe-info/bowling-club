import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { registerSchema } from '@/lib/utils/validators'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'נתונים לא תקינים' },
        { status: 400 }
      )
    }

    const { full_name, phone, email, password, birthday } = parsed.data
    const supabase = createAdminClient()

    // Check if phone already exists
    const { data: existingMember } = await supabase
      .from('club_members')
      .select('id')
      .eq('phone', phone)
      .single()

    if (existingMember) {
      return NextResponse.json(
        { error: 'מספר הטלפון הזה כבר רשום במערכת' },
        { status: 400 }
      )
    }

    // Check if email already exists in auth
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const emailExists = existingUsers?.users?.some(u => u.email === email)
    if (emailExists) {
      return NextResponse.json(
        { error: 'כתובת האימייל הזו כבר רשומה במערכת' },
        { status: 400 }
      )
    }

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    })

    if (authError || !authData.user) {
      console.error('Auth create error:', authError)
      return NextResponse.json(
        { error: 'שגיאה ביצירת חשבון. נסה שוב.' },
        { status: 500 }
      )
    }

    const userId = authData.user.id

    // 2. Create club_members record
    const { error: memberError } = await supabase
      .from('club_members')
      .insert({
        full_name,
        phone,
        email,
        birthday: birthday || null,
        user_id: userId,
        approval_status: 'pending',
        is_active: true,
        receive_mailings: true,
      })

    if (memberError) {
      // Rollback: delete the auth user
      await supabase.auth.admin.deleteUser(userId)
      console.error('Member insert error:', memberError)
      return NextResponse.json(
        { error: 'שגיאה ביצירת פרופיל. נסה שוב.' },
        { status: 500 }
      )
    }

    // 3. Create user_roles record
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'member',
      })

    if (roleError) {
      console.error('Role insert error:', roleError)
      // Non-critical - continue anyway
    }

    return NextResponse.json({
      success: true,
      message: 'ההרשמה בוצעה בהצלחה! ממתין לאישור מנהל.',
    })
  } catch (err) {
    console.error('Registration error:', err)
    return NextResponse.json(
      { error: 'שגיאה בהרשמה. נסה שוב.' },
      { status: 500 }
    )
  }
}
