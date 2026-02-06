'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, UserCheck, CheckCircle, QrCode } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/admin/Header'
import { StatsCard } from '@/components/admin/StatsCard'
import { Card, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatRelativeDate } from '@/lib/utils/formatters'
import { RedemptionChart } from '@/components/admin/Charts/RedemptionChart'

interface DashboardStats {
  totalMembers: number
  activeMembers: number
  monthlyRedemptions: number
  totalRedemptions: number
}

interface RecentRedemption {
  id: string
  redeemed_at: string
  redeemed_by_name: string
  member: {
    full_name: string
    phone: string
  }
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentRedemptions, setRecentRedemptions] = useState<RecentRedemption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    Promise.all([
      supabase.from('club_members').select('id', { count: 'exact', head: true }),
      supabase.from('club_members').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('monthly_qr_codes').select('id', { count: 'exact', head: true })
        .eq('month', currentMonth).eq('year', currentYear).eq('is_redeemed', true),
      supabase.from('monthly_qr_codes').select('id', { count: 'exact', head: true }).eq('is_redeemed', true),
      supabase.from('monthly_qr_codes')
        .select('id, redeemed_at, redeemed_by_name, member:club_members(full_name, phone)')
        .eq('is_redeemed', true)
        .order('redeemed_at', { ascending: false })
        .limit(10),
    ]).then(([membersRes, activeRes, monthlyRes, totalRes, recentRes]) => {
      setStats({
        totalMembers: membersRes.count || 0,
        activeMembers: activeRes.count || 0,
        monthlyRedemptions: monthlyRes.count || 0,
        totalRedemptions: totalRes.count || 0,
      })
      setRecentRedemptions((recentRes.data as unknown as RecentRedemption[]) || [])
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <Header title="דשבורד" />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 sm:h-32" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
          >
            <motion.div variants={item}>
              <StatsCard
                title="סך חברים"
                value={stats?.totalMembers || 0}
                icon={Users}
                iconColor="text-purple-600 bg-purple-100"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatsCard
                title="חברים פעילים"
                value={stats?.activeMembers || 0}
                icon={UserCheck}
                iconColor="text-green-600 bg-green-100"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatsCard
                title="מימושים החודש"
                value={stats?.monthlyRedemptions || 0}
                icon={CheckCircle}
                iconColor="text-yellow-600 bg-yellow-100"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatsCard
                title="סך מימושים"
                value={stats?.totalRedemptions || 0}
                icon={QrCode}
                iconColor="text-blue-600 bg-blue-100"
              />
            </motion.div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-2">
            <RedemptionChart />
          </div>

          <Card>
            <CardTitle>מימושים אחרונים</CardTitle>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : recentRedemptions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">אין מימושים עדיין</p>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {recentRedemptions.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {r.member?.full_name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {r.member?.phone}
                        </p>
                      </div>
                      <div className="text-left shrink-0">
                        <Badge variant="success">מומש</Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {r.redeemed_at ? formatRelativeDate(r.redeemed_at) : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
