'use client'

import Link from 'next/link'
import { Phone, Calendar, Award } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { formatDate, formatPhone } from '@/lib/utils/formatters'
import { ROUTES } from '@/constants/routes'
import type { Member } from '@/types'

interface MemberCardProps {
  member: Member
}

export function MemberCard({ member }: MemberCardProps) {
  return (
    <Link href={ROUTES.MEMBER_DETAILS(member.id)}>
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99]">
        <div className="flex items-start gap-3 sm:gap-4">
          <Avatar
            src={member.photo_url}
            name={member.full_name}
            size="lg"
            className="hidden sm:flex"
          />
          <Avatar
            src={member.photo_url}
            name={member.full_name}
            size="md"
            className="flex sm:hidden"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                {member.full_name}
              </h3>
              <Badge variant={member.is_active ? 'success' : 'default'}>
                {member.is_active ? 'פעיל' : 'לא פעיל'}
              </Badge>
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Phone size={14} className="shrink-0" />
                <span>{formatPhone(member.phone)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="shrink-0" />
                  <span className="text-xs sm:text-sm">הצטרף: {formatDate(member.joined_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={14} className="shrink-0" />
                  <span className="text-xs sm:text-sm">מימושים: {member.total_redemptions}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
