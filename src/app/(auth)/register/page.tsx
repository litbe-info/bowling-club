'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { UserPlus, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { registerSchema, type RegisterFormData } from '@/lib/utils/validators'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Logo } from '@/components/shared/Logo'
import { ROUTES } from '@/constants/routes'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        setServerError(result.error || 'שגיאה בהרשמה')
        return
      }

      // Success - sign in and redirect to pending
      const supabase = createClient()
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/pending-approval'
      }, 1500)
    } catch {
      setServerError('שגיאה בהרשמה. נסה שוב.')
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md px-2"
      >
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">ההרשמה הצליחה!</h2>
          <p className="text-gray-600">מעביר אותך לדף ממתין לאישור...</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md px-2"
    >
      <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 space-y-5 sm:space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl sm:text-4xl">🎳</span>
          </div>
          <Logo size="lg" className="justify-center" />
          <p className="text-gray-600 text-sm sm:text-base">הרשמה למועדון הלקוחות</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="full_name"
            type="text"
            label="שם מלא"
            placeholder="ישראל ישראלי"
            error={errors.full_name?.message}
            {...register('full_name')}
          />

          <Input
            id="phone"
            type="tel"
            label="טלפון"
            placeholder="0501234567"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            id="email"
            type="email"
            label="אימייל"
            placeholder="your@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              label="סיסמה"
              placeholder="לפחות 6 תווים"
              error={errors.password?.message}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-[38px] text-gray-400 hover:text-gray-600 p-1"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <Input
            id="birthday"
            type="date"
            label="תאריך לידה (אופציונלי)"
            error={errors.birthday?.message}
            {...register('birthday')}
          />

          {serverError && (
            <p className="text-sm text-red-500 text-center">{serverError}</p>
          )}

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={isSubmitting}
          >
            <UserPlus size={20} />
            הירשם למועדון
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            כבר רשום?{' '}
            <Link
              href={ROUTES.LOGIN}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              התחבר כאן
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
