'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { QrCode, CheckCircle, Clock, Plus } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/admin/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SearchBar } from '@/components/ui/SearchBar'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatsCard } from '@/components/admin/StatsCard'
import { Select } from '@/components/ui/Select'
import { useQRCodes } from '@/lib/hooks/useQRCodes'
import { formatDateTime, formatPhone, getHebrewMonthYear } from '@/lib/utils/formatters'
import { HEBREW_MONTHS } from '@/constants/config'
import { ROUTES } from '@/constants/routes'

export default function QRCodesPage() {
  const { qrCodes, loading, fetchQRCodes, getStats } = useQRCodes()
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState<{ total: number; redeemed: number; available: number; rate: number } | null>(null)

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  const loadData = useCallback(async () => {
    await fetchQRCodes(selectedMonth, selectedYear)
    const s = await getStats(selectedMonth, selectedYear)
    setStats(s)
  }, [fetchQRCodes, getStats, selectedMonth, selectedYear])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredCodes = search
    ? qrCodes.filter(
        (qr) =>
          qr.member?.full_name?.includes(search) ||
          qr.member?.phone?.includes(search)
      )
    : qrCodes

  const monthOptions = HEBREW_MONTHS.map((m, i) => ({
    value: i + 1,
    label: m,
  }))

  const yearOptions = [
    { value: 2025, label: '2025' },
    { value: 2026, label: '2026' },
    { value: 2027, label: '2027' },
  ]

  return (
    <div>
      <Header
        title="ברקודים חודשיים"
        actions={
          <Link href={ROUTES.QR_GENERATE}>
            <Button size="sm" className="sm:hidden">
              <Plus size={18} />
            </Button>
            <Button className="hidden sm:flex">
              <Plus size={20} />
              צור ברקודים
            </Button>
          </Link>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Month/Year selector */}
        <Card>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4">
            <div className="grid grid-cols-2 gap-3 flex-1">
              <Select
                label="חודש"
                options={monthOptions}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              />
              <Select
                label="שנה"
                options={yearOptions}
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              />
            </div>
            <Button onClick={loadData} variant="outline" fullWidth className="sm:w-auto sm:!w-fit">
              הצג ברקודים
            </Button>
          </div>
        </Card>

        {/* Stats */}
        {stats && stats.total > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <StatsCard
              title="נוצרו"
              value={stats.total}
              icon={QrCode}
              iconColor="text-purple-600 bg-purple-100"
            />
            <StatsCard
              title="מומשו"
              value={`${stats.redeemed}`}
              icon={CheckCircle}
              iconColor="text-green-600 bg-green-100"
            />
            <StatsCard
              title="זמינים"
              value={stats.available}
              icon={Clock}
              iconColor="text-yellow-600 bg-yellow-100"
            />
          </div>
        )}

        {/* Search and list */}
        <Card>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              {getHebrewMonthYear(selectedMonth, selectedYear)} ({filteredCodes.length})
            </h3>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="חיפוש חבר..."
              className="w-full sm:w-64"
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filteredCodes.length === 0 ? (
            <EmptyState
              icon={QrCode}
              title="אין ברקודים"
              description={`לא נוצרו ברקודים ל${getHebrewMonthYear(selectedMonth, selectedYear)}`}
              action={
                <Link href={ROUTES.QR_GENERATE}>
                  <Button>צור ברקודים</Button>
                </Link>
              }
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              {filteredCodes.map((qr) => (
                <div
                  key={qr.id}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl gap-2"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <QrCode size={18} className="text-purple-600 shrink-0 sm:hidden" />
                    <QrCode size={20} className="text-purple-600 shrink-0 hidden sm:block" />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {qr.member?.full_name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {formatPhone(qr.member?.phone || '')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {qr.is_redeemed ? (
                      <>
                        <Badge variant="success">מומש</Badge>
                        <span className="text-xs text-gray-500 hidden sm:inline">
                          {qr.redeemed_at ? formatDateTime(qr.redeemed_at) : ''}
                        </span>
                      </>
                    ) : (
                      <Badge variant="warning">זמין</Badge>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </Card>
      </div>
    </div>
  )
}
