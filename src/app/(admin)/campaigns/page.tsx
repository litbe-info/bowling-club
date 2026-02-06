'use client'

import { useEffect, useState } from 'react'
import { Send, Calendar } from 'lucide-react'
import { Header } from '@/components/admin/Header'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime, getHebrewMonthYear } from '@/lib/utils/formatters'
import type { Campaign } from '@/types'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }: { data: Campaign[] | null }) => {
        setCampaigns(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <Header title="דיוורים" />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {loading ? (
          <div className="space-y-3 sm:space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 sm:h-24" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <EmptyState
            icon={Send}
            title="אין דיוורים"
            description="עדיין לא נשלחו דיוורים. שליחת דיוורים תהיה זמינה בקרוב."
          />
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} hover>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                      <Calendar size={20} className="text-purple-600 sm:hidden" />
                      <Calendar size={24} className="text-purple-600 hidden sm:block" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                        דיוור {getHebrewMonthYear(campaign.month, campaign.year)}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {campaign.sent_at
                          ? `נשלח: ${formatDateTime(campaign.sent_at)}`
                          : 'טרם נשלח'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <Badge variant={campaign.sent_at ? 'success' : 'warning'}>
                      {campaign.sent_at ? 'נשלח' : 'ממתין'}
                    </Badge>
                    <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">
                      {campaign.total_sent} חברים
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
