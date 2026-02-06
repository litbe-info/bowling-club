'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { LogIn, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginFormData } from '@/lib/utils/validators'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Logo } from '@/components/shared/Logo'
import { ROUTES } from '@/constants/routes'

export default function LoginPage() {
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)

    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setServerError('אימייל או סיסמה שגויים')
      return
    }

    if (signInData.user) {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', signInData.user.id)
        .single()

      const role = roleData?.role

      if (role === 'member') {
        // Check approval status
        const { data: memberData } = await supabase
          .from('club_members')
          .select('approval_status')
          .eq('user_id', signInData.user.id)
          .single()

        if (memberData?.approval_status === 'pending') {
          window.location.href = '/pending-approval'
        } else {
          window.location.href = '/profile'
        }
      } else if (role === 'receptionist') {
        window.location.href = '/scan'
      } else {
        window.location.href = '/dashboard'
      }
    }
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
          <p className="text-gray-600 text-sm sm:text-base">מערכת ניהול מועדון לקוחות</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              placeholder="הזן סיסמה"
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

          {serverError && (
            <p className="text-sm text-red-500 text-center">{serverError}</p>
          )}

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={isSubmitting}
          >
            <LogIn size={20} />
            התחבר
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            עדיין לא חבר מועדון?{' '}
            <Link
              href={ROUTES.REGISTER}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              הירשם כאן
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
