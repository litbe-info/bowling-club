'use client'

import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Phone, Mail, Calendar, Award } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDate, formatPhone, formatDateTime } from '@/lib/utils/formatters'
import type { RedeemResult } from '@/types'

interface ScanResultProps {
  result: RedeemResult
  onConfirmRedeem: () => void
  onScanAgain: () => void
  confirming?: boolean
  confirmed?: boolean
}

export function ScanResult({
  result,
  onConfirmRedeem,
  onScanAgain,
  confirming,
  confirmed,
}: ScanResultProps) {
  // Confirmed/Success state
  if (confirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={48} className="text-green-600" />
        </motion.div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">מומש בהצלחה!</h2>
        <p className="text-gray-600 mb-2">נהנים מהמשחק!</p>

        {result.member && (
          <>
            <p className="text-lg font-semibold text-gray-900">{result.member.name}</p>
            <p className="text-gray-500 mb-8">
              מימוש #{result.member.total_redemptions}
            </p>
          </>
        )}

        <Button onClick={onScanAgain} fullWidth size="lg">
          סרוק ברקוד נוסף
        </Button>
      </motion.div>
    )
  }

  // Error: Already redeemed
  if (!result.success && result.error_code === 'ALREADY_REDEEMED') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8 px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
          className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <XCircle size={40} className="text-red-600" />
        </motion.div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">ברקוד כבר מומש!</h2>

        {result.redeemed_at && (
          <p className="text-gray-600 mb-1">
            מומש ב: {formatDateTime(result.redeemed_at)}
          </p>
        )}
        {result.redeemed_by && (
          <p className="text-gray-600 mb-6">על ידי: {result.redeemed_by}</p>
        )}

        <Button onClick={onScanAgain} fullWidth size="lg" variant="outline">
          חזור לסריקה
        </Button>
      </motion.div>
    )
  }

  // Error: Not found
  if (!result.success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8 px-4"
      >
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle size={40} className="text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{result.message}</h2>
        <Button onClick={onScanAgain} fullWidth size="lg" variant="outline" className="mt-6">
          חזור לסריקה
        </Button>
      </motion.div>
    )
  }

  // Success: Show member details and confirm button
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-6 px-4"
    >
      <div className="text-center mb-6">
        <Badge variant="success" className="text-base px-4 py-2">
          <CheckCircle size={18} />
          ברקוד זוהה!
        </Badge>
      </div>

      {result.member && (
        <div className="text-center space-y-4 mb-8">
          <Avatar
            src={result.member.photo_url}
            name={result.member.name}
            size="xl"
            className="mx-auto"
          />
          <h2 className="text-2xl font-bold text-gray-900">{result.member.name}</h2>

          <div className="space-y-2 text-right bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center gap-3 text-gray-600">
              <Phone size={18} />
              <span>{formatPhone(result.member.phone)}</span>
            </div>
            {result.member.email && (
              <div className="flex items-center gap-3 text-gray-600">
                <Mail size={18} />
                <span>{result.member.email}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar size={18} />
              <span>הצטרף: {formatDate(result.member.joined_at)}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Award size={18} />
              <span>מימושים עד כה: {result.member.total_redemptions}</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Button
          onClick={onConfirmRedeem}
          loading={confirming}
          fullWidth
          size="lg"
        >
          <CheckCircle size={20} />
          אשר מימוש
        </Button>
        <Button onClick={onScanAgain} variant="ghost" fullWidth>
          ביטול
        </Button>
      </div>
    </motion.div>
  )
}
