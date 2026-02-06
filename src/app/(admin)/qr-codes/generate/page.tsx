'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, QrCode, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/admin/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { useQRCodes } from '@/lib/hooks/useQRCodes'
import { useToast } from '@/lib/hooks/useToast'
import { HEBREW_MONTHS } from '@/constants/config'
import { ROUTES } from '@/constants/routes'
import { getHebrewMonthYear } from '@/lib/utils/formatters'
import type { GenerateResult } from '@/types'

export default function GenerateQRPage() {
  const router = useRouter()
  const { generateMonthlyQRCodes } = useQRCodes()
  const toast = useToast()

  const now = new Date()
  const nextMonth = now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2
  const nextYear = now.getMonth() + 2 > 12 ? now.getFullYear() + 1 : now.getFullYear()

  const [month, setMonth] = useState(nextMonth)
  const [year, setYear] = useState(nextYear)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<GenerateResult | null>(null)

  const monthOptions = HEBREW_MONTHS.map((m, i) => ({
    value: i + 1,
    label: m,
  }))

  const yearOptions = [
    { value: 2025, label: '2025' },
    { value: 2026, label: '2026' },
    { value: 2027, label: '2027' },
  ]

  const handleGenerate = async () => {
    setGenerating(true)
    const res = await generateMonthlyQRCodes(month, year)
    setResult(res)
    setGenerating(false)

    if (res.success) {
      toast.success(`נוצרו ${res.codes_generated} ברקודים בהצלחה!`)
    } else {
      toast.error(res.error || 'שגיאה ביצירת ברקודים')
    }
  }

  return (
    <div>
      <Header
        title="יצירת ברקודים חודשיים"
        actions={
          <Link
            href={ROUTES.QR_CODES}
            className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
          >
            <ArrowRight size={18} />
            <span className="hidden sm:inline">חזרה</span>
          </Link>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-lg">
        {!result ? (
          <Card>
            <div className="text-center mb-5 sm:mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <QrCode size={28} className="text-purple-600 sm:hidden" />
                <QrCode size={32} className="text-purple-600 hidden sm:block" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">יצירת ברקודים חודשיים</h2>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                בחר חודש ושנה ליצירת ברקודים לכל חברי המועדון הפעילים
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-6">
              <Select
                label="חודש"
                options={monthOptions}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              />
              <Select
                label="שנה"
                options={yearOptions}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
            </div>

            <p className="text-center text-gray-600 mb-5 sm:mb-6 text-sm sm:text-base">
              יצירת ברקודים לחודש: <strong>{getHebrewMonthYear(month, year)}</strong>
            </p>

            <Button
              onClick={handleGenerate}
              loading={generating}
              fullWidth
              size="lg"
            >
              <QrCode size={20} />
              צור ברקודים
            </Button>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="text-center">
              {result.success ? (
                <>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <CheckCircle size={32} className="text-green-600 sm:hidden" />
                    <CheckCircle size={40} className="text-green-600 hidden sm:block" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    ברקודים נוצרו בהצלחה!
                  </h2>
                  <p className="text-gray-600 mb-5 sm:mb-6 text-sm sm:text-base">
                    נוצרו {result.codes_generated} ברקודים ל{getHebrewMonthYear(result.month, result.year)}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <AlertCircle size={32} className="text-red-600 sm:hidden" />
                    <AlertCircle size={40} className="text-red-600 hidden sm:block" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    שגיאה ביצירת ברקודים
                  </h2>
                  <p className="text-gray-600 mb-5 sm:mb-6 text-sm sm:text-base">{result.error}</p>
                </>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => router.push(ROUTES.QR_CODES)}
                  fullWidth
                >
                  עבור לניהול ברקודים
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setResult(null)}
                  fullWidth
                >
                  צור ברקודים נוספים
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
