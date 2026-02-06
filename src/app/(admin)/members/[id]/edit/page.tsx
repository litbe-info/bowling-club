'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/admin/Header'
import { Card } from '@/components/ui/Card'
import { MemberForm } from '@/components/admin/MemberForm'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/lib/hooks/useToast'
import { ROUTES } from '@/constants/routes'
import type { Member } from '@/types'
import type { MemberFormData } from '@/lib/utils/validators'

export default function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const toast = useToast()
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('club_members')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }: { data: Member | null }) => {
        if (data) setMember(data)
        setLoading(false)
      })
  }, [id])

  const handleSubmit = async (data: MemberFormData) => {
    setSaving(true)

    const supabase = createClient()
    const { error } = await supabase
      .from('club_members')
      .update({
        full_name: data.full_name,
        phone: data.phone,
        email: data.email || null,
        birthday: data.birthday || null,
        notes: data.notes || null,
        is_active: data.is_active,
      })
      .eq('id', id)

    setSaving(false)

    if (error) {
      if (error.code === '23505') {
        toast.error('מספר טלפון כבר קיים במערכת')
      } else {
        toast.error('שגיאה בעדכון חבר')
      }
      return
    }

    toast.success('פרטי החבר עודכנו בהצלחה!')
    router.push(ROUTES.MEMBER_DETAILS(id))
  }

  if (loading) {
    return (
      <div>
        <Header title="עריכת חבר" />
        <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div>
        <Header title="חבר לא נמצא" />
        <div className="p-4 sm:p-8 text-center">
          <p className="text-gray-500">החבר לא נמצא במערכת</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header
        title={`עריכת ${member.full_name}`}
        actions={
          <Link
            href={ROUTES.MEMBER_DETAILS(id)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
          >
            <ArrowRight size={18} />
            <span className="hidden sm:inline">חזרה</span>
          </Link>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
        <Card>
          <MemberForm
            member={member}
            onSubmit={handleSubmit}
            loading={saving}
          />
        </Card>
      </div>
    </div>
  )
}
