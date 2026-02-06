'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { Card, CardTitle, CardContent } from '@/components/ui/Card'
import { getHebrewMonth } from '@/lib/utils/formatters'
import { Skeleton } from '@/components/ui/Skeleton'

interface ChartData {
  month: string
  total: number
  redeemed: number
}

export function RedemptionChart() {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchData = async () => {
      const now = new Date()
      const months: ChartData[] = []

      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const month = date.getMonth() + 1
        const year = date.getFullYear()

        const { data: qrData } = await supabase
          .from('monthly_qr_codes')
          .select('is_redeemed')
          .eq('month', month)
          .eq('year', year)

        months.push({
          month: getHebrewMonth(month),
          total: qrData?.length || 0,
          redeemed: qrData?.filter((q: { is_redeemed: boolean }) => q.is_redeemed).length || 0,
        })
      }

      setData(months)
      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <Card>
      <CardTitle>מימושים ב-6 חודשים אחרונים</CardTitle>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={30} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  fontFamily: 'Rubik',
                  direction: 'rtl',
                }}
              />
              <Bar
                dataKey="total"
                name="נוצרו"
                fill="#e9d5ff"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="redeemed"
                name="מומשו"
                fill="#9333ea"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
