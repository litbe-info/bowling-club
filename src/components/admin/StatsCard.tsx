import { cn } from '@/lib/utils/cn'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: string
    positive: boolean
  }
  iconColor?: string
  className?: string
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  iconColor = 'text-purple-600 bg-purple-100',
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 sm:space-y-2 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString('he-IL') : value}
          </p>
          {trend && (
            <p
              className={cn(
                'text-xs sm:text-sm font-medium flex items-center gap-1',
                trend.positive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className={cn('p-2 sm:p-3 rounded-xl shrink-0', iconColor)}>
          <Icon size={20} className="sm:hidden" />
          <Icon size={24} className="hidden sm:block" />
        </div>
      </div>
    </div>
  )
}
