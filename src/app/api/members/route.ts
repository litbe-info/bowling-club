import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get('search')
    const filter = searchParams.get('filter')

    let query = supabase
      .from('club_members')
      .select('*')
      .order('joined_at', { ascending: false })

    if (filter === 'active') {
      query = query.eq('is_active', true)
    } else if (filter === 'inactive') {
      query = query.eq('is_active', false)
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await req.json()

    const { data, error } = await supabase
      .from('club_members')
      .insert([body])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
