'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  Award,
  Clock,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/admin/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/lib/hooks/useToast'
import { formatDate, formatDateTime, formatPhone, getHebrewMonthYear } from '@/lib/utils/formatters'
import { ROUTES } from '@/constants/routes'
import type { Member, QRCode } from '@/types'

export default function MemberDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const toast = useToast()
  const [member, setMember] = useState<Member | null>(null)
  const [history, setHistory] = useState<QRCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    Promise.all([
      supabase.from('club_members').select('*').eq('id', id).single(),
      supabase
        .from('monthly_qr_codes')
        .select('*')
        .eq('member_id', id)
        .eq('is_redeemed', true)
        .order('redeemed_at', { ascending: false }),
    ]).then(([memberRes, historyRes]) => {
      if (memberRes.data) setMember(memberRes.data)
      if (historyRes.data) setHistory(historyRes.data)
      setLoading(false)
    })
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('club_members').delete().eq('id', id)

    if (error) {
      toast.error('שגיאה במחיקת חבר')
      setDeleting(false)
      return
    }

    toast.success('החבר נמחק בהצלחה')
    router.push(ROUTES.MEMBERS)
  }

  if (loading) {
    return (
      <div>
        <Header title="פרטי חבר" />
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
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
          <Link href={ROUTES.MEMBERS}>
            <Button variant="outline" className="mt-4">
              חזרה לרשימה
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header
        title="פרטי חבר"
        actions={
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={ROUTES.MEMBERS}
              className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              <ArrowRight size={18} />
              <span className="hidden sm:inline">חזרה</span>
            </Link>
            <Link href={ROUTES.MEMBER_EDIT(id)}>
              <Button variant="outline" size="sm">
                <Edit size={16} />
                <span className="hidden sm:inline">ערוך</span>
              </Button>
            </Link>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">מחק</span>
            </Button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {/* Profile Card */}
          <Card className="text-center">
            <Avatar
              src={member.photo_url}
              name={member.full_name}
              size="xl"
              className="mx-auto mb-4"
            />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {member.full_name}
            </h2>
            <div className="flex items-center gap-2 justify-center flex-wrap">
              <Badge variant={member.is_active ? 'success' : 'default'}>
                {member.is_active ? 'פעיל' : 'לא פעיל'}
              </Badge>
              {member.approval_status && member.approval_status !== 'approved' && (
                <Badge variant={member.approval_status === 'pending' ? 'warning' : 'default'}>
                  {member.approval_status === 'pending' ? 'ממתין לאישור' : 'נדחה'}
                </Badge>
              )}
            </div>

            <div className="mt-4 sm:mt-6 space-y-3 text-right">
              <div className="flex items-center gap-3 text-gray-600">
                <Phone size={18} className="shrink-0" />
                <span className="text-sm sm:text-base">{formatPhone(member.phone)}</span>
              </div>
              {member.email && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail size={18} className="shrink-0" />
                  <span className="text-sm sm:text-base truncate">{member.email}</span>
                </div>
              )}
              {member.birthday && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar size={18} className="shrink-0" />
                  <span className="text-sm sm:text-base">יום הולדת: {formatDate(member.birthday)}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-600">
                <Clock size={18} className="shrink-0" />
                <span className="text-sm sm:text-base">הצטרף: {formatDate(member.joined_at)}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Award size={18} className="shrink-0" />
                <span className="text-sm sm:text-base">סך מימושים: {member.total_redemptions}</span>
              </div>
            </div>

            {member.notes && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-xl text-right">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <FileText size={16} />
                  <span className="text-sm font-medium">הערות</span>
                </div>
                <p className="text-gray-700 text-sm">{member.notes}</p>
              </div>
            )}
          </Card>

          {/* History */}
          <div className="lg:col-span-2">
            <Card>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                היסטוריית מימושים ({history.length})
              </h3>

              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-8">אין מימושים עדיין</p>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {history.map((qr) => (
                    <div
                      key={qr.id}
                      className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm sm:text-base">
                          {getHebrewMonthYear(qr.month, qr.year)}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          נסרק ע&quot;י: {qr.redeemed_by_name}
                        </p>
                      </div>
                      <div className="text-left shrink-0">
                        <Badge variant="success">מומש</Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {qr.redeemed_at ? formatDateTime(qr.redeemed_at) : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="מחיקת חבר"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            האם אתה בטוח שברצונך למחוק את <strong>{member.full_name}</strong>?
            פעולה זו אינה ניתנת לביטול.
          </p>
          <div className="flex gap-3">
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
              fullWidth
            >
              מחק
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              fullWidth
            >
              ביטול
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
