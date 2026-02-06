'use client'

import { motion } from 'framer-motion'
import { Edit, QrCode, Award, Calendar, Phone, Mail, Clock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { useMemberProfile } from '@/lib/hooks/useMemberProfile'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatPhone, formatDate, getHebrewMonthYear } from '@/lib/utils/formatters'
import { ROUTES } from '@/constants/routes'

export default function ProfilePage() {
  const { memberId } = useAuth()
  const { member, currentQR, history, loading } = useMemberProfile(memberId)

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-40" />
        <Skeleton className="h-32" />
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

  const now = new Date()
  const currentMonthName = getHebrewMonthYear(now.getMonth() + 1, now.getFullYear())

  return (
    <div className="p-4 pb-8 space-y-4">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="text-center relative">
          <Link
            href={ROUTES.PROFILE_EDIT}
            className="absolute top-4 left-4"
          >
            <Button variant="ghost" size="sm">
              <Edit size={16} />
              עריכה
            </Button>
          </Link>

          <Avatar
            src={member.photo_url}
            name={member.full_name}
            size="xl"
            className="mx-auto mb-3"
          />

          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {member.full_name}
          </h1>

          <Badge variant="success">חבר מועדון</Badge>

          <div className="mt-5 space-y-3 text-right">
            <div className="flex items-center gap-3 text-gray-600">
              <Phone size={18} className="shrink-0" />
              <span className="text-sm">{formatPhone(member.phone)}</span>
            </div>
            {member.email && (
              <div className="flex items-center gap-3 text-gray-600">
                <Mail size={18} className="shrink-0" />
                <span className="text-sm truncate">{member.email}</span>
              </div>
            )}
            {member.birthday && (
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar size={18} className="shrink-0" />
                <span className="text-sm">יום הולדת: {formatDate(member.birthday)}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-gray-600">
              <Award size={18} className="shrink-0" />
              <span className="text-sm">סך מימושים: {member.total_redemptions}</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Current Month QR */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <QrCode size={20} className="text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              ברקוד חודשי - {currentMonthName}
            </h2>
          </div>

          {currentQR ? (
            <div className="text-center">
              {currentQR.is_redeemed ? (
                <div className="bg-green-50 rounded-2xl p-6 space-y-2">
                  <CheckCircle size={48} className="text-green-500 mx-auto" />
                  <p className="font-medium text-green-700">מומש!</p>
                  <p className="text-sm text-green-600">
                    {currentQR.redeemed_at && formatDate(currentQR.redeemed_at)}
                  </p>
                </div>
              ) : (
                <div className="bg-purple-50 rounded-2xl p-6 space-y-3">
                  <div className="bg-white rounded-xl p-4 shadow-sm inline-block">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentQR.qr_code)}`}
                      alt="QR Code"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  <p className="text-sm text-purple-600 font-medium">
                    הצג ברקוד זה בקופה
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <QrCode size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                אין ברקוד זמין לחודש זה
              </p>
              <p className="text-gray-400 text-xs mt-1">
                הברקוד ייוצר בקרוב
              </p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Redemption History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              היסטוריית מימושים
            </h2>
          </div>

          {history.length === 0 ? (
            <p className="text-center text-gray-500 py-6 text-sm">
              אין מימושים עדיין
            </p>
          ) : (
            <div className="space-y-2">
              {history.map((qr) => (
                <div
                  key={qr.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {getHebrewMonthYear(qr.month, qr.year)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {qr.redeemed_at && formatDate(qr.redeemed_at)}
                    </p>
                  </div>
                  <Badge variant="success" className="text-xs">
                    <CheckCircle size={12} />
                    מומש
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
