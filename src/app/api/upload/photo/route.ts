import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MEMBER_PHOTOS_BUCKET, MAX_PHOTO_SIZE, ALLOWED_PHOTO_TYPES } from '@/constants/config'

export async function POST(request: Request) {
  try {
    // Verify auth
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const memberId = formData.get('memberId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'לא נבחר קובץ' }, { status: 400 })
    }

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'סוג קובץ לא נתמך' }, { status: 400 })
    }

    if (file.size > MAX_PHOTO_SIZE) {
      return NextResponse.json({ error: 'הקובץ גדול מדי (מקסימום 5MB)' }, { status: 400 })
    }

    // Use admin client for storage operations
    const adminSupabase = createAdminClient()

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg'
    const targetId = memberId || user.id
    const fileName = `${targetId}/${Date.now()}.${ext}`

    // Upload to storage
    const arrayBuffer = await file.arrayBuffer()
    const { error: uploadError } = await adminSupabase.storage
      .from(MEMBER_PHOTOS_BUCKET)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'שגיאה בהעלאת התמונה' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = adminSupabase.storage
      .from(MEMBER_PHOTOS_BUCKET)
      .getPublicUrl(fileName)

    const photoUrl = urlData.publicUrl

    // Update member record if memberId provided
    if (memberId) {
      const { error: updateError } = await adminSupabase
        .from('club_members')
        .update({ photo_url: photoUrl })
        .eq('id', memberId)

      if (updateError) {
        console.error('Update error:', updateError)
      }
    }

    return NextResponse.json({ url: photoUrl })
  } catch (err) {
    console.error('Photo upload error:', err)
    return NextResponse.json({ error: 'שגיאה בהעלאת התמונה' }, { status: 500 })
  }
}
