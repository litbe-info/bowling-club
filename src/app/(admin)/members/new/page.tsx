'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/admin/Header'
import { Card } from '@/components/ui/Card'
import { MemberForm } from '@/components/admin/MemberForm'
import { useMembers } from '@/lib/hooks/useMembers'
import { useToast } from '@/lib/hooks/useToast'
import { ROUTES } from '@/constants/routes'
import type { MemberFormData } from '@/lib/utils/validators'

export default function NewMemberPage() {
  const router = useRouter()
  const { addMember } = useMembers()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: MemberFormData) => {
    setLoading(true)

    const { error } = await addMember({
      full_name: data.full_name,
      phone: data.phone,
      email: data.email || null,
      birthday: data.birthday || null,
      notes: data.notes || null,
      is_active: data.is_active,
      photo_url: null,
    })

    setLoading(false)

    if (error) {
      if (error.code === '23505') {
        toast.error('מספר טלפון כבר קיים במערכת')
      } else {
        toast.error('שגיאה בהוספת חבר')
      }
      return
    }

    toast.success('חבר חדש נוסף בהצלחה!')
    router.push(ROUTES.MEMBERS)
  }

  return (
    <div>
      <Header
        title="הוספת חבר חדש"
        actions={
          <Link
            href={ROUTES.MEMBERS}
            className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
          >
            <ArrowRight size={18} />
            <span className="hidden sm:inline">חזרה לרשימה</span>
          </Link>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
        <Card>
          <MemberForm onSubmit={handleSubmit} loading={loading} />
        </Card>
      </div>
    </div>
  )
}
