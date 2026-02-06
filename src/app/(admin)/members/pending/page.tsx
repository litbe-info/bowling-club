'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, CheckCircle, XCircle, Clock, User } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/admin/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/lib/hooks/useToast'
import { formatPhone, formatDate } from '@/lib/utils/formatters'
import { ROUTES } from '@/constants/routes'
import type { Member } from '@/types'

export default function PendingMembersPage() {
  const toast = useToast()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchPending()
  }, [])

  const fetchPending = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('club_members')
      .select('*')
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false })

    if (data) setMembers(data)
    if (error) toast.error('שגיאה בטעינת נתונים')
    setLoading(false)
  }

  const handleApprove = useCallback(async (memberId: string) => {
    setProcessing(memberId)
    const supabase = createClient()

    const { error } = await supabase
      .from('club_members')
      .update({ approval_status: 'approved' })
      .eq('id', memberId)

    if (error) {
      toast.error('שגיאה באישור')
    } else {
      toast.success('החבר אושר בהצלחה!')
      setMembers(prev => prev.filter(m => m.id !== memberId))
    }
    setProcessing(null)
  }, [toast])

  const handleReject = useCallback(async (memberId: string) => {
    setProcessing(memberId)
    const supabase = createClient()

    const { error } = await supabase
      .from('club_members')
      .update({ approval_status: 'rejected' })
      .eq('id', memberId)

    if (error) {
      toast.error('שגיאה בדחייה')
    } else {
      toast.success('החבר נדחה')
      setMembers(prev => prev.filter(m => m.id !== memberId))
    }
    setProcessing(null)
  }, [toast])

  return (
    <div>
      <Header
        title="ממתינים לאישור"
        actions={
          <Link
            href={ROUTES.MEMBERS}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
          >
            <ArrowRight size={18} />
            חזרה לחברים
          </Link>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : members.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              אין חברים ממתינים
            </h3>
            <p className="text-gray-500">כל הבקשות טופלו</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              {members.length} בקשות ממתינות לאישור
            </p>

            <AnimatePresence mode="popLayout">
              {members.map((member) => (
                <motion.div
                  key={member.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Avatar
                      src={member.photo_url}
                      name={member.full_name}
                      size="lg"
                      className="shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {member.full_name}
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                        <span>{formatPhone(member.phone)}</span>
                        {member.email && <span>{member.email}</span>}
                        {member.birthday && (
                          <span>יום הולדת: {formatDate(member.birthday)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                        <Clock size={12} />
                        <span>נרשם ב-{formatDate(member.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(member.id)}
                        loading={processing === member.id}
                        disabled={processing !== null}
                        className="flex-1 sm:flex-none"
                      >
                        <CheckCircle size={16} />
                        אישור
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleReject(member.id)}
                        loading={processing === member.id}
                        disabled={processing !== null}
                        className="flex-1 sm:flex-none"
                      >
                        <XCircle size={16} />
                        דחייה
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
