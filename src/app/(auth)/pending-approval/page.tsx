'use client'

import { motion } from 'framer-motion'
import { Clock, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/shared/Logo'

export default function PendingApprovalPage() {
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md px-2"
    >
      <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 space-y-5 sm:space-y-6 text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
          <Clock size={40} className="text-yellow-600" />
        </div>

        <div className="space-y-2">
          <Logo size="lg" className="justify-center" />
          <h1 className="text-xl font-bold text-gray-900">ממתין לאישור</h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            ההרשמה שלך התקבלה בהצלחה!
            <br />
            מנהל המערכת יאשר את החשבון שלך בהקדם.
            <br />
            תקבל הודעה כשהחשבון יאושר.
          </p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="text-gray-500"
          >
            <LogOut size={18} />
            התנתק
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
