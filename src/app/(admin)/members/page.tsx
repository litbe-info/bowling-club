'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { UserPlus, Users } from 'lucide-react'
import { Header } from '@/components/admin/Header'
import { MemberCard } from '@/components/admin/MemberCard'
import { SearchBar } from '@/components/ui/SearchBar'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { ROUTES } from '@/constants/routes'
import { useMembers } from '@/lib/hooks/useMembers'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

type FilterType = 'all' | 'active' | 'inactive'

export default function MembersPage() {
  const { members, loading, fetchMembers } = useMembers()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value)
      fetchMembers(value, filter)
    },
    [fetchMembers, filter]
  )

  const handleFilter = useCallback(
    (newFilter: FilterType) => {
      setFilter(newFilter)
      fetchMembers(search, newFilter)
    },
    [fetchMembers, search]
  )

  useEffect(() => {
    fetchMembers(search, filter)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filters: { label: string; value: FilterType }[] = [
    { label: 'הכל', value: 'all' },
    { label: 'פעילים', value: 'active' },
    { label: 'לא פעילים', value: 'inactive' },
  ]

  return (
    <div>
      <Header
        title={`חברי מועדון (${members.length})`}
        actions={
          <Link href={ROUTES.MEMBER_NEW}>
            <Button size="sm" className="sm:hidden">
              <UserPlus size={18} />
            </Button>
            <Button className="hidden sm:flex">
              <UserPlus size={20} />
              הוסף חבר חדש
            </Button>
          </Link>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <SearchBar
            value={search}
            onChange={handleSearch}
            placeholder="חיפוש לפי שם או טלפון..."
            className="flex-1"
          />

          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => handleFilter(f.value)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === f.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 sm:space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 sm:h-24" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="אין חברי מועדון"
            description={
              search
                ? 'לא נמצאו תוצאות לחיפוש'
                : 'הוסף את חבר המועדון הראשון שלך'
            }
            action={
              !search ? (
                <Link href={ROUTES.MEMBER_NEW}>
                  <Button>
                    <UserPlus size={20} />
                    הוסף חבר חדש
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-2 sm:space-y-3"
          >
            {members.map((member) => (
              <motion.div key={member.id} variants={item}>
                <MemberCard member={member} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
