'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Save } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { useMemberProfile } from '@/lib/hooks/useMemberProfile'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { PhotoUpload } from '@/components/shared/PhotoUpload'
import { useToast } from '@/lib/hooks/useToast'
import { ROUTES } from '@/constants/routes'
import { phoneRegex } from '@/lib/utils/validators'

export default function ProfileEditPage() {
  const router = useRouter()
  const toast = useToast()
  const { memberId } = useAuth()
  const { member, loading: profileLoading } = useMemberProfile(memberId)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    birthday: '',
    photo_url: '',
    receive_mailings: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (member) {
      setFormData({
        full_name: member.full_name || '',
        phone: member.phone || '',
        email: member.email || '',
        birthday: member.birthday || '',
        photo_url: member.photo_url || '',
        receive_mailings: member.receive_mailings,
      })
    }
  }, [member])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.full_name || formData.full_name.trim().length < 3) {
      newErrors.full_name = 'שם מלא חייב להכיל לפחות 3 תווים'
    }
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'מספר טלפון לא תקין'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate() || !memberId) return

    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('club_members')
      .update({
        full_name: formData.full_name.trim(),
        phone: formData.phone,
        email: formData.email || null,
        birthday: formData.birthday || null,
        photo_url: formData.photo_url || null,
        receive_mailings: formData.receive_mailings,
      })
      .eq('id', memberId)

    if (error) {
      if (error.message.includes('phone_israeli_format')) {
        setErrors({ phone: 'מספר טלפון לא תקין' })
      } else if (error.message.includes('unique') || error.message.includes('duplicate')) {
        setErrors({ phone: 'מספר הטלפון כבר קיים במערכת' })
      } else {
        toast.error('שגיאה בשמירה')
      }
    } else {
      toast.success('הפרטים עודכנו בהצלחה!')
      router.push(ROUTES.PROFILE)
    }

    setSaving(false)
  }

  if (profileLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!member) {
    return (
      <div className="p-4 text-center py-16">
        <p className="text-gray-500">לא נמצא פרופיל</p>
      </div>
    )
  }

  return (
    <div className="p-4 pb-8 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.PROFILE}
          className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <ArrowRight size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">עריכת פרופיל</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Photo Upload */}
        <Card className="text-center">
          <PhotoUpload
            currentPhotoUrl={formData.photo_url}
            memberId={memberId || undefined}
            onPhotoUploaded={(url) => setFormData(prev => ({ ...prev, photo_url: url }))}
            size="lg"
          />
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                error={errors.full_name}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                error={errors.phone}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תאריך לידה</label>
              <Input
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
              />
            </div>

            {/* Receive mailings toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900 text-sm">קבלת דיוורים</p>
                <p className="text-xs text-gray-500 mt-0.5">קבל עדכונים והטבות מהמועדון</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, receive_mailings: !prev.receive_mailings }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.receive_mailings ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.receive_mailings ? '-translate-x-6' : '-translate-x-1'
                  }`}
                />
              </button>
            </div>

            <Button
              fullWidth
              size="lg"
              onClick={handleSave}
              loading={saving}
            >
              <Save size={20} />
              שמור שינויים
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
