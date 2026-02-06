'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { memberSchema, type MemberFormData } from '@/lib/utils/validators'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Member } from '@/types'

interface MemberFormProps {
  member?: Member
  onSubmit: (data: MemberFormData) => Promise<void>
  loading?: boolean
}

export function MemberForm({ member, onSubmit, loading }: MemberFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      full_name: member?.full_name || '',
      phone: member?.phone || '',
      email: member?.email || '',
      birthday: member?.birthday || '',
      notes: member?.notes || '',
      is_active: member?.is_active ?? true,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
      <Input
        id="full_name"
        label="שם מלא"
        placeholder="שם פרטי ושם משפחה"
        required
        error={errors.full_name?.message}
        {...register('full_name')}
      />

      <Input
        id="phone"
        label="טלפון"
        placeholder="05XXXXXXXX"
        required
        hint="פורמט: 05XXXXXXXX"
        error={errors.phone?.message}
        {...register('phone')}
      />

      <Input
        id="email"
        label="אימייל"
        type="email"
        placeholder="email@example.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        id="birthday"
        label="תאריך לידה"
        type="date"
        error={errors.birthday?.message}
        {...register('birthday')}
      />

      <div className="space-y-1.5">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          הערות
        </label>
        <textarea
          id="notes"
          rows={3}
          placeholder="הערות פנימיות..."
          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
          {...register('notes')}
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_active"
          className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          {...register('is_active')}
        />
        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
          חבר פעיל
        </label>
      </div>

      <div className="pt-3 sm:pt-4">
        <Button type="submit" loading={loading} size="lg" fullWidth className="sm:w-auto sm:!w-fit">
          {member ? 'עדכן חבר' : 'הוסף חבר'}
        </Button>
      </div>
    </form>
  )
}
